import { create } from 'zustand';
import type { User, UserRole } from '../types/user';

interface AuthState {
  user: User | null;
  token: string | null;
  isSignedIn: boolean;
  isLoading: boolean;

  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setAuth: (user: User, token: string) => void;
  setRole: (role: UserRole) => void;
  updateProfile: (updates: Partial<Pick<User, 'fullName' | 'phone' | 'avatarUrl'>>) => void;
  signOut: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: null,
  isSignedIn: false,
  isLoading: false,

  setUser: (user) => set({ user, isSignedIn: !!user }),

  setToken: (token) => {
    if (token) {
      localStorage.setItem('rideflow_token', token);
    } else {
      localStorage.removeItem('rideflow_token');
    }
    set({ token });
  },

  setAuth: (user, token) => {
    localStorage.setItem('rideflow_token', token);
    localStorage.setItem('rideflow_user', JSON.stringify(user));
    set({ user, token, isSignedIn: true });
  },

  setRole: (role) =>
    set((state) => ({
      user: state.user ? { ...state.user, role } : null,
    })),

  updateProfile: (updates) =>
    set((state) => {
      const user = state.user ? { ...state.user, ...updates } : null;
      if (user) localStorage.setItem('rideflow_user', JSON.stringify(user));
      return { user };
    }),

  signOut: () => {
    localStorage.removeItem('rideflow_token');
    localStorage.removeItem('rideflow_user');
    set({ user: null, token: null, isSignedIn: false });
  },
}));
