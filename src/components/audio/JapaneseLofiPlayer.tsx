import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, Volume2, VolumeX, ListMusic, ChevronDown, ChevronUp, Sparkles, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CustomEmoji } from '../common/CustomEmoji';

export type LofiTrack = {
  id: string;
  title: string;
  artist: string;
  src: string;
  notes: string;
};

export type SpotifyLofiPlaylist = {
  id: string;
  name: string;
  subtitle: string;
  embedUrl: string;
  spotifyUri: string;
};

export const SPOTIFY_LOFI_PLAYLISTS: SpotifyLofiPlaylist[] = [
  {
    id: 'lofi-beats-official',
    name: '☕ Spotify Official Lofi Beats',
    subtitle: 'Giai điệu học tập tập trung sâu từ Spotify',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator',
    spotifyUri: 'spotify:playlist:37i9dQZF1DXcBWIGoYBM5M',
  },
  {
    id: 'chill-study-session',
    name: '📖 Chill Lofi Study Session',
    subtitle: 'Nhạc Lofi Piano không lời tập trung đọc viết',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX8Ueb90mY6hP?utm_source=generator',
    spotifyUri: 'spotify:playlist:37i9dQZF1DX8Ueb90mY6hP',
  },
  {
    id: 'tokyo-lofi-jazz',
    name: '🌸 Jazzy Lofi & Tokyo Beats',
    subtitle: 'Giai điệu Lofi Chillhop mượt mà',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXdLEN7aqioXM?utm_source=generator',
    spotifyUri: 'spotify:playlist:37i9dQZF1DXdLEN7aqioXM',
  },
  {
    id: 'soft-lofi-sleep',
    name: '🌙 Deep Focus Lofi Piano',
    subtitle: 'Giai điệu thư giãn nhẹ nhàng',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4t95P98aYsM?utm_source=generator',
    spotifyUri: 'spotify:playlist:37i9dQZF1DX4t95P98aYsM',
  },
];

export const JAPANESE_LOFI_TRACKS: LofiTrack[] = [
  {
    id: 'beneath-the-rain',
    title: '🌧️ Beneath the Rain (Lofi Study Beats)',
    artist: 'Instrumental Rain Lofi Piano',
    src: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
    notes: 'Soothing rain drops with soft Japanese lofi piano.'
  },
  {
    id: 'lofi-girl-study',
    title: '🎧 Lofi Girl — Peaceful Study Session',
    artist: 'Chilled Lofi Instrumental Beats',
    src: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=chill-lofi-song-8444.mp3',
    notes: 'Iconic peaceful lofi beats for deep study focus.'
  },
  {
    id: 'ghibli-spirited-away',
    title: '🏮 Spirited Away — One Summer Day Lofi',
    artist: 'Studio Ghibli Chill Hop',
    src: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a815a3.mp3?filename=lofi-orchestral-10903.mp3',
    notes: 'Nostalgic Joe Hisaishi piano lofi remade.'
  },
  {
    id: 'kyoto-rain-cafe',
    title: '🍵 Rainy Cafe in Kyoto',
    artist: 'Japanese Coffee Lofi',
    src: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f792e9.mp3?filename=coffee-chill-lofi-1234.mp3',
    notes: 'Warm coffee shop ambience & soft jazz beats.'
  },
];

