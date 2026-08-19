import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase.ts';
import { syncQueue } from '../services/syncQueueService';
import { EventBusService, SystemEvents } from '../lib/events/EventBus';
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
  ownerId: string | null;

  // Actions
  addMistake: (mistake: Omit<MistakeItem, 'id' | 'createdAt'>) => Promise<void>;
  removeMistake: (id: string) => Promise<void>;
  fetchMistakes: (userId: string) => Promise<void>;
  syncPendingMistakes: () => Promise<void>;
  clearMistakes: () => void;
  seedDefaultsIfNeeded: () => void;
}

export const useMistakeNotebookStore = create<MistakeNotebookState>()(
  (set, get) => ({
    mistakes: [] as MistakeItem[],
    ownerId: null,

      fetchMistakes: async (userId: string) => {
        set({ ownerId: userId });
        if (!supabase) return;
        try {
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
          if (!supabase) return;
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

      clearMistakes: () => set({ mistakes: [], ownerId: null }),
      
      seedDefaultsIfNeeded: () => {
        // Fetched directly from backend now
      }
    })
);

export async function activateMistakeNotebookOwner(userId: string | null): Promise<void> {
  const normalizedUserId = userId?.trim() || null;
  const currentOwnerId = useMistakeNotebookStore.getState().ownerId;
  
  if (currentOwnerId === normalizedUserId) return;
  
  useMistakeNotebookStore.getState().clearMistakes();
  if (normalizedUserId) {
    await useMistakeNotebookStore.getState().fetchMistakes(normalizedUserId);
  }
}

export function attachMistakeNotebookEvents(eventBus: EventBusService) {
  eventBus.on(SystemEvents.AUTH_USER_LOGGED_IN, (userId: string) => {
    activateMistakeNotebookOwner(userId).catch(console.error);
  });

  eventBus.on(SystemEvents.AUTH_USER_LOGGED_OUT, () => {
    activateMistakeNotebookOwner(null).catch(console.error);
  });
}
