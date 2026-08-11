import { AppIcon, type AppIconName } from './AppIcon';

/**
 * Compatibility layer for old call sites.
 *
 * Functional UI glyphs now render through the Lucide-based `AppIcon` system.
 * Only Ech Buri remains artwork: it is the product mascot, not a generic icon.
 */
type MascotName =
  | 'ech-buri'
  | 'ech-buri-study'
  | 'ech-buri-celebrate'
  | 'ech-buri-think'
  | 'ech-buri-tutor'
  | 'ech-buri-sad';

export type CustomEmojiName = MascotName | AppIconName;

export interface CustomEmojiProps {
  name: CustomEmojiName;
  size?: number;
  label?: string;
  className?: string;
  interactive?: boolean;
}

const MASCOT_SOURCES: Record<MascotName, string> = {
  'ech-buri': '/mascots/ech_buri_duolingo_mascot_flat.png',
  'ech-buri-study': '/mascots/ech_buri_study_companion.png',
  'ech-buri-celebrate': '/mascots/pepe_mascot_celebrate.png',
  'ech-buri-think': '/mascots/pepe_mascot_thinking.png',
  'ech-buri-tutor': '/mascots/pepe_mascot_tutor.png',
  'ech-buri-sad': '/mascots/pepe_mascot_sad.png',
};

function isMascotName(name: CustomEmojiName): name is MascotName {
  return name in MASCOT_SOURCES;
}

export function CustomEmoji({ name, size = 20, label, className = '', interactive = false }: CustomEmojiProps) {
  const interaction = interactive ? 'transition-transform hover:scale-105 active:scale-95' : '';

  if (isMascotName(name)) {
    return (
      <img
        src={MASCOT_SOURCES[name]}
        alt={label ?? ''}
        width={size}
        height={size}
        className={`inline-block shrink-0 object-contain align-middle ${interaction} ${className}`}
        style={{ width: size, height: size }}
        aria-hidden={label ? undefined : true}
      />
    );
  }

  return <AppIcon name={name as AppIconName} size={size} aria-label={label} aria-hidden={label ? undefined : true} className={`${interaction} ${className}`} />;
}

export default CustomEmoji;
