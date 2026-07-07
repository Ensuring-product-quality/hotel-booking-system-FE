import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { AuthCard } from "../components/AuthCard";
import { FormField } from "../components/FormField";
import { useAuth } from "../hooks/useAuth";
import { ROUTES } from "../constants/routes";

const registerSchema = z.object({
  username: z.string().min(3, "Tên đăng nhập tối thiểu 3 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const { register: doRegister, loading, error } = useAuth();
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterFormValues) => {
    const ok = await doRegister(values);
    if (ok) {
      setSuccess(true);
      setTimeout(() => navigate(ROUTES.LOGIN), 1500);
    }
  };

  return (
    <AuthCard
      title="Tạo tài khoản"
      subtitle="Đăng ký để bắt đầu đặt phòng."
      footer={
        <>
          Đã có tài khoản?{" "}
          <Link to={ROUTES.LOGIN} className="font-medium text-brand-600">
            Đăng nhập
          </Link>
        </>
      }
    >
      {success ? (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Đăng ký thành công! Đang chuyển tới trang đăng nhập...
        </p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <FormField
            id="username"
            label="Tên đăng nhập"
            autoComplete="username"
            error={errors.username?.message}
            {...register("username")}
          />
          <FormField
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <FormField
            id="password"
            label="Mật khẩu"
            type="password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register("password")}
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
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </form>
      )}
    </AuthCard>
  );
}
