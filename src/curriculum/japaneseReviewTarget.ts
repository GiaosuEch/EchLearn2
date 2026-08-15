export function getJapaneseReviewTargetIndex(input: Readonly<{
  reviewItemId: string | null;
  reviewItemIds: readonly string[];
  legacyNumericPrefix?: string;
}>): number {
  if (!input.reviewItemId) return 0;

  const exactIndex = input.reviewItemIds.indexOf(input.reviewItemId);
  if (exactIndex >= 0) return exactIndex;

  if (input.legacyNumericPrefix && input.reviewItemId.startsWith(input.legacyNumericPrefix)) {
    const ordinal = Number(input.reviewItemId.slice(input.legacyNumericPrefix.length));
    if (Number.isInteger(ordinal) && ordinal > 0 && ordinal <= input.reviewItemIds.length) return ordinal - 1;
  }

  return 0;
}
