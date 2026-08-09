/**
 * A signed-in learner's cloud settings are the cross-device source of truth.
 * The local value is only an offline cache, so it remains the fallback when a
 * remote read has no usable row.
 */
export function chooseSettingsRecord<T>({ local, remote }: { local: T | null; remote: T | null }): T | null {
  return remote ?? local;
}
