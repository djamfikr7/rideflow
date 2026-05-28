import { create } from "zustand";
import type { User, UserRole } from "../types/user";

interface AuthState {
  user: User | null;
  isSignedIn: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setRole: (role: UserRole) => void;
  signOut: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isSignedIn: false,
  isLoading: false,

  setUser: (user) =>
    set({ user, isSignedIn: !!user }),

  setRole: (role) =>
    set((state) => ({
      user: state.user ? { ...state.user, role } : null,
    })),

  signOut: () =>
    set({ user: null, isSignedIn: false }),
}));