export function JapaneseLofiPlayer() {
  const [activeTab, setActiveTab] = useState<'spotify' | 'stream'>('spotify');
  const [selectedSpotifyIndex, setSelectedSpotifyIndex] = useState(0);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isListeningTaskActive, setIsListeningTaskActive] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [_useSynth, setUseSynth] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthContextRef = useRef<AudioContext | null>(null);
  const synthTimerRef = useRef<any>(null);

  const currentTrack = JAPANESE_LOFI_TRACKS[currentTrackIndex];
  const currentSpotify = SPOTIFY_LOFI_PLAYLISTS[selectedSpotifyIndex];

  // Web Audio API Synth Generator
  const startSynthLofi = () => {
    try {
      setUseSynth(true);
      if (!synthContextRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        synthContextRef.current = new AudioCtx();
      }
      const ctx = synthContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const pentatonicNotes = [220, 261.63, 329.63, 392.00, 493.88, 587.33];

      const playLofiChord = () => {
        if (!synthContextRef.current || synthContextRef.current.state !== 'running') return;
        const now = ctx.currentTime;
        const activeVol = isMuted ? 0 : volume;

        const selectedFreqs = [
          pentatonicNotes[0],
          pentatonicNotes[2],
          pentatonicNotes[Math.floor(Math.random() * 3) + 3]
        ];

        selectedFreqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = idx === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.06 * activeVol, now + 1.2);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 5.5);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.25);
          osc.stop(now + 6.0);
        });
      };

      playLofiChord();
      if (synthTimerRef.current) clearInterval(synthTimerRef.current);
      synthTimerRef.current = setInterval(playLofiChord, 5500);
    } catch (e) {
      console.warn('Synth Lofi fallback failed:', e);
    }
  };

  const stopSynthLofi = () => {
    if (synthTimerRef.current) {
      clearInterval(synthTimerRef.current);
      synthTimerRef.current = null;
    }
    if (synthContextRef.current) {
      synthContextRef.current.suspend();
    }
    setUseSynth(false);
  };

  const togglePlay = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.volume = isMuted ? 0 : volume;
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.warn('Audio play error, using Web Audio Synth Lofi:', error);
            startSynthLofi();
          });
        }
      } else {
        startSynthLofi();
      }
    } else {
      setIsPlaying(false);
      if (audioRef.current) audioRef.current.pause();
      stopSynthLofi();
    }
  };

  const nextTrack = () => {
    stopSynthLofi();
    const nextIdx = (currentTrackIndex + 1) % JAPANESE_LOFI_TRACKS.length;
    setCurrentTrackIndex(nextIdx);
    if (isPlaying) {
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(() => startSynthLofi());
        } else {
          startSynthLofi();
        }
      }, 100);
    }
  };

  const selectTrack = (index: number) => {
    stopSynthLofi();
    setCurrentTrackIndex(index);
    setShowPlaylist(false);
    setIsPlaying(true);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play().catch(() => startSynthLofi());
      } else {
        startSynthLofi();
      }
    }, 100);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    const handleListeningTaskActivity = (event: Event) => {
      const isActive = (event as CustomEvent<{ active?: boolean }>).detail?.active === true;
      setIsListeningTaskActive(isActive);

      if (isActive) {
        audioRef.current?.pause();
        stopSynthLofi();
        setIsPlaying(false);
        setIsExpanded(false);
      }
    };

    window.addEventListener('echlern:listening-task-activity', handleListeningTaskActivity);
    return () => window.removeEventListener('echlern:listening-task-activity', handleListeningTaskActivity);
  }, []);

  useEffect(() => {
    return () => {
      if (synthTimerRef.current) clearInterval(synthTimerRef.current);
      if (synthContextRef.current) {
        synthContextRef.current.close().catch(() => {});
        synthContextRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src');
        audioRef.current.load();
      }
    };
  }, []);

  if (isListeningTaskActive) return null;

  return (
    <div className="fixed bottom-20 right-4 sm:right-6 z-50 select-none">
      {/* Hidden HTML5 Audio Element */}
      <audio
        ref={audioRef}
        src={currentTrack.src}
        preload="auto"
        onEnded={nextTrack}
        onError={() => {
          if (isPlaying) startSynthLofi();
        }}
      />

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-3 w-84 sm:w-96 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-5 backdrop-blur-2xl shadow-2xl text-slate-900 dark:text-white font-sans"
          >
            {/* Player Mode Switcher: Spotify vs Direct Stream */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                <button
                  onClick={() => setActiveTab('spotify')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'spotify'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Radio size={14} /> Spotify Live
                </button>
                <button
                  onClick={() => setActiveTab('stream')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'stream'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Sparkles size={14} /> MP3 Stream
                </button>
              </div>

              {activeTab === 'stream' && (
                <button
                  onClick={() => setShowPlaylist(!showPlaylist)}
                  aria-label={showPlaylist ? 'Hide lofi playlist' : 'Show lofi playlist'}
                  className="flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <ListMusic size={14} />
                  <span>Danh Sách</span>
                </button>
              )}
            </div>

            {/* TAB 1: SPOTIFY OFFICIAL LOFI EMBED PLAYER */}
            {activeTab === 'spotify' && (
              <div className="space-y-4">
                <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                  {SPOTIFY_LOFI_PLAYLISTS.map((pl, idx) => (
                    <button
                      key={pl.id}
                      onClick={() => setSelectedSpotifyIndex(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                        idx === selectedSpotifyIndex
                          ? 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-black'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400'
                      }`}
                    >
                      {pl.name}
                    </button>
                  ))}
                </div>

                <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 bg-slate-950">
                  <iframe
                    title="Spotify Lofi Player"
                    src={currentSpotify.embedUrl}
                    width="100%"
                    height="152"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="rounded-2xl"
                  />
                </div>
                <button
                  onClick={() => setActiveTab('stream')}
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/10 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
                >
                  <Sparkles size={13} className="text-emerald-500" />
                  <span>Nghe MP3 Trực Tiếp (Không Cần Spotify)</span>
                </button>
                <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 text-center font-medium">
                  <CustomEmoji name="blob-heart" size={13} />
                  Bản quyền Spotify Official Lofi Girl &amp; Japanese Chillhop Playlists
                </p>
              </div>
            )}

            {/* TAB 2: DIRECT MP3 & SYNTH LOFI STREAM */}
            {activeTab === 'stream' && (
              <>
                {showPlaylist ? (
                  <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 font-mono text-xs">
                    {JAPANESE_LOFI_TRACKS.map((track, idx) => (
                      <button
                        key={track.id}
                        onClick={() => selectTrack(idx)}
                        className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between ${
                          idx === currentTrackIndex
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 font-bold border border-emerald-500/30'
                            : 'bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="truncate">
                          <p className="truncate font-bold">{track.title}</p>
                          <p className="text-[10px] text-slate-400 truncate">{track.artist}</p>
                        </div>
                        {idx === currentTrackIndex && isPlaying && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1">
                      <p className="font-extrabold text-sm text-slate-900 dark:text-white truncate">{currentTrack.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">{currentTrack.artist}</p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 italic pt-1">{currentTrack.notes}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsMuted(!isMuted)}
                          aria-label={isMuted ? 'Unmute lofi music' : 'Mute lofi music'}
                          className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                        >
                          {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={isMuted ? 0 : volume}
                          aria-label="Lofi music volume"
                          onChange={(e) => {
                            setVolume(parseFloat(e.target.value));
                            setIsMuted(false);
                          }}
                          className="w-20 accent-emerald-500 cursor-pointer h-1.5 rounded-lg bg-slate-200 dark:bg-slate-800"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={togglePlay}
                          aria-label={isPlaying ? 'Pause lofi music' : 'Play lofi music'}
                          title={isPlaying ? 'Pause lofi music' : 'Play lofi music'}
                          className="grid h-12 w-12 place-items-center rounded-full bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 hover:scale-105 transition-transform font-bold cursor-pointer"
                        >
                          {isPlaying ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
                        </button>
                        <button
                          onClick={nextTrack}
                          aria-label="Play next lofi track"
                          className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors p-2 cursor-pointer"
                        >
                          <SkipForward size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label={isExpanded ? 'Close lofi music player' : 'Open lofi music player'}
        className="flex items-center gap-3 px-5 py-3 rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono text-xs font-bold shadow-xl shadow-slate-900/10 hover:border-emerald-500 transition-all backdrop-blur-xl group cursor-pointer"
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
          {activeTab === 'spotify' ? <Radio size={14} /> : (isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />)}
        </span>
        <span className="truncate max-w-[150px] text-emerald-700 dark:text-emerald-300 font-sans font-bold">
          {activeTab === 'spotify' ? currentSpotify.name : (isPlaying ? currentTrack.title : '📻 Nhạc Chill Lofi')}
        </span>
        {isExpanded ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronUp size={16} className="text-slate-400" />}
      </button>
    </div>
  );
}

export default JapaneseLofiPlayer;
