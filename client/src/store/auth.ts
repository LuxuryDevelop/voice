import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserStatus = "online" | "away" | "dnd" | "offline";

export type AuthUser = {
  id: string;
  username: string;
  avatarUrl?: string | null;
  status: UserStatus;
  role: "admin" | "user";
};

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setSession: (payload: { accessToken: string; refreshToken: string; user: AuthUser }) => void;
  clearSession: () => void;
  setStatus: (status: UserStatus) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      setSession: ({ accessToken, refreshToken, user }) =>
        set({
          accessToken,
          refreshToken,
          user,
          isAuthenticated: true
        }),
      clearSession: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false
        }),
      setStatus: (status) =>
        set((state) => ({
          user: state.user ? { ...state.user, status } : null
        }))
    }),
    {
      name: "luxuryvoice-auth"
    }
  )
);
