import type { User } from '../types';

/**
 * userService is deprecated and purged of localDb fallback logic.
 * It is now a thin utility wrapper over Supabase auth actions.
 * All state and profile data MUST be fetched via profileService.ts
 * and managed by authStore.ts. 
 */
export const userService = {
  /**
   * @deprecated Use authService and profileService directly
   */
  findLocalUserByEmail(_email: string): null {
    console.warn("userService.findLocalUserByEmail is deprecated. Profiles are managed via Supabase.");
    return null;
  },

  /**
   * @deprecated Use authService and profileService directly
   */
  getLocalUser(_id: string): null {
    console.warn("userService.getLocalUser is deprecated. Profiles are managed via Supabase.");
    return null;
  },

  /**
   * @deprecated Admin capabilities are now enforced via Supabase Custom Claims and RLS
   */
  resetAllAccounts(): never {
    throw new Error('SECURITY VIOLATION: Client-side database reset is strictly prohibited in production.');
  },
  
  /**
   * @deprecated Use Supabase directly to query user lists
   */
  getAllLocalUsers(): User[] {
    console.warn("userService.getAllLocalUsers is deprecated. Profiles are managed via Supabase.");
    return [];
  }
};
