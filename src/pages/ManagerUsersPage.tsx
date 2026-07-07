import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "../components/Header";
import { userApi } from "../services/userApi";
import { useAuthStore } from "../store/authStore";
import { getErrorMessage } from "../services/apiClient";
import { Role, ALL_ROLES } from "../types/auth";
import type { User } from "../types/auth";
import type { UserCreateDTO } from "../services/userApi";

export function ManagerUsersPage() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);
  const isAdmin = currentUser?.role === Role.ADMIN;

  const [page, setPage] = useState(0);
  const size = 10;

  // Filter states
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [keyword, setKeyword] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>(Role.CUSTOMER);
  const [status, setStatus] = useState("active");
  const [formError, setFormError] = useState<string | null>(null);

  // Query users list
  const { data, isLoading, error } = useQuery({
    queryKey: ["managerUsers", roleFilter, statusFilter, keyword, page],
    queryFn: () =>
      userApi.getAll({
        role: roleFilter || undefined,
        status: statusFilter || undefined,
        keyword: keyword || undefined,
        page,
        size,
        sort: "id,desc",
      }),
  });

  const usersList = data?.data?.content || [];
  const totalPages = data?.data?.totalPages || 0;
  const totalElements = data?.data?.totalElements || 0;

  // Mutations
  const createMutation = useMutation({
    mutationFn: (body: UserCreateDTO) => userApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["managerUsers"] });
      closeModal();
      alert("Tạo người dùng mới thành công!");
    },
    onError: (err) => {
      setFormError(getErrorMessage(err, "Không thể tạo người dùng."));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: { email: string; status: string } }) =>
      userApi.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["managerUsers"] });
      closeModal();
      alert("Cập nhật thông tin thành công!");
    },
    onError: (err) => {
      setFormError(getErrorMessage(err, "Không thể cập nhật người dùng."));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => userApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["managerUsers"] });
      alert("Xóa tài khoản thành công!");
    },
    onError: (err) => {
      alert(getErrorMessage(err, "Xóa tài khoản thất bại."));
    },
  });

  const openModal = (usr: User | null = null) => {
    setFormError(null);
    if (usr) {
      setEditingUser(usr);
      setUsername(usr.username);
      setPassword(""); // Password cannot be edited directly this way
      setEmail(usr.email);
      setRole(usr.role);
      setStatus(usr.status);
    } else {
      setEditingUser(null);
      setUsername("");
      setPassword("");
      setEmail("");
      setRole(Role.CUSTOMER);
      setStatus("active");
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email) {
      setFormError("Vui lòng nhập tên đăng nhập và địa chỉ email.");
      return;
    }

    if (editingUser) {
      updateMutation.mutate({
        id: parseInt(editingUser.id),
        body: { email, status },
      });
    } else {
      if (!password) {
        setFormError("Vui lòng nhập mật khẩu cho tài khoản mới.");
        return;
      }
      createMutation.mutate({
        username,
        password,
        email,
        role,
        status,
      });
    }
  };

  const handleDeleteClick = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa tài khoản này không? Thao tác này không thể hoàn tác.")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 w-full flex-grow">
        {/* Title and Action */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">Quản lý người dùng</h1>
            <p className="text-slate-400 text-sm mt-1">
              Danh sách quản lý thành viên và phân quyền hệ thống (Tổng số: {totalElements})
            </p>
          </div>
          <button
            onClick={() => openModal(null)}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs shadow-md transition hover:scale-[1.01] cursor-pointer"
          >
            + Tạo tài khoản
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-8">
          <div className="flex flex-wrap gap-4 text-xs font-semibold items-center">
            {/* Role Filter */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Vai trò:</span>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(0);
                }}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none text-slate-700 font-semibold cursor-pointer"
              >
                <option value="">Tất cả</option>
                {ALL_ROLES.map((r) => (
                  <option key={r} value={r}>{r.replace("ROLE_", "")}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Trạng thái:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(0);
                }}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none text-slate-700 font-semibold cursor-pointer"
              >
                <option value="">Tất cả</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Tạm ngưng</option>
                <option value="banned">Khóa</option>
              </select>
            </div>
          </div>

          {/* Keyword Search */}
          <div className="w-full sm:w-80">
            <input
              type="text"
              placeholder="Tìm kiếm username, email..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(0);
              }}
              className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-brand-500 text-slate-700"
            />
          </div>
        </div>

        {/* Users Table */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
            <p className="text-slate-400 text-sm font-medium mt-4">Đang tải danh sách người dùng...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-red-50 text-red-700 rounded-2xl border border-red-100">
            <p className="font-semibold">Lỗi tải dữ liệu</p>
            <p className="text-sm mt-1">{getErrorMessage(error)}</p>
          </div>
        ) : usersList.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center px-4">
            <p className="text-slate-500 font-semibold">Không tìm thấy tài khoản nào</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase text-[9px] tracking-wider">
                  <tr>
                    <th className="py-4 px-6">ID</th>
                    <th className="py-4 px-6">Tên đăng nhập</th>
                    <th className="py-4 px-6">Email</th>
                    <th className="py-4 px-6">Vai trò</th>
                    <th className="py-4 px-6">Trạng thái</th>
                    <th className="py-4 px-6 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700">
                  {usersList.map((usr) => (
                    <tr key={usr.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-4.5 px-6 font-extrabold text-slate-800">#{usr.id}</td>
                      <td className="py-4.5 px-6 font-bold text-slate-800 flex items-center gap-2">
                        {usr.avatarUrl ? (
                          <img src={usr.avatarUrl} alt="" className="h-6 w-6 rounded-full object-cover" />
                        ) : (
                          <span className="h-6 w-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-[10px] uppercase">
                            {usr.username[0]}
                          </span>
                        )}
                        <span>{usr.username}</span>
                      </td>
                      <td className="py-4.5 px-6 font-medium text-slate-500">{usr.email}</td>
                      <td className="py-4.5 px-6">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold uppercase text-[9px]">
                          {usr.role.replace("ROLE_", "")}
                        </span>
                      </td>
                      <td className="py-4.5 px-6">
                        <span className={`px-2.5 py-0.5 border rounded-full text-[9px] uppercase font-bold ${
                          usr.status === "active"
                            ? "bg-green-50 text-green-700 border-green-100"
                            : usr.status === "banned"
                            ? "bg-red-50 text-red-700 border-red-100"
                            : "bg-slate-50 text-slate-700 border-slate-100"
                        }`}>
                          {usr.status === "active" ? "Hoạt động" : usr.status === "banned" ? "Bị khóa" : "Tạm ngưng"}
                        </span>
                      </td>
                      <td className="py-4.5 px-6 text-right flex justify-end gap-1.5">
                        <button
                          onClick={() => openModal(usr)}
                          className="px-2 py-1 border border-brand-100 text-brand-600 bg-brand-50/30 hover:bg-brand-50 rounded-lg transition text-[11px] font-semibold cursor-pointer"
                        >
                          Sửa
                        </button>
                        {isAdmin && usr.username !== currentUser?.username && (
                          <button
                            onClick={() => handleDeleteClick(parseInt(usr.id))}
                            className="px-2 py-1 border border-red-100 text-red-600 bg-red-50/30 hover:bg-red-50 rounded-lg transition text-[11px] font-semibold cursor-pointer"
                          >
                            Xóa
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-1.5 p-5 border-t border-slate-50 text-sm font-semibold">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0}
                  className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  &larr;
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`w-9 h-9 rounded-lg border transition cursor-pointer ${
                      page === i
                        ? "bg-brand-600 border-brand-600 text-white"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages - 1}
                  className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  &rarr;
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <h3 className="font-bold text-base">
                {editingUser ? "Cập nhật tài khoản" : "Tạo tài khoản mới"}
              </h3>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-white transition text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-5 flex flex-col gap-4 text-xs font-semibold text-slate-700">
              {/* Username */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tên đăng nhập (Username)</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={!!editingUser}
                  placeholder="admin123"
                  className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-xs outline-none focus:border-brand-500 text-slate-700 disabled:bg-slate-50"
                />
              </div>

              {/* Password (Only when creating) */}
              {!editingUser && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Mật khẩu</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-xs outline-none focus:border-brand-500 text-slate-700"
                  />
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Địa chỉ Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-xs outline-none focus:border-brand-500 text-slate-700"
                />
              </div>

              {/* Role (Only when creating, update is restricted in backend) */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Vai trò hệ thống</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={!!editingUser}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none text-slate-700 disabled:bg-slate-50"
                >
                  {ALL_ROLES.map((r) => (
                    <option key={r} value={r}>{r.replace("ROLE_", "")}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Trạng thái tài khoản</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none text-slate-700"
                >
                  <option value="active">Hoạt động (Active)</option>
                  <option value="inactive">Tạm ngưng (Inactive)</option>
                  <option value="banned">Khóa tài khoản (Banned)</option>
                </select>
              </div>

              {formError && (
                <p className="bg-red-50 text-red-700 border border-red-100 rounded-lg px-3 py-2 text-xs">
                  {formError}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-xs shadow-md transition cursor-pointer disabled:opacity-60"
                >
                  {createMutation.isPending || updateMutation.isPending ? "Đang lưu..." : "Xác nhận lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
