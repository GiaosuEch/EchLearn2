export interface FuriganaTextProps {
  /** The main Japanese text (e.g. Kanji) */
  base: string;
  /** The reading aid (e.g. Hiragana) */
  ruby: string;
  className?: string;
  /** Toggle furigana reading display. Defaults to true. */
  showFurigana?: boolean;
}

/**
 * FuriganaText - A core primitive for Japanese typography.
 * Renders Kanji with Furigana readings using standard HTML5 <ruby> tags.
 *
 * Native furigana stacking requires the base text to be a DIRECT child of
 * <ruby> (no flex-col wrapper) immediately followed by <rt>. The <rp>
 * parentheses are legacy fallbacks that conforming browsers hide natively.
 *
 * Accessibility: the <ruby> carries aria-label={ruby} so screen readers
 * announce the intended READING, while the visual <rt> is aria-hidden to
 * avoid the reading being announced twice.
 */
export function FuriganaText({ base, ruby, className = '', showFurigana = true }: FuriganaTextProps) {
  return (
    <ruby aria-label={ruby} className={`leading-none ${className}`}>
      {base}
      {showFurigana && (
        <>
          <rp>(</rp>
          <rt
            aria-hidden="true"
            className="text-[0.6em] text-emerald-500/80 font-medium leading-none select-none"
          >
            {ruby}
          </rt>
          <rp>)</rp>
        </>
      )}
    </ruby>
  );
}
