import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { User } from "../types/auth";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (payload: {
    accessToken: string;
    refreshToken: string;
    user?: User | null;
  }) => void;
  setUser: (user: User | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      setAuth: ({ accessToken, refreshToken, user }) =>
        set((state) => ({
          accessToken,
          refreshToken,
          user: user ?? state.user,
          isAuthenticated: true,
        })),

      setUser: (user) => set({ user }),

      clearAuth: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "hotelnow-auth",
      storage: createJSONStorage(() => sessionStorage),
      partialize: ({ accessToken, refreshToken, user, isAuthenticated }) => ({
        accessToken,
        refreshToken,
        user,
        isAuthenticated,
      }),
    },
  ),
);

export const getAuthState = () => useAuthStore.getState();
