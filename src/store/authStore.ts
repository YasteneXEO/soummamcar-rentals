import { create } from 'zustand';
import { authApi, clearTokens, getAccessToken } from '../services/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'CLIENT' | 'ADMIN' | 'MANAGER';
  isDiaspora: boolean;
  diasporaCountry?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: { firstName: string; lastName: string; email: string; phone: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    const { user } = await authApi.login({ email, password });
    set({ user, isAuthenticated: true });
  },

  register: async (data) => {
    const { user } = await authApi.register(data);
    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // Silently clear even if API call fails
    }
    clearTokens();
    set({ user: null, isAuthenticated: false });
  },

  loadUser: async () => {
    const token = getAccessToken();
    if (!token) {
      set({ isLoading: false });
      return;
    }
    try {
      const user = await authApi.getProfile();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      clearTokens();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  updateProfile: async (data) => {
    const updated = await authApi.updateProfile(data);
    set({ user: updated });
  },
}));

// Listen for forced logout (401 after refresh failure)
window.addEventListener('auth:logout', () => {
  useAuthStore.getState().logout();
});
