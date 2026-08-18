import React, { useState, useEffect } from 'react';
import type { PodcastEpisode, TranscriptChunk } from '../../curriculum/contentTypes';
import { TranscriptAligner } from '../../domain/immersion/TranscriptAligner';
import { Play, Pause, Mic, Rewind, FastForward, Headphones } from 'lucide-react';
import { LexicalResonanceEngine } from '../../domain/immersion/LexicalResonanceEngine';

export const PodcastPlayer: React.FC<{ episode: PodcastEpisode }> = ({ episode }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeChunk, setActiveChunk] = useState<TranscriptChunk | null>(null);
  const [isShadowing, setIsShadowing] = useState(false);
  

  // Mock audio ticking for simulation
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= episode.durationSec) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.1;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, episode.durationSec]);

  useEffect(() => {
    let isMounted = true;
    const fetchActiveChunk = async () => {
      const chunk = await TranscriptAligner.getActiveChunk(episode.transcript, currentTime);
      if (isMounted && chunk !== activeChunk) {
        setActiveChunk(chunk);
      }
    };
    fetchActiveChunk();
    return () => { isMounted = false; };
  }, [currentTime, episode.transcript, activeChunk]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const simulateShadowingFailure = async () => {
    if (!activeChunk) return;
    // Simulate user failing to pronounce the first phonetic gap correctly
    if (activeChunk.phoneticGaps && activeChunk.phoneticGaps.length > 0) {
      await LexicalResonanceEngine.processShadowingGap(
        'user-1',
        episode.language,
        activeChunk.phoneticGaps[0].word,
        activeChunk.text,
        episode.targetCollocations
      );
      alert(`Shadowing mismatch detected on word: "${activeChunk.phoneticGaps[0].word}". Logged to Mistake Notebook!`);
    } else {
      alert("Shadowing perfectly matched.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Player Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-slate-900 dark:text-white shadow-xl mb-8">
        <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-widest mb-4">
          <Headphones className="w-4 h-4" />
          <span>CEFR {episode.cefrMapping} Podcast Simulation</span>
        </div>
        <h1 className="text-3xl font-black mb-2 text-slate-900 dark:text-white">{episode.title}</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">{episode.host}</p>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition cursor-pointer">
              <Rewind className="w-6 h-6" />
            </button>
            <button 
              onClick={togglePlay}
              className="w-16 h-16 bg-emerald-600 hover:bg-emerald-500 rounded-full flex items-center justify-center text-white transition transform hover:scale-105 shadow-lg shadow-emerald-600/30 cursor-pointer"
            >
              {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
            </button>
            <button className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition cursor-pointer">
              <FastForward className="w-6 h-6" />
            </button>
          </div>
          
          <div className="text-xl font-mono text-slate-700 dark:text-slate-300">
            {currentTime.toFixed(1)}s / {episode.durationSec}s
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-8 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 transition-all duration-100 ease-linear"
            style={{ width: `${(currentTime / episode.durationSec) * 100}%` }}
          />
        </div>
      </div>

      {/* Shadowing Mode Toggle */}
      <div className="flex justify-between items-center mb-8 px-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Dynamic Transcript</h2>
        <button 
          onClick={() => setIsShadowing(!isShadowing)}
          className={`px-4 py-2 rounded-xl font-bold flex items-center space-x-2 transition ${isShadowing ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          <Mic className="w-5 h-5" />
          <span>{isShadowing ? 'Shadowing Active (Recording)' : 'Enable Shadowing'}</span>
        </button>
      </div>

      {isShadowing && (
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl mb-8 flex justify-between items-center">
          <div className="text-rose-800 font-medium text-sm">
            Speak along with the host. Phonetic gaps will be mapped to the Lexical Resonance Engine.
          </div>
          <button onClick={simulateShadowingFailure} className="px-3 py-1 bg-rose-200 text-rose-900 text-xs font-bold rounded-lg hover:bg-rose-300">
            Simulate Mistake
          </button>
        </div>
      )}

      {/* Transcript Scrolling View */}
      <div className="space-y-6 px-4">
        {episode.transcript.map((chunk) => {
          const isActive = activeChunk?.id === chunk.id;
          return (
            <div 
              key={chunk.id} 
              className={`p-6 rounded-2xl transition-all duration-300 ${isActive ? 'bg-white shadow-xl border-l-4 border-primary scale-[1.02]' : 'bg-slate-50 opacity-60'}`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-primary' : 'text-slate-400'}`}>
                  {chunk.speaker}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {chunk.startTimeSec}s
                </span>
              </div>
              <p className={`text-xl leading-relaxed ${isActive ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>
                {chunk.text}
              </p>
              {isActive && (
                <p className="mt-4 text-slate-500 italic border-l-2 border-slate-200 pl-3">
                  {chunk.translation}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
