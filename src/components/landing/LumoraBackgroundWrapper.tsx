import React, { useState, useEffect, useCallback } from 'react';

export const LUMORA_VIDEOS = [
  {
    name: 'Golden Hour',
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081127_0992a171-d3c6-4978-8213-0ec5df8b6d63.mp4',
  },
  {
    name: 'Still Water',
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_092026_dd05b805-ea0f-40b2-8c52-332b88502592.mp4',
  },
  {
    name: 'Deep Woods',
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081042_df7202bf-bd80-4b2b-bbc6-1f09ba2870e9.mp4',
  },
  {
    name: 'Quiet Dawn',
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_080959_4cac5234-3573-464e-a5b7-76b94b8a7d61.mp4',
  },
];

const OVERLAY_IMAGE = 'https://soft-zoom-63098134.figma.site/_assets/v11/0b4a435b2df2747593c43d7a1c9b4578f7d8d90c.png';

interface Props {
  children?: React.ReactNode;
}

export default function LumoraBackgroundWrapper({ children }: Props) {
  const [activeVideo, setActiveVideo] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [blobUrls, setBlobUrls] = useState<string[]>([]);

  // Preload videos into blob URLs for instant smooth crossfade
  useEffect(() => {
    let cancelled = false;
    const preload = async () => {
      const urls = await Promise.all(
        LUMORA_VIDEOS.map(async (vid) => {
          try {
            const res = await fetch(vid.url);
            const blob = await res.blob();
            return URL.createObjectURL(blob);
          } catch {
            return vid.url;
          }
        })
      );
      if (!cancelled) setBlobUrls(urls);
    };
    preload();
    return () => { cancelled = true; };
  }, []);

  const handleSwitchVideo = useCallback((index: number) => {
    if (index === activeVideo || isTransitioning) return;
    setIsTransitioning(true);
    setActiveVideo(index);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 1000);
  }, [activeVideo, isTransitioning]);

  const isDeepWoods = activeVideo === 2;

  return (
    <div className={`relative w-full min-h-screen bg-black font-sans transition-colors duration-700 ${isDeepWoods ? 'text-[#182C41]' : 'text-white'}`}>
      
      {/* ── 1. Layer 0: 4 Stacked Background Videos with 1000ms opacity crossfade ── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-black">
        {LUMORA_VIDEOS.map((vid, idx) => (
          <video
            key={vid.url}
            autoPlay
            muted
            loop
            playsInline
            src={blobUrls[idx] || vid.url}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
              activeVideo === idx ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            aria-hidden="true"
          />
        ))}
      </div>

      {/* ── 2. Layer 1: Dark tint overlay ── */}
      <div className="fixed inset-0 z-[1] bg-black/40 pointer-events-none" />

      {/* ── 3. Layer 2: Transparent PNG Overlay with Train-Bob Animation ── */}
      <div className="fixed inset-0 z-[2] pointer-events-none overflow-hidden">
        <img
          src={OVERLAY_IMAGE}
          alt=""
          className="w-full h-full object-cover animate-train-bob"
          aria-hidden="true"
        />
      </div>

      {/* ── 4. Floating Video Switcher Control Bar ── */}
      <div className="relative z-30 pt-6 px-4 flex justify-center">
        <div className="inline-flex items-center gap-2 sm:gap-4 p-2 rounded-full liquid-glass border border-white/20 shadow-2xl backdrop-blur-md">
          {LUMORA_VIDEOS.map((vid, idx) => (
            <button
              key={vid.name}
              onClick={() => handleSwitchVideo(idx)}
              disabled={isTransitioning}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeVideo === idx
                  ? 'bg-white text-black font-bold shadow-lg scale-105'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {vid.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── 5. Layer 3: Foreground Sections Content ── */}
      <div className="relative z-20 w-full">
        {children}
      </div>
    </div>
  );
}
