import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import type { Role } from "../types/auth";
import { ROUTES } from "../constants/routes";

interface PrivateRouteProps {
  children: ReactNode;
  /** Nếu bỏ trống -> chỉ cần đăng nhập, không phân biệt role. */
  allowedRoles?: Role[];
}

export function PrivateRoute({ children, allowedRoles }: PrivateRouteProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!user || !allowedRoles.includes(user.role)) {
      return <Navigate to={ROUTES.HOME} replace />;
    }
  }

  return <>{children}</>;
}
