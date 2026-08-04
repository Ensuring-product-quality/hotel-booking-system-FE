import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { AuthCard } from "../components/AuthCard";
import { FormField } from "../components/FormField";
import { useAuth } from "../hooks/useAuth";
import { ROUTES } from "../constants/routes";

const schema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

type FormValues = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const { forgotPassword, loading, error } = useAuth();
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    const ok = await forgotPassword(values);
    if (ok) setSent(true);
  };

  return (
    <AuthCard
      title="Quên mật khẩu"
      subtitle="Nhập email đã đăng ký, chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu."
      footer={
        <Link to={ROUTES.LOGIN} className="font-medium text-brand-600">
          Quay lại đăng nhập
        </Link>
      }
    >
      {sent ? (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi.
        </p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <FormField
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Đang gửi..." : "Gửi yêu cầu"}
          </button>
        </form>
      )}
    </AuthCard>
  );
}
