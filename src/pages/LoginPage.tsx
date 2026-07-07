import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { AuthCard } from "../components/AuthCard";
import { FormField } from "../components/FormField";
import { useAuth } from "../hooks/useAuth";
import { ROUTES } from "../constants/routes";

const loginSchema = z.object({
  username: z.string().min(1, "Vui lòng nhập tên đăng nhập"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { login, loading, error } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = (values: LoginFormValues) => login(values);

  return (
    <AuthCard
      title="Đăng nhập"
      subtitle="Nhập thông tin tài khoản để tiếp tục."
      footer={
        <>
          Chưa có tài khoản?{" "}
          <Link to={ROUTES.REGISTER} className="font-medium text-brand-600">
            Đăng ký ngay
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <FormField
          id="username"
          label="Tên đăng nhập"
          autoComplete="username"
          error={errors.username?.message}
          {...register("username")}
        />
        <FormField
          id="password"
          label="Mật khẩu"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="flex justify-end text-sm">
          <Link to={ROUTES.FORGOT_PASSWORD} className="text-brand-600">
            Quên mật khẩu?
          </Link>
        </div>

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
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
    </AuthCard>
  );
}
