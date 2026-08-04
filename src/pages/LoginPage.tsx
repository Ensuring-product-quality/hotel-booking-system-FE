import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { AuthCard } from "../components/AuthCard";
import { FormField } from "../components/FormField";
import { useAuth } from "../hooks/useAuth";
import { ROUTES } from "../constants/routes";

const loginSchema = z.object({
  username: z.string().min(1, "Vui lòng nhập tên đăng nhập hoặc email"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const SAVED_USERNAME_KEY = "hotelnow_remembered_username";

export function LoginPage() {
  const { login, loading, error } = useAuth();

  const savedUsername = typeof window !== "undefined" ? localStorage.getItem(SAVED_USERNAME_KEY) || "" : "";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: savedUsername,
      rememberMe: Boolean(savedUsername),
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    if (values.rememberMe) {
      localStorage.setItem(SAVED_USERNAME_KEY, values.username);
    } else {
      localStorage.removeItem(SAVED_USERNAME_KEY);
    }
    login({ username: values.username, password: values.password });
  };

  return (
    <AuthCard
      title="Đăng nhập"
      subtitle="Nhập thông tin tài khoản để tiếp tục."
      footer={
        <>
          Chưa có tài khoản?{" "}
          <Link to={ROUTES.REGISTER} className="font-medium text-brand-600 hover:underline">
            Đăng ký ngay
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <FormField
          id="username"
          label="Tên đăng nhập hoặc Email"
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

        <div className="flex items-center justify-between text-sm mt-1">
          <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none hover:text-slate-800 transition">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 accent-brand-600 cursor-pointer"
              {...register("rememberMe")}
            />
            <span>Ghi nhớ đăng nhập</span>
          </label>
          <Link to={ROUTES.FORGOT_PASSWORD} className="font-medium text-brand-600 hover:underline">
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
          className="mt-2 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 shadow-md"
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
    </AuthCard>
  );
}
