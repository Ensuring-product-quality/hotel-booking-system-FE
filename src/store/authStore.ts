import { create } from "zustand";
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
  setAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
}

// QUAN TRỌNG: state này chỉ tồn tại trong memory (RAM của tab đang mở).
// Không có bất kỳ dòng nào ở đây đọc/ghi localStorage hay sessionStorage.
// Hệ quả CHỦ ĐÍCH: người dùng reload trang (F5) sẽ bị đăng xuất, phải
// đăng nhập lại. Đây là đánh đổi bảo mật đã được chốt ở Giai đoạn 1 —
// nếu sau này muốn "nhớ đăng nhập" qua F5, cách an toàn là để backend
// set refreshToken vào httpOnly cookie, KHÔNG phải thêm localStorage ở đây.
export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,

  setAuth: ({ accessToken, refreshToken, user }) =>
    set({
      accessToken,
      refreshToken,
      user: user ?? null,
      isAuthenticated: true,
    }),

  setUser: (user) => set({ user }),

  setAccessToken: (accessToken) => set({ accessToken }),

  clearAuth: () =>
    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    }),
}));

// Getter tiện dùng ở nơi không phải React component (vd trong apiClient
// interceptor), vì hook useAuthStore() chỉ gọi được trong component/hook.
export const getAuthState = () => useAuthStore.getState();
