import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { userApi } from "../services/userApi";
import { getErrorMessage } from "../services/apiClient";
import { FormField } from "../components/FormField";

// Validation Schema for Profile
const profileSchema = z.object({
  fullName: z.string().min(2, "Họ và tên tối thiểu 2 ký tự"),
  phone: z.string().regex(/^$|^(0[3|5|7|8|9])[0-9]{8}$/, "Số điện thoại không hợp lệ (VD: 0912345678)"),
  email: z.string().email("Email không hợp lệ"),
});
type ProfileFormValues = z.infer<typeof profileSchema>;

// Validation Schema for Password Change
const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, "Vui lòng nhập mật khẩu cũ"),
    newPassword: z.string().min(6, "Mật khẩu mới phải từ 6 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });
type PasswordFormValues = z.infer<typeof passwordSchema>;

export function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const userId = user?.id || 0;
  const [activeTab, setActiveTab] = useState<"info" | "password">("info");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState<string | null>(null);
  const [passwordErrorMsg, setPasswordErrorMsg] = useState<string | null>(null);
  const [avatarSuccessMsg, setAvatarSuccessMsg] = useState<string | null>(null);
  const [avatarErrorMsg, setAvatarErrorMsg] = useState<string | null>(null);

  // Forms setup
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    setValue: setProfileValue,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormValues>({ resolver: zodResolver(profileSchema) });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormValues>({ resolver: zodResolver(passwordSchema) });

  // Pre-fill fields
  useEffect(() => {
    if (user?.email) {
      setProfileValue("email", user.email);
    }
    if (user?.fullName) {
      setProfileValue("fullName", user.fullName);
    }
    if (user?.phone) {
      setProfileValue("phone", user.phone);
    }
    if (user?.avatarUrl) {
      setAvatarPreview(user.avatarUrl);
    }
  }, [user, setProfileValue]);

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: (body: ProfileFormValues) =>
      userApi.update(userId, {
        email: body.email,
        fullName: body.fullName,
        phone: body.phone,
        status: user?.status || "active",
      }),
    onSuccess: (res) => {
      setProfileSuccessMsg("Cập nhật thông tin cá nhân thành công!");
      setProfileErrorMsg(null);
      if (user && res.data) {
        setUser({
          ...user,
          email: res.data.email,
          fullName: res.data.fullName,
          phone: res.data.phone,
        });
      }
    },
    onError: (err) => {
      setProfileErrorMsg(getErrorMessage(err, "Cập nhật thất bại."));
      setProfileSuccessMsg(null);
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (body: PasswordFormValues) =>
      userApi.changePassword(userId, {
        oldPassword: body.oldPassword,
        newPassword: body.newPassword,
      }),
    onSuccess: () => {
      setPasswordSuccessMsg("Thay đổi mật khẩu thành công!");
      setPasswordErrorMsg(null);
      resetPasswordForm();
    },
    onError: (err) => {
      setPasswordErrorMsg(getErrorMessage(err, "Đổi mật khẩu thất bại. Mật khẩu cũ có thể không chính xác."));
      setPasswordSuccessMsg(null);
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => userApi.updateAvatar(userId, file),
    onSuccess: (res) => {
      setAvatarSuccessMsg("Cập nhật ảnh đại diện thành công!");
      setAvatarErrorMsg(null);
      if (user && res.data) {
        setUser({ ...user, avatarUrl: res.data });
        setAvatarPreview(res.data);
      }
    },
    onError: (err) => {
      setAvatarErrorMsg(getErrorMessage(err, "Tải ảnh đại diện thất bại."));
      setAvatarSuccessMsg(null);
    },
  });

  const handleProfileSubmit = (values: ProfileFormValues) => {
    updateProfileMutation.mutate(values);
  };

  const handlePasswordSubmit = (values: PasswordFormValues) => {
    changePasswordMutation.mutate(values);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarPreview(URL.createObjectURL(file));
      
      // Auto-upload when file is selected
      uploadAvatarMutation.mutate(file);
    }
  };

  return (
    <div className="flex flex-col flex-1 font-sans">

      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 w-full flex-grow">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Hồ sơ cá nhân</h1>
          <p className="text-slate-400 text-sm mt-1">Cập nhật thông tin tài khoản và cấu hình bảo mật của bạn</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left panel: Avatar & summary */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col items-center text-center h-fit">
            <div className="relative group">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={user?.username}
                  className="h-28 w-28 rounded-full object-cover ring-4 ring-brand-50"
                />
              ) : (
                <div className="h-28 w-28 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-3xl ring-4 ring-brand-50">
                  {user?.username ? user.username[0].toUpperCase() : "U"}
                </div>
              )}

              <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition duration-200 cursor-pointer">
                <i className="fa-solid fa-camera mr-1 text-sm"></i> Thay đổi
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={uploadAvatarMutation.isPending}
                />
              </label>
            </div>

            {uploadAvatarMutation.isPending && (
              <p className="text-xs text-slate-400 mt-2 font-medium">Đang tải ảnh lên...</p>
            )}
            {avatarSuccessMsg && (
              <p className="text-xs text-green-600 mt-2 font-semibold">{avatarSuccessMsg}</p>
            )}
            {avatarErrorMsg && (
              <p className="text-xs text-red-600 mt-2 font-semibold">{avatarErrorMsg}</p>
            )}

            <h3 className="text-lg font-bold text-slate-800 mt-4">{user?.fullName || user?.username}</h3>
            <p className="text-xs text-slate-400 font-semibold">{user?.email}</p>

            <span className="mt-3 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-[10px] font-bold uppercase tracking-wider">
              {user?.role?.replace("ROLE_", "") || "CUSTOMER"}
            </span>

            {/* Profile Navigation Links */}
            <div className="w-full border-t border-slate-100 mt-6 pt-6 flex flex-col gap-2">
              <button
                onClick={() => setActiveTab("info")}
                className={`w-full py-2.5 px-4 rounded-xl text-left text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${
                  activeTab === "info"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <i className="fa-solid fa-user-gear"></i>
                Thông tin cá nhân
              </button>
              <button
                onClick={() => setActiveTab("password")}
                className={`w-full py-2.5 px-4 rounded-xl text-left text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${
                  activeTab === "password"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <i className="fa-solid fa-key"></i>
                Đổi mật khẩu
              </button>
            </div>
          </div>

          {/* Right panel: Details and forms */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm">
            {activeTab === "info" && (
              <div>
                <h2 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2.5">
                  <i className="fa-solid fa-user-pen text-brand-600"></i>
                  Thông tin cá nhân
                </h2>

                <form onSubmit={handleSubmitProfile(handleProfileSubmit)} className="flex flex-col gap-5" noValidate>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Tên đăng nhập (Username)</label>
                    <input
                      type="text"
                      value={user?.username || ""}
                      disabled
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none text-slate-400 cursor-not-allowed font-medium"
                    />
                  </div>

                  <FormField
                    id="fullName"
                    label="Họ và tên"
                    autoComplete="name"
                    error={profileErrors.fullName?.message}
                    {...registerProfile("fullName")}
                  />

                  <FormField
                    id="phone"
                    label="Số điện thoại"
                    type="tel"
                    autoComplete="tel"
                    error={profileErrors.phone?.message}
                    {...registerProfile("phone")}
                  />

                  <FormField
                    id="email"
                    label="Địa chỉ Email"
                    type="email"
                    autoComplete="email"
                    error={profileErrors.email?.message}
                    {...registerProfile("email")}
                  />

                  {profileSuccessMsg && (
                    <p className="rounded-lg bg-green-50 px-3.5 py-2.5 text-xs text-green-700 border border-green-100">
                      {profileSuccessMsg}
                    </p>
                  )}
                  {profileErrorMsg && (
                    <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-xs text-red-700 border border-red-100">
                      {profileErrorMsg}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="w-fit bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition shadow-md shadow-brand-600/10 cursor-pointer disabled:opacity-60 mt-2"
                  >
                    {updateProfileMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </form>
              </div>
            )}

            {activeTab === "password" && (
              <div>
                <h2 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2.5">
                  <i className="fa-solid fa-lock-open text-brand-600"></i>
                  Thay đổi mật khẩu
                </h2>

                <form onSubmit={handleSubmitPassword(handlePasswordSubmit)} className="flex flex-col gap-4" noValidate>
                  <FormField
                    id="oldPassword"
                    label="Mật khẩu cũ"
                    type="password"
                    autoComplete="current-password"
                    error={passwordErrors.oldPassword?.message}
                    {...registerPassword("oldPassword")}
                  />
                  <FormField
                    id="newPassword"
                    label="Mật khẩu mới"
                    type="password"
                    autoComplete="new-password"
                    error={passwordErrors.newPassword?.message}
                    {...registerPassword("newPassword")}
                  />
                  <FormField
                    id="confirmPassword"
                    label="Xác nhận mật khẩu mới"
                    type="password"
                    autoComplete="new-password"
                    error={passwordErrors.confirmPassword?.message}
                    {...registerPassword("confirmPassword")}
                  />

                  {passwordSuccessMsg && (
                    <p className="rounded-lg bg-green-50 px-3.5 py-2.5 text-xs text-green-700 border border-green-100">
                      {passwordSuccessMsg}
                    </p>
                  )}
                  {passwordErrorMsg && (
                    <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-xs text-red-700 border border-red-100">
                      {passwordErrorMsg}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={changePasswordMutation.isPending}
                    className="w-fit bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition shadow-md shadow-brand-600/10 cursor-pointer disabled:opacity-60 mt-2"
                  >
                    {changePasswordMutation.isPending ? "Đang cập nhật..." : "Đổi mật khẩu"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>

    </div>
  );
}
