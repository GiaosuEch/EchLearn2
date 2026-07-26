import Mascot from '../mascot/Mascot';

export type EchBuriMood =
  | 'welcome'
  | 'calm'
  | 'happy'
  | 'focus'
  | 'focused'
  | 'thinking'
  | 'encouragement'
  | 'encouraging'
  | 'recovery'
  | 'sad'
  | 'celebration'
  | 'celebrating'
  | 'celebrate'
  | 'surprised'
  | 'cool'
  | 'savage';

export interface EchBuriPresenceProps {
  mood?: EchBuriMood;
  size?: number;
  className?: string;
  /** Lets art-directed surfaces own the mascot motion instead of stacking bobs. */
  animate?: boolean;
}

const expressionByMood: Record<EchBuriMood, Parameters<typeof Mascot>[0]['expression']> = {
  welcome: 'happy',
  calm: 'cool',
  happy: 'happy',
  focus: 'thinking',
  focused: 'thinking',
  thinking: 'thinking',
  encouragement: 'encouraging',
  encouraging: 'encouraging',
  recovery: 'sad',
  sad: 'sad',
  celebration: 'surprised',
  celebrating: 'surprised',
  celebrate: 'surprised',
  surprised: 'surprised',
  cool: 'cool',
  savage: 'savage',
};

export function EchBuriPresence({
  mood = 'encouragement',
  size = 88,
  className = '',
  animate = true,
}: EchBuriPresenceProps) {
  const classes = ['ech-buri-presence', `ech-buri-presence--${mood}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} aria-hidden="true" data-mood={mood}>
      <Mascot expression={expressionByMood[mood]} size={size} animate={animate} />
    </div>
  );
}

export default EchBuriPresence;
