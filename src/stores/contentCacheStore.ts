import { create } from 'zustand';
import type { DeepArticle, PodcastEpisode } from '../curriculum/contentTypes';
import { contentService } from '../services/contentService';

const STALE_TIME_MS = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 20; // Maximum number of paginated chunks to hold in memory

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  lastAccessed: number;
  promise?: Promise<T>; // For deduping simultaneous inflight requests
}

interface ContentCacheState {
  articles: Record<string, CacheEntry<DeepArticle[]>>;
  podcasts: Record<string, CacheEntry<PodcastEpisode[]>>;

  getArticles: (language: string, limit: number, offset: number) => Promise<DeepArticle[]>;
  getPodcasts: (language: string, limit: number, offset: number) => Promise<PodcastEpisode[]>;
}

// Utility to enforce LRU eviction
function enforceLRU<T>(cache: Record<string, CacheEntry<T>>): Record<string, CacheEntry<T>> {
  const keys = Object.keys(cache);
  if (keys.length <= MAX_CACHE_SIZE) return cache;

  // Sort keys by lastAccessed ascending (oldest first)
  keys.sort((a, b) => cache[a].lastAccessed - cache[b].lastAccessed);

  const keysToRemove = keys.slice(0, keys.length - MAX_CACHE_SIZE);
  const newCache = { ...cache };
  keysToRemove.forEach(k => delete newCache[k]);
  
  return newCache;
}

export const useContentCacheStore = create<ContentCacheState>((set, get) => ({
  articles: {},
  podcasts: {},

  getArticles: async (language: string, limit: number, offset: number) => {
    const key = `${language}_${limit}_${offset}`;
    const state = get();
    const entry = state.articles[key];

    const now = Date.now();
    
    // 1. Return cached data if fresh
    if (entry && entry.data && (now - entry.timestamp < STALE_TIME_MS)) {
      // Update lastAccessed for LRU
      set(s => ({
        articles: {
          ...s.articles,
          [key]: { ...s.articles[key], lastAccessed: now }
        }
      }));
      return entry.data;
    }

    // 2. Return existing inflight promise to deduplicate requests
    if (entry && entry.promise) {
      return entry.promise;
    }

    // 3. Fetch from DB, cache the promise, then cache the result
    const fetchPromise = contentService.getArticles(language, limit, offset).then(data => {
      set(s => {
        const updatedArticles = {
          ...s.articles,
          [key]: { data, timestamp: Date.now(), lastAccessed: Date.now() }
        };
        return { articles: enforceLRU(updatedArticles) };
      });
      return data;
    });

    set(s => ({
      articles: {
        ...s.articles,
        [key]: { 
          data: entry?.data || [], 
          timestamp: entry?.timestamp || 0, 
          lastAccessed: now, 
          promise: fetchPromise 
        }
      }
    }));

    return fetchPromise;
  },

  getPodcasts: async (language: string, limit: number, offset: number) => {
    const key = `${language}_${limit}_${offset}`;
    const state = get();
    const entry = state.podcasts[key];

    const now = Date.now();
    
    // 1. Return cached data if fresh
    if (entry && entry.data && (now - entry.timestamp < STALE_TIME_MS)) {
      set(s => ({
        podcasts: {
          ...s.podcasts,
          [key]: { ...s.podcasts[key], lastAccessed: now }
        }
      }));
      return entry.data;
    }

    // 2. Return existing inflight promise to deduplicate requests
    if (entry && entry.promise) {
      return entry.promise;
    }

    // 3. Fetch from DB, cache the promise, then cache the result
    const fetchPromise = contentService.getPodcasts(language, limit, offset).then(data => {
      set(s => {
        const updatedPodcasts = {
          ...s.podcasts,
          [key]: { data, timestamp: Date.now(), lastAccessed: Date.now() }
        };
        return { podcasts: enforceLRU(updatedPodcasts) };
      });
      return data;
    });

    set(s => ({
      podcasts: {
        ...s.podcasts,
        [key]: { 
          data: entry?.data || [], 
          timestamp: entry?.timestamp || 0, 
          lastAccessed: now, 
          promise: fetchPromise 
        }
      }
    }));

    return fetchPromise;
  }
}));
