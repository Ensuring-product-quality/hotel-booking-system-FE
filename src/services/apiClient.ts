import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import { getAuthState } from "../store/authStore";
import type { StandardResponse } from "../types/common";
import type { RefreshTokenRequest, LoginResponseData } from "../types/auth";
import { ROUTES } from "../constants/routes";

const rawBaseURL = import.meta.env.VITE_API_BASE_URL as string;
const APP_BASENAME = "/vi-vn";

function getEffectiveBaseURL(): string {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const isProductionHost = hostname.includes("up.railway.app") || (hostname !== "localhost" && hostname !== "127.0.0.1");
    if (isProductionHost && (!rawBaseURL || rawBaseURL.includes("localhost") || rawBaseURL.includes("127.0.0.1"))) {
      // Tự động suy luận domain BE tương ứng trên Railway hoặc dùng domain BE mặc định
      return "https://hotel-booking-system-be-production.up.railway.app/api";
    }
  }
  return rawBaseURL || "http://localhost:8080/api";
}

const baseURL = getEffectiveBaseURL();

export const apiClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const { accessToken } = getAuthState();
  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }
  return config;
});

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function resolveQueue(token: string) {
  pendingQueue.forEach(({ resolve }) => resolve(token));
  pendingQueue = [];
}

function rejectQueue(error: unknown) {
  pendingQueue.forEach(({ reject }) => reject(error));
  pendingQueue = [];
}

function forceLogoutAndRedirect() {
  getAuthState().clearAuth();
  const loginPath = `${APP_BASENAME}${ROUTES.LOGIN}`;
  if (window.location.pathname !== loginPath) {
    window.location.assign(loginPath);
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

    if (originalRequest.url?.includes("/auth/refresh-token")) {
      forceLogoutAndRedirect();
      return Promise.reject(error);
    }

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
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (newToken) => {
            originalRequest.headers.set(
              "Authorization",
              `Bearer ${newToken}`,
            );
            resolve(apiClient(originalRequest));
          },
          reject,
        });
      });
    }

    isRefreshing = true;
    try {
      const body: RefreshTokenRequest = { refreshToken };
      const response = await axios.post<
        StandardResponse<LoginResponseData>
      >(`${baseURL}/auth/refresh-token`, body);
      const refreshedAuth = response.data.data;

      if (!refreshedAuth?.accessToken || !refreshedAuth.refreshToken) {
        throw new Error("Phản hồi refresh token không có đủ token");
      }

      getAuthState().setAuth({
        accessToken: refreshedAuth.accessToken,
        refreshToken: refreshedAuth.refreshToken,
        user: refreshedAuth.user ?? getAuthState().user,
      });
      resolveQueue(refreshedAuth.accessToken);

      originalRequest.headers.set(
        "Authorization",
        `Bearer ${refreshedAuth.accessToken}`,
      );
      return apiClient(originalRequest);
    } catch (refreshError) {
      rejectQueue(refreshError);
      forceLogoutAndRedirect();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export function getErrorMessage(
  error: unknown,
  fallback = "Đã có lỗi xảy ra, vui lòng thử lại.",
): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as StandardResponse | undefined;
    if (data?.message) return data.message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
