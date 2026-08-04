import type { ReactNode } from 'react';

/**
 * Discord-style custom emoji set.
 *
 * Why this exists: the app was rendering the OS emoji font (the round yellow
 * Windows/macOS glyphs) inline in JSX — `🔥`, `⭐`, `🎁`, `📚`. Those render
 * differently on every platform, cannot be recoloured, and clash with the flat
 * Duolingo look. Every emoji here is either
 *   - a local mascot raster already shipped in `public/mascots/`, or
 *   - a hand-drawn flat SVG in the Discord "blob" idiom (solid fills only, no
 *     gradients, no OS font dependency).
 *
 * Deliberately NOT fetched from discadia.com at runtime: those files are
 * third-party assets we do not have redistribution rights to, and a CDN
 * dependency would make every badge in the sidebar a network request. The
 * shapes below are original work in the same visual language.
 */
export type CustomEmojiName =
  // Mascot rasters
  | 'ech-buri'
  | 'ech-buri-study'
  | 'ech-buri-celebrate'
  | 'ech-buri-think'
  | 'ech-buri-tutor'
  | 'ech-buri-sad'
  // Blob reactions
  | 'blob-happy'
  | 'blob-sad'
  | 'blob-think'
  | 'blob-cheer'
  | 'blob-heart'
  | 'blob-fire'
  | 'blob-cool'
  // Gamification
  | 'streak-fire'
  | 'xp-star'
  | 'xp-bolt'
  | 'league-crown'
  | 'trophy-gold'
  | 'gem-blue'
  | 'coin-gold'
  | 'heart-life'
  | 'gift-chest'
  | 'verified-check'
  | 'sparkles-badge'
  | 'ielts-target'
  | 'graduation-cap'
  | 'brain-grammar'
  | 'owl-night'
  | 'butterfly-social'
  | 'speaker-audio'
  | 'arrow-hint'
  | 'wave-hello'
  | 'note-write'
  | 'cross-error'
  | 'lightbulb-tip'
  | 'party-popper'
  | 'film-clip'
  | 'puzzle-piece'
  | 'moon-dark'
  | 'inbox-in'
  | 'inbox-out'
  // Skill icons
  | 'skill-book'
  | 'skill-mic'
  | 'skill-headphones'
  | 'skill-pencil'
  | 'skill-target';

export interface CustomEmojiProps {
  name: CustomEmojiName;
  size?: number;
  /** Accessible label. Defaults to decorative (aria-hidden). */
  label?: string;
  className?: string;
  /** Adds the subtle Discord hover-pop. Off inside dense lists. */
  interactive?: boolean;
}

const MASCOT_SOURCES: Partial<Record<CustomEmojiName, string>> = {
  'ech-buri': '/mascots/ech_buri_duolingo_mascot_flat.png',
  'ech-buri-study': '/mascots/ech_buri_study_companion.png',
  'ech-buri-celebrate': '/mascots/pepe_mascot_celebrate.png',
  'ech-buri-think': '/mascots/pepe_mascot_thinking.png',
  'ech-buri-tutor': '/mascots/pepe_mascot_tutor.png',
  'ech-buri-sad': '/mascots/pepe_mascot_sad.png',
};

/** Discord blob palette — flat, no gradients. */
const BLOB = '#fcc21b';
const BLOB_DARK = '#e0a300';
const INK = '#2b2118';

function BlobBase({ children, mouth }: { children?: ReactNode; mouth: ReactNode }) {
  return (
    <>
      <path
        d="M6 20c0-8.5 6-14 18-14s18 5.5 18 14c0 9.5-7.5 16-18 16S6 29.5 6 20Z"
        fill={BLOB}
        stroke={BLOB_DARK}
        strokeWidth="2"
      />
      {children}
      {mouth}
    </>
  );
}

const BlobEyes = ({ cy = 19 }: { cy?: number }) => (
  <>
    <ellipse cx="18" cy={cy} rx="2.6" ry="3.4" fill={INK} />
    <ellipse cx="30" cy={cy} rx="2.6" ry="3.4" fill={INK} />
  </>
);

