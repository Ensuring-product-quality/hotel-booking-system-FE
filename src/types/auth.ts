export const Role = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  CUSTOMER: "CUSTOMER",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const ALL_ROLES: Role[] = [
  Role.ADMIN,
  Role.MANAGER,
  Role.CUSTOMER,
];

export type UserStatus = "active" | "inactive" | "banned";

export interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  phone?: string;
  role: Role;
  avatarUrl?: string;
  status: UserStatus;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  fullName?: string;
  phone?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyEmailRequest {
  token: string;
}
