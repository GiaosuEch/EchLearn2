import type { EmoteType } from '../components/common/CustomEmote';

export interface MascotMessageWithEmote {
  text: string;
  emote: EmoteType;
}

export function getMascotGreeting(userName: string, streak: number): MascotMessageWithEmote {
  const hour = new Date().getHours();
  const timeGreeting = hour < 12
    ? 'Good morning'
    : hour < 17
      ? 'Good afternoon'
      : 'Good evening';

  return streak > 0
    ? { text: `${timeGreeting}, ${userName}! Streak day ${streak} — keep the momentum going!`, emote: 'streak-fire' }
    : { text: `${timeGreeting}, ${userName}! Ready for one small learning win today?`, emote: 'peepo-smart' };
}

/** Cosmetic lesson feedback with Discadia reaction emotes. */
export function getMascotCheer(isCorrect: boolean): MascotMessageWithEmote {
  return isCorrect
    ? { text: 'Correct — keep the streak going!', emote: 'blob-cheer' }
    : { text: 'Not quite yet. Review the hint and try once more.', emote: 'ech-buri-think' };
}
