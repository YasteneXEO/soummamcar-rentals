import { create } from 'zustand';
import { authApi, clearTokens, getAccessToken } from '../services/api';
import type { User, Role } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Derived helpers
  role: Role | null;
  isAdmin: boolean;
  isPartner: boolean;
  isClient: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: { fullName: string; email: string; phone: string; password: string; isDiaspora?: boolean; country?: string }) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

function deriveRoleFlags(user: User | null) {
  const role = user?.role ?? null;
  return {
    role,
    isAdmin: role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'AGENT',
    isPartner: role === 'PARTNER',
    isClient: role === 'CLIENT',
  };
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  role: null,
  isAdmin: false,
  isPartner: false,
  isClient: false,

  login: async (email, password) => {
    const { user } = await authApi.login({ email, password });
    set({ user, isAuthenticated: true, ...deriveRoleFlags(user) });
  },

  register: async (data) => {
    const { user } = await authApi.register(data);
    set({ user, isAuthenticated: true, ...deriveRoleFlags(user) });
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // Silently clear even if API call fails
    }
    clearTokens();
    set({ user: null, isAuthenticated: false, role: null, isAdmin: false, isPartner: false, isClient: false });
  },

  loadUser: async () => {
    const token = getAccessToken();
    if (!token) {
      set({ isLoading: false });
      return;
    }
    try {
      const user = await authApi.getProfile();
      set({ user, isAuthenticated: true, isLoading: false, ...deriveRoleFlags(user) });
    } catch {
      clearTokens();
      set({ user: null, isAuthenticated: false, isLoading: false, role: null, isAdmin: false, isPartner: false, isClient: false });
    }
  },

  updateProfile: async (data) => {
    const updated = await authApi.updateProfile(data);
    set({ user: updated, ...deriveRoleFlags(updated) });
  },
}));

// Listen for forced logout (401 after refresh failure)
window.addEventListener('auth:logout', () => {
  useAuthStore.getState().logout();
});