/** Every glyph draws inside a 48×48 box so `size` scales uniformly. */
const SVG_GLYPHS: Partial<Record<CustomEmojiName, ReactNode>> = {
  'blob-happy': (
    <BlobBase mouth={<path d="M18 26q6 6 12 0" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />}>
      <BlobEyes />
    </BlobBase>
  ),
  'blob-sad': (
    <BlobBase mouth={<path d="M18 29q6-5 12 0" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />}>
      <BlobEyes cy={20} />
      <path d="M17 24.5v5" stroke="#4aa3f0" strokeWidth="2.4" strokeLinecap="round" />
    </BlobBase>
  ),
  'blob-think': (
    <BlobBase mouth={<path d="M19 27h8" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />}>
      <ellipse cx="18" cy="19" rx="2.6" ry="3.4" fill={INK} />
      <path d="M27 17.5q3-2.5 6 0" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="38" cy="11" r="3" fill="#ffffff" stroke={BLOB_DARK} strokeWidth="1.6" />
      <circle cx="43" cy="6.5" r="1.8" fill="#ffffff" stroke={BLOB_DARK} strokeWidth="1.4" />
    </BlobBase>
  ),
  'blob-cheer': (
    <BlobBase mouth={<ellipse cx="24" cy="27" rx="5" ry="4.5" fill={INK} />}>
      <BlobEyes cy={18} />
      <path d="M8 14 3 8" stroke={BLOB_DARK} strokeWidth="2.8" strokeLinecap="round" />
      <path d="M40 14 45 8" stroke={BLOB_DARK} strokeWidth="2.8" strokeLinecap="round" />
    </BlobBase>
  ),
  'blob-heart': (
    <BlobBase mouth={<path d="M18 26q6 5 12 0" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />}>
      <path d="M18 20.5c0-1.7 1.4-2.8 2.8-2.8 1 0 1.8.5 2.2 1.2.4-.7 1.2-1.2 2.2-1.2 1.4 0 2.8 1.1 2.8 2.8 0 2.4-3.6 4.5-5 5.4-1.4-.9-5-3-5-5.4Z" fill="#f2555a" transform="translate(-6 -3)" />
      <path d="M18 20.5c0-1.7 1.4-2.8 2.8-2.8 1 0 1.8.5 2.2 1.2.4-.7 1.2-1.2 2.2-1.2 1.4 0 2.8 1.1 2.8 2.8 0 2.4-3.6 4.5-5 5.4-1.4-.9-5-3-5-5.4Z" fill="#f2555a" transform="translate(7 -3)" />
    </BlobBase>
  ),
  'blob-fire': (
    <BlobBase mouth={<path d="M19 27h10" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />}>
      <BlobEyes cy={20} />
      <path d="M24 2c3 3.5 5 6 5 8.5a5 5 0 0 1-10 0C19 8 21 5.5 24 2Z" fill="#ff7a1a" />
    </BlobBase>
  ),
  'blob-cool': (
    <BlobBase mouth={<path d="M18 27q6 4 12 0" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />}>
      <rect x="11" y="15" width="26" height="8" rx="3" fill={INK} />
      <path d="M11 17h26" stroke={BLOB} strokeWidth="1.4" />
    </BlobBase>
  ),

  'streak-fire': (
    <>
      <path d="M24 3c7 8 12 13.5 12 19.5A12 12 0 0 1 12 22.5C12 16.5 17 11 24 3Z" fill="#ff6b00" />
      <path d="M24 14c3.5 4.5 6 7.5 6 10.5a6 6 0 0 1-12 0c0-3 2.5-6 6-10.5Z" fill="#ffd23f" />
      <path d="M20 39h8" stroke="#c2410c" strokeWidth="3" strokeLinecap="round" />
      <path d="M17 44h14" stroke="#c2410c" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  'xp-star': (
    <>
      <path d="M24 4l5.9 12.4 13.6 1.9-9.9 9.5 2.4 13.5L24 34.8 12 41.3l2.4-13.5L4.5 18.3l13.6-1.9L24 4Z" fill="#ffc800" stroke="#e0a300" strokeWidth="2" />
      <path d="M24 12l3 6.5 7 1-5 4.8 1.2 7L24 28l-6.2 3.3 1.2-7-5-4.8 7-1L24 12Z" fill="#ffe066" />
    </>
  ),
  'xp-bolt': (
    <>
      <path d="M27 3 11 26h9l-3 19 20-25h-10l4-17H27Z" fill="#ffc800" stroke="#e0a300" strokeWidth="2" strokeLinejoin="round" />
    </>
  ),
  'league-crown': (
    <>
      <path d="M5 33 8 12l9 8 7-13 7 13 9-8 3 21H5Z" fill="#ffc800" stroke="#c98a00" strokeWidth="2" strokeLinejoin="round" />
      <rect x="5" y="33" width="38" height="8" rx="3" fill="#e0a300" stroke="#c98a00" strokeWidth="2" />
      <circle cx="17" cy="37" r="2.2" fill="#f2555a" />
      <circle cx="24" cy="37" r="2.2" fill="#4aa3f0" />
      <circle cx="31" cy="37" r="2.2" fill="#58cc02" />
    </>
  ),
  'trophy-gold': (
    <>
      <path d="M13 6h22v11a11 11 0 0 1-22 0V6Z" fill="#ffc800" stroke="#c98a00" strokeWidth="2" />
      <path d="M13 9H7v4a7 7 0 0 0 6 6.9" fill="none" stroke="#c98a00" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M35 9h6v4a7 7 0 0 1-6 6.9" fill="none" stroke="#c98a00" strokeWidth="2.6" strokeLinecap="round" />
      <rect x="21" y="27" width="6" height="8" fill="#e0a300" />
      <rect x="13" y="35" width="22" height="7" rx="2.5" fill="#e0a300" stroke="#c98a00" strokeWidth="2" />
    </>
  ),
  'gem-blue': (
    <>
      <path d="M14 6h20l10 12-20 24L4 18 14 6Z" fill="#4aa3f0" stroke="#1d6fb8" strokeWidth="2" strokeLinejoin="round" />
      <path d="M14 6l10 12L34 6" fill="none" stroke="#8fd0ff" strokeWidth="2" />
      <path d="M4 18h40" stroke="#8fd0ff" strokeWidth="2" />
      <path d="M24 18v24" stroke="#1d6fb8" strokeWidth="2" />
    </>
  ),
  'coin-gold': (
    <>
      <circle cx="24" cy="24" r="19" fill="#ffc800" stroke="#c98a00" strokeWidth="2.5" />
      <circle cx="24" cy="24" r="13" fill="#ffe066" stroke="#e0a300" strokeWidth="2" />
      <path d="M24 15v18M19.5 19.5h9M19.5 28.5h9" stroke="#c98a00" strokeWidth="2.6" strokeLinecap="round" />
    </>
  ),
  'heart-life': (
    <>
      <path d="M24 42S5 30 5 18.5A10.5 10.5 0 0 1 24 12a10.5 10.5 0 0 1 19 6.5C43 30 24 42 24 42Z" fill="#ff4b4b" stroke="#c81e1e" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M14 17.5a5.5 5.5 0 0 1 5-4" fill="none" stroke="#ff9d9d" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  'gift-chest': (
    <>
      <rect x="5" y="19" width="38" height="23" rx="3" fill="#58cc02" stroke="#3f9c01" strokeWidth="2.5" />
      <rect x="3" y="12" width="42" height="9" rx="3" fill="#7ee01f" stroke="#3f9c01" strokeWidth="2.5" />
      <rect x="20" y="12" width="8" height="30" fill="#ffc800" stroke="#c98a00" strokeWidth="2" />
      <path d="M24 12c-4-1-8-3-8-6s5-3 8 6c3-9 8-9 8-6s-4 5-8 6Z" fill="#ffc800" stroke="#c98a00" strokeWidth="2" strokeLinejoin="round" />
    </>
  ),
  'verified-check': (
    <>
      <path d="M24 3l5 4.5 6.6-1 1.9 6.4 6 3-1.9 6.4L45 28l-4.5 5 1 6.6-6.4 1.9-3 6-6.4-1.9L24 45l-5-4.4-6.6 1L10.5 35 4.5 32 6.4 25.6 3 20l4.4-5-1-6.6L12.8 6.5l3-6L22.2 2.4 24 3Z" fill="#58cc02" stroke="#3f9c01" strokeWidth="1.8" />
      <path d="M16 24.5l5.5 5.5L33 18.5" fill="none" stroke="#ffffff" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  'sparkles-badge': (
    <>
      <path d="M18 4l3.6 8.4L30 16l-8.4 3.6L18 28l-3.6-8.4L6 16l8.4-3.6L18 4Z" fill="#4aa3f0" stroke="#1d6fb8" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M35 24l2.2 5.1L42 31l-4.8 1.9L35 38l-2.2-5.1L28 31l4.8-1.9L35 24Z" fill="#8fd0ff" stroke="#1d6fb8" strokeWidth="1.6" strokeLinejoin="round" />
    </>
  ),
  'ielts-target': (
    <>
      <circle cx="24" cy="24" r="19" fill="#ffffff" stroke="#7c3aed" strokeWidth="2.5" />
      <circle cx="24" cy="24" r="13" fill="#c4b5fd" stroke="#7c3aed" strokeWidth="2" />
      <circle cx="24" cy="24" r="6.5" fill="#7c3aed" />
      <path d="M24 24 42 6" stroke="#f2555a" strokeWidth="3" strokeLinecap="round" />
      <path d="M36 6h7v7" fill="none" stroke="#f2555a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),

  'graduation-cap': (
    <>
      <path d="M24 7 3 16l21 9 21-9-21-9Z" fill="#2b2118" stroke="#000000" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 21v10c0 3.3 5.4 6 12 6s12-2.7 12-6V21" fill="#4a3a2a" stroke="#000000" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M42 18.5V31" stroke="#ffc800" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="42" cy="33" r="3" fill="#ffc800" />
    </>
  ),
  'brain-grammar': (
    <>
      <path d="M22 8c-6 0-10 3.6-10 8 0 1-3 2.4-3 6s3 5 3 6.6c0 4 3.6 7.4 10 7.4V8Z" fill="#f9a8c4" stroke="#c2185b" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M26 8c6 0 10 3.6 10 8 0 1 3 2.4 3 6s-3 5-3 6.6c0 4-3.6 7.4-10 7.4V8Z" fill="#f472a6" stroke="#c2185b" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M24 8v28" stroke="#c2185b" strokeWidth="2" />
      <path d="M17 17q4 2 4 6M31 17q-4 2-4 6" fill="none" stroke="#c2185b" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  'owl-night': (
    <>
      <path d="M24 6c9 0 15 7 15 16s-6 16-15 16S9 31 9 22 15 6 24 6Z" fill="#8b6f47" stroke="#5a4630" strokeWidth="2.2" />
      <circle cx="17.5" cy="20" r="6" fill="#ffffff" stroke="#5a4630" strokeWidth="2" />
      <circle cx="30.5" cy="20" r="6" fill="#ffffff" stroke="#5a4630" strokeWidth="2" />
      <circle cx="17.5" cy="20" r="2.6" fill={INK} />
      <circle cx="30.5" cy="20" r="2.6" fill={INK} />
      <path d="M24 25.5 21 29h6l-3-3.5Z" fill="#ffc800" stroke="#c98a00" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M11 9l5 5M37 9l-5 5" stroke="#5a4630" strokeWidth="2.6" strokeLinecap="round" />
    </>
  ),
  'butterfly-social': (
    <>
      <path d="M23 24 10 12c-5 4-5 12 0 15s10-1 13-3Z" fill="#4aa3f0" stroke="#1d6fb8" strokeWidth="2" strokeLinejoin="round" />
      <path d="M25 24 38 12c5 4 5 12 0 15s-10-1-13-3Z" fill="#8fd0ff" stroke="#1d6fb8" strokeWidth="2" strokeLinejoin="round" />
      <path d="M23 25 12 36c4 4 9 3 11-1Z" fill="#f2555a" stroke="#c81e1e" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M25 25l11 11c-4 4-9 3-11-1Z" fill="#ff9d9d" stroke="#c81e1e" strokeWidth="1.8" strokeLinejoin="round" />
      <rect x="22.5" y="12" width="3" height="26" rx="1.5" fill={INK} />
      <path d="M23 12l-4-6M25 12l4-6" stroke={INK} strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  'speaker-audio': (
    <>
      <path d="M6 19h7l10-8v26l-10-8H6V19Z" fill="#4aa3f0" stroke="#1d6fb8" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M29 18a9 9 0 0 1 0 12" fill="none" stroke="#1d6fb8" strokeWidth="3" strokeLinecap="round" />
      <path d="M35 12a17 17 0 0 1 0 24" fill="none" stroke="#8fd0ff" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  'arrow-hint': (
    <>
      <path d="M7 24h27" stroke="#58cc02" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M28 14l11 10-11 10" fill="none" stroke="#3f9c01" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  'wave-hello': (
    <>
      <path d="M14 26V11a3.5 3.5 0 0 1 7 0v11" fill="#ffc89b" stroke="#c47d40" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M21 22V9a3.5 3.5 0 0 1 7 0v13" fill="#ffc89b" stroke="#c47d40" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M28 22V12a3.5 3.5 0 0 1 7 0v18a12 12 0 0 1-12 12c-6 0-9-3-11-8l-4-9a3.4 3.4 0 0 1 6-3l3 5" fill="#ffc89b" stroke="#c47d40" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M38 6l4-3M41 12h5" stroke="#ffc800" strokeWidth="2.6" strokeLinecap="round" />
    </>
  ),
  'note-write': (
    <>
      <rect x="8" y="5" width="26" height="38" rx="3.5" fill="#ffffff" stroke="#94a3b8" strokeWidth="2.4" />
      <path d="M14 15h14M14 22h14M14 29h9" stroke="#94a3b8" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M35 20l8 8-11 11-8 2 2-8 9-13Z" fill="#ffc800" stroke="#c98a00" strokeWidth="2.2" strokeLinejoin="round" />
    </>
  ),
  'cross-error': (
    <>
      <circle cx="24" cy="24" r="19" fill="#ff4b4b" stroke="#c81e1e" strokeWidth="2.5" />
      <path d="M17 17l14 14M31 17L17 31" stroke="#ffffff" strokeWidth="4.4" strokeLinecap="round" />
    </>
  ),
  'lightbulb-tip': (
    <>
      <path d="M24 4a13 13 0 0 0-8 23.3V33h16v-5.7A13 13 0 0 0 24 4Z" fill="#ffc800" stroke="#c98a00" strokeWidth="2.4" strokeLinejoin="round" />
      <rect x="17" y="34" width="14" height="4" rx="2" fill="#94a3b8" />
      <rect x="19" y="39" width="10" height="4" rx="2" fill="#64748b" />
      <path d="M20 27v-4a4 4 0 0 1 8 0v4" fill="none" stroke="#c98a00" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  'party-popper': (
    <>
      <path d="M6 42 18 14l16 16L6 42Z" fill="#ffc800" stroke="#c98a00" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M18 14 34 30" stroke="#c98a00" strokeWidth="1.8" />
      <circle cx="38" cy="10" r="3" fill="#f2555a" />
      <circle cx="30" cy="6" r="2.4" fill="#4aa3f0" />
      <circle cx="44" cy="20" r="2.4" fill="#58cc02" />
      <path d="M34 16l6-4M28 12l-1-5" stroke="#7c3aed" strokeWidth="2.2" strokeLinecap="round" />
    </>
  ),
  'film-clip': (
    <>
      <rect x="4" y="18" width="40" height="24" rx="3" fill="#2b2118" stroke="#000000" strokeWidth="2" />
      <rect x="9" y="23" width="8" height="6" rx="1" fill="#ffffff" />
      <rect x="20" y="23" width="8" height="6" rx="1" fill="#ffffff" />
      <rect x="31" y="23" width="8" height="6" rx="1" fill="#ffffff" />
      <path d="M4 16 8 6l38 4-2 8H4Z" fill="#4a3a2a" stroke="#000000" strokeWidth="2" strokeLinejoin="round" />
      <path d="M16 7.5 12 17M27 8.5 23 18M38 9.5 34 18" stroke="#ffffff" strokeWidth="2.2" />
    </>
  ),
  'puzzle-piece': (
    <>
      <path d="M8 8h12a4 4 0 1 1 8 0h12v12a4 4 0 1 0 0 8v12H28a4 4 0 1 0-8 0H8V28a4 4 0 1 1 0-8V8Z" fill="#7c3aed" stroke="#5b21b6" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M8 20a4 4 0 0 1 0 8" fill="none" stroke="#a78bfa" strokeWidth="1.8" />
    </>
  ),
  'moon-dark': (
    <>
      <path d="M32 4a20 20 0 1 0 12 36A22 22 0 0 1 32 4Z" fill="#c4b5fd" stroke="#7c3aed" strokeWidth="2.4" strokeLinejoin="round" />
      <circle cx="38" cy="10" r="1.8" fill="#ffc800" />
      <circle cx="44" cy="18" r="1.4" fill="#ffc800" />
    </>
  ),
  'inbox-in': (
    <>
      <path d="M5 26 11 8h26l6 18v13a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V26Z" fill="#4aa3f0" stroke="#1d6fb8" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M5 26h11l3 5h10l3-5h11" fill="none" stroke="#1d6fb8" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M24 5v13M19 14l5 5 5-5" fill="none" stroke="#58cc02" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  'inbox-out': (
    <>
      <path d="M5 26 11 8h26l6 18v13a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V26Z" fill="#8fd0ff" stroke="#1d6fb8" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M5 26h11l3 5h10l3-5h11" fill="none" stroke="#1d6fb8" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M24 18V5M19 10l5-5 5 5" fill="none" stroke="#ff7a1a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),

  'skill-book': (
    <>
      <path d="M6 9h13a5 5 0 0 1 5 5v25a5 5 0 0 0-5-4H6V9Z" fill="#58cc02" stroke="#3f9c01" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M42 9H29a5 5 0 0 0-5 5v25a5 5 0 0 1 5-4h13V9Z" fill="#7ee01f" stroke="#3f9c01" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M24 14v25" stroke="#3f9c01" strokeWidth="2.2" />
    </>
  ),
  'skill-mic': (
    <>
      <rect x="18" y="4" width="12" height="22" rx="6" fill="#f2555a" stroke="#c81e1e" strokeWidth="2.5" />
      <path d="M11 21a13 13 0 0 0 26 0" fill="none" stroke="#c81e1e" strokeWidth="3" strokeLinecap="round" />
      <path d="M24 34v8M17 42h14" stroke="#c81e1e" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  'skill-headphones': (
    <>
      <path d="M8 28v-4a16 16 0 0 1 32 0v4" fill="none" stroke="#4aa3f0" strokeWidth="3.4" strokeLinecap="round" />
      <rect x="4" y="26" width="10" height="16" rx="5" fill="#4aa3f0" stroke="#1d6fb8" strokeWidth="2.4" />
      <rect x="34" y="26" width="10" height="16" rx="5" fill="#4aa3f0" stroke="#1d6fb8" strokeWidth="2.4" />
    </>
  ),
  'skill-pencil': (
    <>
      <path d="M33 4l11 11-22 22-11 2 2-11L33 4Z" fill="#ffc800" stroke="#c98a00" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M29 8l11 11" stroke="#c98a00" strokeWidth="2.4" />
      <path d="M11 37l6 6" stroke="#c98a00" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M4 44l7-1-6-6-1 7Z" fill={INK} />
    </>
  ),
  'skill-target': (
    <>
      <circle cx="24" cy="24" r="19" fill="#ffffff" stroke="#f2555a" strokeWidth="2.5" />
      <circle cx="24" cy="24" r="12" fill="#ffd9da" stroke="#f2555a" strokeWidth="2" />
      <circle cx="24" cy="24" r="5" fill="#f2555a" />
    </>
  ),
};

/**
 * `<CustomEmoji name="streak-fire" />` — the only sanctioned way to render an
 * emoji-like glyph in this app. Never inline an OS emoji character in JSX.
 */
export function CustomEmoji({ name, size = 20, label, className = '', interactive = false }: CustomEmojiProps) {
  const hoverPop = interactive ? 'transition-transform hover:scale-110 active:scale-95' : '';
  const a11y = label ? { role: 'img' as const, 'aria-label': label } : { 'aria-hidden': true as const };

  const mascotSrc = MASCOT_SOURCES[name];
  if (mascotSrc) {
    return (
      <img
        {...a11y}
        src={mascotSrc}
        alt={label ?? ''}
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className={`inline-block shrink-0 object-contain align-middle ${hoverPop} ${className}`}
        onError={(event) => {
          (event.currentTarget as HTMLImageElement).src = '/mascots/ech_buri_duolingo_mascot_flat.png';
        }}
      />
    );
  }

  const glyph = SVG_GLYPHS[name] ?? SVG_GLYPHS['sparkles-badge'];

  return (
    <svg
      {...a11y}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 align-middle ${hoverPop} ${className}`}
    >
      {glyph}
    </svg>
  );
}

export default CustomEmoji;
