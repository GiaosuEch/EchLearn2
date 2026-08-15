export interface SrsKeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const migrationKey = (name: string) => `${name}:owner-migration-v1`;
const ownerKey = (name: string, ownerId: string) => `${name}:owner:${encodeURIComponent(ownerId)}`;

export function createOwnerScopedStorage(storage: SrsKeyValueStorage, getOwnerId: () => string | null) {
  const owner = () => getOwnerId()?.trim() || 'anonymous';
  return {
    getItem(name: string): string | null {
      const scopedKey = ownerKey(name, owner());
      const scoped = storage.getItem(scopedKey);
      if (scoped !== null) return scoped;
      if (storage.getItem(migrationKey(name)) !== null) return null;
      const legacy = storage.getItem(name);
      if (legacy === null) return null;
      storage.setItem(scopedKey, legacy);
      storage.setItem(migrationKey(name), '1');
      return legacy;
    },
    setItem(name: string, value: string): void {
      storage.setItem(ownerKey(name, owner()), value);
    },
    removeItem(name: string): void {
      storage.removeItem(ownerKey(name, owner()));
    },
  };
}

export const createOwnerScopedSrsStorage = createOwnerScopedStorage;
