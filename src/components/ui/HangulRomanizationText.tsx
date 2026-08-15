import type { HangulRomanization } from '../../curriculum/koreanTopik1Content';

export function HangulRomanizationText({ hangul, romanization, className = '' }: HangulRomanization & { className?: string }) {
  return <span className={`inline-flex flex-col items-center align-middle leading-tight ${className}`} lang="ko" aria-label={`${hangul}, ${romanization}`}><span aria-hidden="true">{hangul}</span><span aria-hidden="true" lang="ko-Latn" className="mt-1 text-[0.58em] font-medium tracking-normal text-sky-700 dark:text-sky-300">{romanization}</span></span>;
}
