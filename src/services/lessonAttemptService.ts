import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { localDb } from '../lib/storage/localDatabase';

export const lessonAttemptService = {
  async logAttempt(userId: string, lessonId: string, courseId: string, score: number): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('lesson_attempts').insert({
        user_id: userId,
        lesson_id: lessonId,
        course_id: courseId,
        score
      });
      
      // Update learning_progress
      const { data } = await supabase
        .from('learning_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .single();
        
      if (data) {
        await supabase
          .from('learning_progress')
          .update({ completed_lessons: data.completed_lessons + 1 })
          .eq('id', data.id);
      } else {
        await supabase.from('learning_progress').insert({
          user_id: userId,
          course_id: courseId,
          completed_lessons: 1
        });
      }
      return;
    }
    
    // Local fallback
    localDb.insert<any>('lesson_attempts', {
      userId,
      lessonId,
      courseId,
      score,
      createdAt: new Date().toISOString()
    });
    
    const progress = localDb.findByField<any>('learning_progress', 'userId', userId)
      .find((p: any) => p.courseId === courseId);
      
    if (progress) {
      progress.completed_lessons = (progress.completed_lessons || 0) + 1;
      localDb.update('learning_progress', progress.id, progress);
    } else {
      localDb.insert<any>('learning_progress', {
        userId,
        courseId,
        completed_lessons: 1,
        createdAt: new Date().toISOString()
      });
    }
  },

  async getCourseProgress(userId: string, courseId: string): Promise<number> {
    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase
        .from('learning_progress')
        .select('completed_lessons')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .single();
      return data?.completed_lessons || 0;
    }
    const progress = localDb.findByField<any>('learning_progress', 'userId', userId)
      .find((p: any) => p.courseId === courseId);
    return progress?.completed_lessons || 0;
  },

  async logVocabularyMastery(userId: string, itemId: string, masteryDelta: number): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase.from('vocabulary_mastery').select('*').eq('user_id', userId).eq('item_id', itemId).single();
      if (data) {
        await supabase.from('vocabulary_mastery').update({ mastery_level: Math.min(100, data.mastery_level + masteryDelta) }).eq('id', data.id);
      } else {
        await supabase.from('vocabulary_mastery').insert({ user_id: userId, item_id: itemId, mastery_level: Math.max(0, masteryDelta) });
      }
      return;
    }
    localDb.insert<any>('vocabulary_mastery', { userId, itemId, masteryDelta, createdAt: new Date().toISOString() });
  },

  async logGrammarMastery(userId: string, topicId: string, masteryDelta: number): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase.from('grammar_mastery').select('*').eq('user_id', userId).eq('topic_id', topicId).single();
      if (data) {
        await supabase.from('grammar_mastery').update({ mastery_level: Math.min(100, data.mastery_level + masteryDelta) }).eq('id', data.id);
      } else {
        await supabase.from('grammar_mastery').insert({ user_id: userId, topic_id: topicId, mastery_level: Math.max(0, masteryDelta) });
      }
      return;
    }
    localDb.insert<any>('grammar_mastery', { userId, topicId, masteryDelta, createdAt: new Date().toISOString() });
  },

  async logReadingAttempt(userId: string, passageId: string, score: number, timeSpent: number): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('reading_attempts').insert({ user_id: userId, passage_id: passageId, score, time_spent_seconds: timeSpent });
      return;
    }
    localDb.insert<any>('reading_attempts', { userId, passageId, score, timeSpent, createdAt: new Date().toISOString() });
  },

  async logListeningAttempt(userId: string, taskId: string, score: number): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('listening_attempts').insert({ user_id: userId, task_id: taskId, score });
      return;
    }
    localDb.insert<any>('listening_attempts', { userId, taskId, score, createdAt: new Date().toISOString() });
  },

  async logSpeakingAttempt(userId: string, promptId: string, audioUrl: string | null, score: number, feedback: any): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('speaking_attempts').insert({ user_id: userId, prompt_id: promptId, audio_url: audioUrl, score, feedback });
      return;
    }
    localDb.insert<any>('speaking_attempts', { userId, promptId, audioUrl, score, feedback, createdAt: new Date().toISOString() });
  },

  async logWritingSubmission(userId: string, promptId: string, content: string, score: number, feedback: any): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('writing_submissions').insert({ user_id: userId, prompt_id: promptId, content, score, feedback });
      return;
    }
    localDb.insert<any>('writing_submissions', { userId, promptId, content, score, feedback, createdAt: new Date().toISOString() });
  }
};
