import { apiClient } from "./apiClient";
import type { StandardResponse } from "../types/common";
import type {
  LoginRequest,
  LoginResponseData,
  RegisterRequest,
  RefreshTokenRequest,
  LogoutRequest,
  ForgotPasswordRequest,
  VerifyEmailRequest,
  User,
} from "../types/auth";

export const authApi = {
  register: (body: RegisterRequest) =>
    apiClient
      .post<StandardResponse<User>>("/auth/register", body)
      .then((res) => res.data),

  login: (body: LoginRequest) =>
    apiClient
      .post<StandardResponse<LoginResponseData>>("/auth/login", body)
      .then((res) => res.data),

  logout: (body: LogoutRequest) =>
    apiClient
      .post<StandardResponse<null>>("/auth/logout", body)
      .then((res) => res.data),

  refreshToken: (body: RefreshTokenRequest) =>
    apiClient
      .post<StandardResponse<LoginResponseData>>("/auth/refresh-token", body)
      .then((res) => res.data),

  forgotPassword: (body: ForgotPasswordRequest) =>
    apiClient
      .post<StandardResponse<null>>("/auth/forgot-password", body)
      .then((res) => res.data),

  verifyEmail: (body: VerifyEmailRequest) =>
    apiClient
      .post<StandardResponse<null>>("/auth/verify-email", body)
      .then((res) => res.data),
};
