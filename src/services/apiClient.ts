import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import { getAuthState } from "../store/authStore";
import type { StandardResponse } from "../types/common";
import type { RefreshTokenRequest, LoginResponseData } from "../types/auth";
import { ROUTES } from "../constants/routes";

const baseURL = import.meta.env.VITE_API_BASE_URL as string;

if (!baseURL) {
  // Fail sớm và rõ ràng thay vì gọi API tới "undefined/..." rồi mới lỗi khó hiểu.
  // eslint-disable-next-line no-console
  console.error(
    "VITE_API_BASE_URL chưa được cấu hình trong .env — kiểm tra lại file .env ở root project."
  );
}

export const apiClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

// --- Gắn Authorization header cho mọi request ---
apiClient.interceptors.request.use((config) => {
  const { accessToken } = getAuthState();
  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }
  return config;
});

// --- Xử lý 401: tự refresh token, gộp các request đang chờ để tránh gọi
// refresh-token nhiều lần song song khi nhiều request cùng 401 một lúc ---
let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function resolveQueue(token: string) {
  pendingQueue.forEach(({ resolve }) => resolve(token));
  pendingQueue = [];
}

function rejectQueue(err: unknown) {
  pendingQueue.forEach(({ reject }) => reject(err));
  pendingQueue = [];
}

function forceLogoutAndRedirect() {
  getAuthState().clearAuth();
  if (window.location.pathname !== ROUTES.LOGIN) {
    window.location.href = ROUTES.LOGIN;
  }
}

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableConfig | undefined;

    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Tránh vòng lặp vô hạn nếu chính request refresh-token cũng trả 401.
    if (originalRequest.url?.includes("/auth/refresh-token")) {
      forceLogoutAndRedirect();
      return Promise.reject(error);
    }

    // Request này đã từng được retry rồi mà vẫn 401 -> không retry nữa.
    if (originalRequest._retry) {
      forceLogoutAndRedirect();
      return Promise.reject(error);
    }

    const { refreshToken } = getAuthState();
    if (!refreshToken) {
      forceLogoutAndRedirect();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      // Đã có 1 request khác đang refresh -> xếp hàng chờ token mới.
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (newToken: string) => {
            originalRequest.headers.set("Authorization", `Bearer ${newToken}`);
            resolve(apiClient(originalRequest));
          },
          reject,
        });
      });
    }

    isRefreshing = true;
    try {
      const body: RefreshTokenRequest = { refreshToken };
      const res = await axios.post<StandardResponse<LoginResponseData>>(
        `${baseURL}/auth/refresh-token`,
        body
      );
      const newAccessToken = res.data.data?.accessToken;
      if (!newAccessToken) {
        throw new Error("Refresh-token response không có accessToken");
      }

      getAuthState().setAccessToken(newAccessToken);
      resolveQueue(newAccessToken);

      originalRequest.headers.set("Authorization", `Bearer ${newAccessToken}`);
      return apiClient(originalRequest);
    } catch (refreshError) {
      rejectQueue(refreshError);
      forceLogoutAndRedirect();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// Helper đọc message lỗi thống nhất từ StandardResponse (backend trả lỗi
// dạng { success:false, message:"..." } chứ không phải throw string thô).
export function getErrorMessage(error: unknown, fallback = "Đã có lỗi xảy ra, vui lòng thử lại."): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as StandardResponse | undefined;
    if (data?.message) return data.message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
