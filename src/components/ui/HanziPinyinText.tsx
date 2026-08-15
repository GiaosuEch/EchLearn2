import type { HanziPinyin } from '../../curriculum/chineseHsk1Content';

export interface HanziPinyinTextProps extends HanziPinyin { className?: string; showPinyin?: boolean }

/** Chinese typography primitive. Pinyin is an annotated pronunciation line, not Japanese furigana. */
export function HanziPinyinText({ hanzi, pinyin, className = '', showPinyin = true }: HanziPinyinTextProps) {
  return <span className={`inline-flex flex-col items-center align-middle leading-tight ${className}`} aria-label={`${hanzi}, ${pinyin}`} lang="zh-Hans">
    <span aria-hidden="true">{hanzi}</span>
    {showPinyin && <span aria-hidden="true" lang="zh-Latn-pinyin" className="mt-1 text-[0.58em] font-medium tracking-normal text-rose-600 dark:text-rose-300">{pinyin}</span>}
  </span>;
}
