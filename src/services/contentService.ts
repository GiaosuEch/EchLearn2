import { supabase } from '../lib/supabase';
import type { DeepArticle, PodcastEpisode } from '../curriculum/contentTypes';

export const contentService = {
  async getArticles(language: string, limit: number = 10, offset: number = 0): Promise<DeepArticle[]> {
    if (!supabase) throw new Error('Supabase is not configured');
    const { data, error } = await supabase
      .from('immersion_articles')
      .select('*')
      .eq('language', language)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching articles:', error);
      throw error;
    }

    return (data || []).map(row => ({
      id: row.id,
      language: row.language,
      title: row.title,
      titleTranslation: row.title_translation,
      author: row.author,
      publication: row.publication,
      cefrMapping: row.cefr_mapping,
      wordCount: row.word_count,
      content: row.content,
      targetCollocations: row.target_collocations
    }));
  },

  async getPodcasts(language: string, limit: number = 10, offset: number = 0): Promise<PodcastEpisode[]> {
    if (!supabase) throw new Error('Supabase is not configured');
    const { data, error } = await supabase
      .from('immersion_podcasts')
      .select('*')
      .eq('language', language)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching podcasts:', error);
      throw error;
    }

    return (data || []).map(row => ({
      id: row.id,
      language: row.language,
      title: row.title,
      titleTranslation: row.title_translation,
      host: row.host,
      audioUrl: row.audio_url,
      cefrMapping: row.cefr_mapping,
      durationSec: row.duration_sec,
      transcript: row.transcript,
      targetCollocations: row.target_collocations
    }));
  }
};
