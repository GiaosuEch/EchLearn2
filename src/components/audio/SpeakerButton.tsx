import { Volume2, Loader2, AlertCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { audioService } from '../../services/audioService';

type SizeProp = number | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface Props {
  /** Preferred prop used by newer pages. */
  word?: string;
  /** Backward-compatible alias used by AI onboarding/test pages. */
  text?: string;
  /** Preferred language id, e.g. en, ja, zh, vi. */
  languageId?: string;
  /** Backward-compatible alias used by older pages. */
  language?: string;
  size?: SizeProp;
  className?: string;
  rate?: number;
  label?: string;
}

function iconSize(size: SizeProp = 18): number {
  if (typeof size === 'number') return size;
  if (size === 'xs') return 14;
  if (size === 'sm') return 16;
  if (size === 'md') return 18;
  if (size === 'lg') return 22;
  if (size === 'xl') return 28;
  return 18;
}

export default function SpeakerButton({ word, text, languageId, language, size = 18, className = '', rate, label }: Props) {
  const [state, setState] = useState<'idle' | 'playing' | 'error'>('idle');
  const { t } = useTranslation();
  const content = useMemo(() => String(word ?? text ?? '').trim(), [word, text]);
  const lang = languageId || language || 'en';
  const resolvedSize = iconSize(size);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (state === 'playing') {
      audioService.stop();
      setState('idle');
      return;
    }

    if (!content) {
      setState('error');
      setTimeout(() => setState('idle'), 1800);
      return;
    }

    setState('playing');
    try {
      await audioService.speak(content, lang, rate, t);
      setState('idle');
    } catch {
      setState('error');
      setTimeout(() => setState('idle'), 2200);
    }
  };

  const title = state === 'error'
    ? t('lesson.errors.tts_failed', { defaultValue: 'Không thể phát âm thanh.' })
    : label || t('common.listen', { defaultValue: 'Nghe' });

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!content}
      className={`inline-flex items-center justify-center p-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        state === 'playing' ? 'bg-primary-500/20 text-primary-400' :
        state === 'error' ? 'bg-red-500/20 text-red-400' :
        'hover:bg-dark-700 text-dark-400 hover:text-primary-400'
      } ${className}`}
      title={title}
      aria-label={title}
      data-audio-text={content ? 'ready' : 'missing'}
      data-audio-lang={lang}
    >
      {state === 'playing' ? <Loader2 size={resolvedSize} className="animate-spin" /> :
       state === 'error' ? <AlertCircle size={resolvedSize} /> :
       <Volume2 size={resolvedSize} />}
    </button>
  );
}
