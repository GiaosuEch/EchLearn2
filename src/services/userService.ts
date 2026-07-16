import { localDb } from '../lib/storage/localDatabase';
import type { User } from '../types';

export const userService = {
  createLocalUser(email: string, displayName: string): User {
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      displayName,
      username: displayName.toLowerCase().replace(/\s/g, '') + Math.floor(Math.random() * 1000),
      avatarUrl: '',
      bio: '',
      nativeLanguage: 'vi',
      interfaceLanguage: 'vi',
      targetLanguages: ['en'],
      level: 1,
      xp: 0,
      streak: 0,
      createdAt: new Date().toISOString(),
      hearts: 5,
      ieltsTargetBand: 6.5,
      isPublicProfile: true,
      badges: [],
      friends: [],
      joinedGroups: []
    };
    return localDb.insert('users', newUser);
  },

  findLocalUserByEmail(email: string): User | null {
    const users = localDb.findByField<User>('users', 'email', email);
    return users.length > 0 ? users[0] : null;
  },

  updateLocalUser(id: string, updates: Partial<User>): User | null {
    return localDb.update<User>('users', id, updates);
  },

  getLocalUser(id: string): User | null {
    return localDb.findById<User>('users', id);
  },

  getAllLocalUsers(): User[] {
    return localDb.getTable<User>('users');
  }
};
