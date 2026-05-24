import { create } from "zustand";

interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  profile: {
    name?: string;
    avatar_url?: string;
    role?: string;
  };
  metadata: Record<string, unknown>;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  setUser: (user) =>
    set({ user, isAuthenticated: !!user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () =>
    set({ user: null, isAuthenticated: false, isLoading: false }),
}));
