import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { supabase, isSupabaseConfigured } from '../lib/supabase.ts';
import { syncQueue } from '../services/syncQueueService';
import { createOwnerScopedStorage } from './srsOwnerStorage';
import { EventBus, SystemEvents } from '../lib/events/EventBus';
export interface MistakeItem {
  id: string;
  userId: string;
  type: 'Grammar' | 'Vocabulary' | 'Speaking' | 'Writing' | 'Reading' | 'Listening';
  mistake: string;
  correction: string;
  notes: string;
  languageId?: string;
  lessonId?: string;
  createdAt: string;
  sync_status?: 'synced' | 'pending';
}

interface MistakeNotebookState {
  mistakes: MistakeItem[];

  // Actions
  addMistake: (mistake: Omit<MistakeItem, 'id' | 'createdAt'>) => Promise<void>;
  removeMistake: (id: string) => Promise<void>;
  fetchMistakes: (userId: string) => Promise<void>;
  syncPendingMistakes: () => Promise<void>;
  clearMistakes: () => void;
  seedDefaultsIfNeeded: (userId: string) => void;
}

let activeMistakeNotebookOwnerId: string | null = null;
const mistakeNotebookStorage = createJSONStorage<MistakeNotebookState>(() => createOwnerScopedStorage(window.localStorage, () => window.localStorage.getItem('echlern_current_user_id')));

