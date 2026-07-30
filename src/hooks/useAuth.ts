import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../services/authApi";
import { getErrorMessage } from "../services/apiClient";
import { useAuthStore } from "../store/authStore";
import { ROUTES } from "../constants/routes";
import type {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  VerifyEmailRequest,
  Role,
} from "../types/auth";

function decodeJwt(token: string): any {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const refreshToken = useAuthStore((s) => s.refreshToken);

  const login = useCallback(
    async (body: LoginRequest) => {
      setLoading(true);
      setError(null);
      try {
        const res = await authApi.login(body);
        if (!res.data) throw new Error("Phản hồi đăng nhập không hợp lệ");

        const decoded = decodeJwt(res.data.accessToken);
        const userObj = decoded
          ? {
              id: Number(decoded.userId || 0),
              username: decoded.sub || "",
              email: decoded.email || "",
              role: ((decoded.role || "") as string).replace("ROLE_", "") as Role,
              status: "active" as const,
            }
          : null;

        setAuth({
          accessToken: res.data.accessToken,
          refreshToken: res.data.refreshToken,
          user: userObj,
        });
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get("redirect");
        navigate(redirect || ROUTES.HOME);
        return true;
      } catch (err) {
        setError(getErrorMessage(err, "Đăng nhập thất bại."));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [navigate, setAuth]
  );

  const register = useCallback(async (body: RegisterRequest) => {
    setLoading(true);
    setError(null);
    try {
      await authApi.register(body);
      return true;
    } catch (err) {
      setError(getErrorMessage(err, "Đăng ký thất bại."));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      if (refreshToken) {
        await authApi.logout({ refreshToken });
      }
    } catch {
      // Kể cả khi gọi logout backend lỗi, vẫn dọn state phía client.
    } finally {
      clearAuth();
      setLoading(false);
      navigate(ROUTES.LOGIN);
    }
  }, [refreshToken, clearAuth, navigate]);

  const forgotPassword = useCallback(async (body: ForgotPasswordRequest) => {
    setLoading(true);
    setError(null);
    try {
      await authApi.forgotPassword(body);
      return true;
    } catch (err) {
      setError(getErrorMessage(err, "Gửi yêu cầu thất bại."));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyEmail = useCallback(async (body: VerifyEmailRequest) => {
    setLoading(true);
    setError(null);
    try {
      await authApi.verifyEmail(body);
      return true;
    } catch (err) {
      setError(getErrorMessage(err, "Xác thực email thất bại."));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    verifyEmail,
  };
}
