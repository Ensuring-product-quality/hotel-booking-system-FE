// Role được khai báo 1 chỗ duy nhất — mọi nơi khác trong app phải import
// từ đây, KHÔNG được gõ chuỗi "ROLE_ADMIN" tay ở nơi khác.
// (Dùng "const object" thay vì `enum` vì project bật erasableSyntaxOnly
// của TypeScript 6 — enum thường không được phép trong chế độ này.)
export const Role = {
  ADMIN: "ROLE_ADMIN",
  MANAGER: "ROLE_MANAGER",
  STAFF: "ROLE_STAFF",
  CUSTOMER: "ROLE_CUSTOMER",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const ALL_ROLES: Role[] = [
  Role.ADMIN,
  Role.MANAGER,
  Role.STAFF,
  Role.CUSTOMER,
];

export type UserStatus = "active" | "inactive" | "banned";

export interface User {
  id: string;
  username: string;
  email: string;
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
  user?: User;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
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