export const useMistakeNotebookStore = create<MistakeNotebookState>()(
  persist(
    (set, get) => ({
      mistakes: [] as MistakeItem[],

      fetchMistakes: async (userId: string) => {
        try {
          if (!supabase) throw new Error('Supabase is not configured');
          const { data, error } = await supabase
            .from('user_mistakes')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          if (!error && data) {
            const remoteMistakes: MistakeItem[] = data.map((row: any) => ({
              id: row.id,
              userId: row.user_id,
              type: row.type,
              mistake: row.mistake,
              correction: row.correction,
              notes: row.notes || '',
              languageId: row.language_id || undefined,
              lessonId: row.lesson_id || undefined,
              createdAt: row.created_at,
              sync_status: 'synced'
            }));
            
            // Merge with local pending mistakes
            const pendingMistakes = get().mistakes.filter((m: MistakeItem) => m.sync_status === 'pending');
            set({ mistakes: [...pendingMistakes, ...remoteMistakes] });
            
            // Attempt to sync pending mistakes now that we're online
            void get().syncPendingMistakes();
          }
        } catch (error) {
          console.error("Failed to fetch mistakes from Supabase", error);
        }
      },

      syncPendingMistakes: async () => {
        const { mistakes } = get();
        const pendingMistakes = mistakes.filter((m: MistakeItem) => m.sync_status === 'pending');
        
        if (pendingMistakes.length === 0) return;
        if (!supabase) return;

        try {
          const payload = pendingMistakes.map((mistake: MistakeItem) => ({
            id: mistake.id,
            user_id: mistake.userId,
            type: mistake.type,
            mistake: mistake.mistake,
            correction: mistake.correction,
            notes: mistake.notes,
            language_id: mistake.languageId,
            lesson_id: mistake.lessonId
          }));

          // Use upsert to prevent ID collision from blocking the entire queue
          const { error } = await supabase
            .from('user_mistakes')
            .upsert(payload, { onConflict: 'id' });

          if (!error) {
            set((state: MistakeNotebookState) => ({
              mistakes: state.mistakes.map((m: MistakeItem) => m.sync_status === 'pending' ? { ...m, sync_status: 'synced' } : m)
            }));
          } else {
            console.error(`Bulk sync rejected by server`, error);
          }
        } catch (error) {
          console.error(`Network or critical error during bulk sync`, error);
        }
      },

      addMistake: async (mistake: Omit<MistakeItem, 'id' | 'createdAt'>) => {
        const id = crypto.randomUUID();
        const newMistake: MistakeItem = {
          ...mistake,
          id,
          createdAt: new Date().toISOString(),
          sync_status: 'pending'
        };

        // Optimistic update
        set((state: MistakeNotebookState) => ({
          mistakes: [newMistake, ...state.mistakes]
        }));

        try {
          if (isSupabaseConfigured() && supabase) {
            await syncQueue.pushChange('user_mistakes', {
              id: newMistake.id,
              user_id: newMistake.userId,
              type: newMistake.type,
              mistake: newMistake.mistake,
              correction: newMistake.correction,
              notes: newMistake.notes,
              language_id: newMistake.languageId,
              lesson_id: newMistake.lessonId
            });
          }
          set((state: MistakeNotebookState) => ({
            mistakes: state.mistakes.map((m: MistakeItem) => m.id === id ? { ...m, sync_status: 'synced' } : m)
          }));
        } catch (error) {
          console.error("Network error during sync", error);
        }
      },

      removeMistake: async (id: string) => {
        // Find the exact mistake to preserve its data in case of rollback
        const mistakeToRestore = get().mistakes.find((m: MistakeItem) => m.id === id);
        if (!mistakeToRestore) return; // If it's already gone, do nothing
        
        // Optimistic update: Only remove the target ID
        set((state: MistakeNotebookState) => ({
          mistakes: state.mistakes.filter((m: MistakeItem) => m.id !== id)
        }));

        try {
          if (!supabase) throw new Error('Supabase is not configured');
          const { error } = await supabase
            .from('user_mistakes')
            .delete()
            .eq('id', id);
            
          if (error) {
            console.error("Failed to delete remote mistake", error);
            // Precise Rollback: Push the specific mistake back without touching new state changes
            set((state: MistakeNotebookState) => ({ 
              mistakes: [mistakeToRestore, ...state.mistakes] 
            }));
          }
        } catch (error) {
          console.error("Network error during delete", error);
          // Precise Rollback: Push the specific mistake back without touching new state changes
          set((state: MistakeNotebookState) => ({ 
            mistakes: [mistakeToRestore, ...state.mistakes] 
          }));
        }
      },

      clearMistakes: () => {
        set({ mistakes: [] });
      },
      
      seedDefaultsIfNeeded: (userId: string) => {
        const { mistakes } = get();
        if (mistakes.length === 0) {
          const defaults: MistakeItem[] = [
            { id: '1', userId, type: 'Grammar', mistake: 'I have went to the store yesterday.', correction: 'I went to the store yesterday.', notes: 'Dùng thì quá khứ đơn (went) vì có mốc thời gian rõ ràng "yesterday".', createdAt: new Date().toISOString(), sync_status: 'synced' },
            { id: '2', userId, type: 'Vocabulary', mistake: 'The environment is very polluted, it is ubiquitous.', correction: 'Pollution is ubiquitous in modern cities.', notes: '"Ubiquitous" có nghĩa là phổ biến ở khắp nơi, dùng để mô tả sự hiện diện.', createdAt: new Date().toISOString(), sync_status: 'synced' },
            { id: '3', userId, type: 'Speaking', mistake: 'Pronounced "chaos" as /tʃeɪ.ɒs/', correction: 'Pronounce "chaos" as /ˈkeɪ.ɒs/', notes: 'Âm "ch" trong chaos phát âm là âm /k/ mạnh.', createdAt: new Date().toISOString(), sync_status: 'synced' },
          ];
          set({ mistakes: defaults });
        }
      }
    }),
    {
      name: 'echlearn-mistake-notebook',
      storage: mistakeNotebookStorage,
    }
  )
);

export async function activateMistakeNotebookOwner(userId: string | null): Promise<void> {
  const normalizedUserId = userId?.trim() || null;
  if (activeMistakeNotebookOwnerId === normalizedUserId) return;
  activeMistakeNotebookOwnerId = normalizedUserId;
  useMistakeNotebookStore.setState({ mistakes: [] });
  await useMistakeNotebookStore.persist.rehydrate();
}

EventBus.on(SystemEvents.AUTH_USER_LOGGED_IN, (userId: string) => {
  activateMistakeNotebookOwner(userId).catch(console.error);
});

EventBus.on(SystemEvents.AUTH_USER_LOGGED_OUT, () => {
  activateMistakeNotebookOwner(null).catch(console.error);
});

