import { useState, useEffect } from 'react';
import type { VocabularyItem, GrammarTopic } from '../types';
import { supabase } from '../lib/supabase';

// Action C: Frontend Refactor - Robust Asynchronous Data Fetching

/**
 * Custom hook to fetch vocabulary data asynchronously from Supabase.
 * Handles loading states, pagination, and error boundaries.
 */
export function useVocabulary(targetLanguageCode: string = 'vi', page: number = 1, limit: number = 20) {
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchVocabulary() {
      try {
        setIsLoading(true);
        setError(null);

        if (!supabase) throw new Error('Supabase is not configured');
        
        // Fetch target language ID
        const { data: langData, error: langError } = await supabase
          .from('languages')
          .select('id')
          .eq('code', targetLanguageCode)
          .single();

        if (langError) throw new Error(`Language fetch error: ${langError.message}`);
        
        const offset = (page - 1) * limit;

        // Fetch words joined with translations
        const { data, error: vocabError, count } = await supabase
          .from('vocabulary_words')
          .select(`
            id,
            word,
            part_of_speech,
            pronunciation,
            level,
            mastery_default,
            vocabulary_translations!inner(
              translation,
              example_sentence,
              example_translation
            )
          `, { count: 'exact' })
          .eq('vocabulary_translations.target_language_id', langData.id)
          .range(offset, offset + limit - 1);

        if (vocabError) throw new Error(`Vocabulary fetch error: ${vocabError.message}`);

        if (isMounted && data) {
          const formattedData: VocabularyItem[] = data.map((item: any) => ({
            id: item.id,
            word: item.word,
            partOfSpeech: item.part_of_speech,
            pronunciation: item.pronunciation,
            level: item.level,
            mastery: item.mastery_default,
            translation: item.vocabulary_translations[0].translation,
            example: item.vocabulary_translations[0].example_sentence,
            exampleTranslation: item.vocabulary_translations[0].example_translation
          }));

          setVocabulary(formattedData);
          setHasMore(count ? offset + limit < count : false);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Critical Failure in Data Pipeline:", err);
          setError(err.message || "Unknown error occurred while fetching vocabulary.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchVocabulary();

    return () => {
      isMounted = false;
    };
  }, [targetLanguageCode, page, limit]);

  return { vocabulary, isLoading, error, hasMore };
}

// Fallback empty array to prevent immediate crash in legacy synchronous imports 
// during the transition period until all consuming components are updated to use the hook.
export const vocabulary: VocabularyItem[] = [];

// Retaining grammarTopics for now as requested focus was specifically on multilingual vocabulary data
export const grammarTopics: GrammarTopic[] = [
  // Keeping first element to avoid compile errors in files not yet refactored
  {
    id: 'g1', title: 'Present Simple vs Present Continuous', description: 'When to use each present tense', level: 'A1 (Beginner)', isCompleted: true,
    explanation: 'Present Simple is used for habits, routines, and general truths. Present Continuous is used for actions happening right now or temporary situations.',
    examples: [
      { sentence: 'I study English every day.', translation: 'Tôi học tiếng Anh mỗi ngày.', highlight: 'study', explanation: 'Habit/routine → Present Simple' }
    ],
    exercises: [],
  }
];
