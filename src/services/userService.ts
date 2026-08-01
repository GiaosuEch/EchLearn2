import { localDb } from '../lib/storage/localDatabase';
import type { User } from '../types';
import { canCreateLocalAccount, normalizeAccountEmail } from './accountIdentityPolicy';
import type { UserSettingsRecord } from './settingsService';

export const userService = {
  createLocalUser(email: string, displayName: string): User {
    const cleanEmail = normalizeAccountEmail(email);
    if (!canCreateLocalAccount(this.countLocalUsersByEmail(cleanEmail))) {
      throw new Error('Local demonstration profile limit reached for this email.');
    }

    let userId = crypto.randomUUID();
    while (this.getLocalUser(userId)) {
      userId = crypto.randomUUID();
    }
    const newUser: User = {
      id: userId,
      email: cleanEmail,
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

    // Initialize default local user_settings
    localDb.insert<UserSettingsRecord>('user_settings', {
      id: userId,
      userId,
      interfaceLanguage: 'vi',
      nativeLanguage: 'vi',
      targetLanguage: 'en',
      theme: 'light',
      soundEffects: true,
      speechSpeed: 'normal',
      fontSize: 'medium',
      dailyXpGoal: 50,
      ieltsTargetBand: 7.0,
      publicProfile: true,
      showOnlineStatus: true,
      allowFriendRequests: true,
      allowGroupInvites: true,
    } as UserSettingsRecord);

    return localDb.insert('users', newUser);
  },

  findLocalUserByEmail(email: string): User | null {
    const cleanEmail = normalizeAccountEmail(email);
    const users = localDb.findByField<User>('users', 'email', cleanEmail);
    return users.length > 0 ? users[0] : null;
  },

  countLocalUsersByEmail(email: string): number {
    const cleanEmail = normalizeAccountEmail(email);
    const users = localDb.findByField<User>('users', 'email', cleanEmail);
    return users.length;
  },

  findLocalUsersByEmail(email: string): User[] {
    const cleanEmail = normalizeAccountEmail(email);
    return localDb.findByField<User>('users', 'email', cleanEmail);
  },

  updateLocalUser(id: string, updates: Partial<User>): User | null {
    return localDb.update<User>('users', id, updates);
  },

  getLocalUser(id: string): User | null {
    return localDb.findById<User>('users', id);
  },

  getAllLocalUsers(): User[] {
    return localDb.getTable<User>('users');
  },

  resetAllAccounts(): User {
    // Purge local database tables
    localDb.saveTable('users', []);
    localDb.saveTable('user_settings', []);
    localDb.saveTable('lesson_completions', []);
    localDb.saveTable('mistake_notebook', []);
    localDb.saveTable('learner_memory', []);
    localDb.saveTable('lesson_attempts', []);

    // Create primary Admin account for Khounguyennguyen2012@gmail.com
    const adminEmail = 'khounguyennguyen2012@gmail.com';
    const adminId = 'admin_user_khounguyen';
    const adminUser: User = {
      id: adminId,
      email: adminEmail,
      displayName: 'GiaosuEch',
      username: 'GiaosuEch',
      avatarUrl: '/mascots/mascot_frog_backpack.png',
      bio: 'Quản đồng / Admin chính thức hệ thống EchLearn 🐸👑',
      nativeLanguage: 'vi',
      interfaceLanguage: 'vi',
      targetLanguages: ['en', 'ja'],
      level: 99,
      xp: 9999,
      streak: 30,
      createdAt: new Date().toISOString(),
      hearts: 99,
      ieltsTargetBand: 9.0,
      isPublicProfile: true,
      badges: ['admin', 'creator', 'pro_tier'],
      friends: [],
      joinedGroups: [],
      role: 'admin',
      subscriptionTier: 'pro'
    };

    localDb.insert('users', adminUser);

    localDb.insert<UserSettingsRecord>('user_settings', {
      id: adminId,
      userId: adminId,
      interfaceLanguage: 'vi',
      nativeLanguage: 'vi',
      targetLanguage: 'en',
      theme: 'light',
      soundEffects: true,
      speechSpeed: 'normal',
      fontSize: 'medium',
      dailyXpGoal: 100,
      ieltsTargetBand: 9.0,
      publicProfile: true,
      showOnlineStatus: true,
      allowFriendRequests: true,
      allowGroupInvites: true,
    } as UserSettingsRecord);

    // Clear storage caches
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('echlern_current_user_id', adminId);

    return adminUser;
  }
};
