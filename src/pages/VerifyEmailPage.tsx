import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AuthCard } from "../components/AuthCard";
import { useAuth } from "../hooks/useAuth";
import { ROUTES } from "../constants/routes";

type Status = "verifying" | "success" | "error" | "missing-token";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { verifyEmail, error } = useAuth();
  const [status, setStatus] = useState<Status>("verifying");
  const calledRef = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus("missing-token");
      return;
    }
    // Tránh gọi API 2 lần do React StrictMode render effect 2 lần ở dev.
    if (calledRef.current) return;
    calledRef.current = true;

    verifyEmail({ token }).then((ok) => setStatus(ok ? "success" : "error"));
  }, [token, verifyEmail]);

  return (
    <AuthCard
      title="Xác thực email"
      footer={
        <Link to={ROUTES.LOGIN} className="font-medium text-brand-600">
          Về trang đăng nhập
        </Link>
      }
    >
      {status === "verifying" && (
        <p className="text-sm text-slate-600">Đang xác thực email của bạn...</p>
      )}
      {status === "missing-token" && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Liên kết xác thực không hợp lệ: thiếu token.
        </p>
      )}
      {status === "success" && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Xác thực email thành công! Bạn có thể đăng nhập ngay bây giờ.
        </p>
      )}
      {status === "error" && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error ?? "Xác thực email thất bại, liên kết có thể đã hết hạn."}
        </p>
      )}
    </AuthCard>
  );
}
