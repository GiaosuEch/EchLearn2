export function getMascotGreeting(userName: string, streak: number): string {
  const hour = new Date().getHours();
  const timeGreeting = hour < 12
    ? 'Good morning'
    : hour < 17
      ? 'Good afternoon'
      : 'Good evening';

  return streak > 0
    ? `${timeGreeting}, ${userName}! Streak day ${streak} — keep the momentum going!`
    : `${timeGreeting}, ${userName}! Ready for one small learning win today?`;
}

/** Cosmetic lesson feedback. This copy is deterministic and is not AI output. */
export function getMascotCheer(isCorrect: boolean): string {
  return isCorrect
    ? 'Correct — keep the streak going!'
    : 'Not quite yet. Review the hint and try once more.';
}
