import { useState, useEffect } from 'react';
import { useAppStore } from '../../../stores/appStore';
import { useContentCacheStore } from '../../../stores/contentCacheStore';
import { PodcastPlayer } from '../../../components/immersion/PodcastPlayer';
import type { PodcastEpisode } from '../../../curriculum/contentTypes';
import { Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ImmersionPodcastPage() {
  const currentLanguage = useAppStore((state) => state.currentLanguage);
  const [podcasts, setPodcasts] = useState<PodcastEpisode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Basic pagination state
  const [page, setPage] = useState(0);
  const limit = 1; // Show one podcast at a time for deep listening

  const getPodcasts = useContentCacheStore((state) => state.getPodcasts);

  useEffect(() => {
    let isMounted = true;
    
    const fetchPodcasts = async () => {
      try {
        const cacheKey = `${currentLanguage}_${limit}_${page * limit}`;
        const cachedEntry = useContentCacheStore.getState().podcasts[cacheKey];
        const isFresh = cachedEntry && cachedEntry.data && (Date.now() - cachedEntry.timestamp < 5 * 60 * 1000);
        
        // Only show loading spinner if data isn't fresh in cache
        if (!isFresh) {
          setIsLoading(true);
        }
        setError(null);
        
        // Fetch from Cache Store
        const data = await getPodcasts(currentLanguage, limit, page * limit);
        
        if (isMounted) {
          setPodcasts(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch podcasts');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchPodcasts();

    return () => { isMounted = false; };
  }, [currentLanguage, page, getPodcasts]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading high-fidelity audio content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">Connection Error</h2>
        <p className="text-slate-500 mt-2 max-w-md">{error}</p>
        <button 
          onClick={() => setPage(p => p)} // trigger re-render/fetch
          className="mt-6 px-6 py-2 bg-primary text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (!podcasts || podcasts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <h2 className="text-2xl font-bold text-slate-800">No Podcasts Available</h2>
        <p className="text-slate-500 mt-2 max-w-md">The Content Engine has not generated any podcasts for language '{currentLanguage}' on this page.</p>
        {page > 0 && (
          <button 
            onClick={() => setPage(p => Math.max(0, p - 1))}
            className="mt-6 px-6 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition"
          >
            Go Back
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="pb-20">
      <PodcastPlayer episode={podcasts[0]} />
      
      {/* Pagination Controls */}
      <div className="max-w-4xl mx-auto px-4 py-8 flex justify-between items-center border-t border-slate-100 mt-8">
        <button 
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
          className="flex items-center space-x-2 px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Previous Episode</span>
        </button>
        
        <div className="text-slate-400 font-medium">Episode {page + 1}</div>
        
        <button 
          onClick={() => setPage(p => p + 1)}
          className="flex items-center space-x-2 px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition"
        >
          <span>Next Episode</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
