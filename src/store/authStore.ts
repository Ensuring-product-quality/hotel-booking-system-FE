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
        set((state) => {
          let finalUser = user ?? state.user;
          if (finalUser) {
            finalUser = {
              ...finalUser,
              role: String(finalUser.role).replace("ROLE_", "") as any,
            };
          }
          return {
            accessToken,
            refreshToken,
            user: finalUser,
            isAuthenticated: true,
          };
        }),

      setUser: (user) =>
        set(() => {
          let finalUser = user;
          if (finalUser) {
            finalUser = {
              ...finalUser,
              role: String(finalUser.role).replace("ROLE_", "") as any,
            };
          }
          return { user: finalUser };
        }),

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
