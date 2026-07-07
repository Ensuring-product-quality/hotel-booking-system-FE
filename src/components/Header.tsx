import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useAuth } from "../hooks/useAuth";
import { ROUTES } from "../constants/routes";
import { Role } from "../types/auth";
import { apiClient } from "../services/apiClient";
import type { StandardResponse, PageResponse } from "../types/common";
import type { NotificationResponseDTO } from "../types/notification";

export function Header() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const { logout } = useAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  // Poll for notifications unread count every 30 seconds if authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchUnreadCount = async () => {
      try {
        const res = await apiClient.get<StandardResponse<PageResponse<NotificationResponseDTO>>>(
          "/notifications",
          { params: { status: "unread", size: 100 } }
        );
        if (res.data.success && res.data.data) {
          setUnreadCount(res.data.data.totalElements);
        }
      } catch {
        // Silent error
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await logout();
  };

  const isLinkActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
        {/* Logo */}
        <Link to={ROUTES.HOME} className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight text-brand-600 transition hover:text-brand-700">
            HotelNow
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link
            to={ROUTES.HOTELS}
            className={`transition hover:text-brand-600 ${
              isLinkActive(ROUTES.HOTELS) ? "text-brand-600 font-semibold" : ""
            }`}
          >
            Tìm phòng
          </Link>
          <a href="#" className="transition hover:text-brand-600">
            Ưu đãi
          </a>
          <a href="#" className="transition hover:text-brand-600">
            Điểm đến
          </a>
          {isAuthenticated && user?.role === Role.CUSTOMER && (
            <Link
              to={ROUTES.MY_BOOKINGS}
              className={`transition hover:text-brand-600 ${
                isLinkActive(ROUTES.MY_BOOKINGS) ? "text-brand-600 font-semibold" : ""
              }`}
            >
              Của tôi
            </Link>
          )}
        </nav>

        {/* User / Actions */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-3 md:gap-5">
              {/* Notifications bell */}
              <Link
                to={ROUTES.NOTIFICATIONS}
                className="relative p-1.5 text-slate-500 hover:text-brand-600 rounded-full hover:bg-slate-50 transition"
                title="Thông báo"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </Link>

              {/* User Dropdown/Display */}
              <div className="relative group">
                <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-50 transition text-sm">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.username}
                      className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-100"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-sm">
                      {user?.username ? user.username[0].toUpperCase() : "U"}
                    </div>
                  )}
                  <span className="hidden sm:inline-block font-medium text-slate-700 max-w-[100px] truncate">
                    {user?.username}
                  </span>
                </button>

                {/* Dropdown menu */}
                <div className="absolute right-0 mt-1 w-52 rounded-xl border border-slate-100 bg-white p-1.5 shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50">
                  <div className="px-3 py-2 border-b border-slate-50 mb-1">
                    <p className="text-xs text-slate-400">Tài khoản</p>
                    <p className="text-sm font-semibold text-slate-700 truncate">{user?.email}</p>
                    <p className="text-[10px] inline-flex mt-1 px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase font-semibold">
                      {user?.role?.replace("ROLE_", "")}
                    </p>
                  </div>

                  {/* Customer specific links */}
                  {user?.role === Role.CUSTOMER && (
                    <Link
                      to={ROUTES.MY_BOOKINGS}
                      className="flex w-full items-center px-3 py-2 text-sm text-slate-600 rounded-lg hover:bg-slate-50 transition"
                    >
                      Đơn hàng của tôi
                    </Link>
                  )}

                  {/* Staff specific links */}
                  {(user?.role === Role.STAFF ||
                    user?.role === Role.MANAGER ||
                    user?.role === Role.ADMIN) && (
                    <Link
                      to={ROUTES.STAFF_BOOKINGS}
                      className="flex w-full items-center px-3 py-2 text-sm text-slate-600 rounded-lg hover:bg-slate-50 transition font-medium text-brand-700 bg-brand-50/50"
                    >
                      Quản lý đặt phòng
                    </Link>
                  )}

                  {/* Manager / Admin specific links */}
                  {(user?.role === Role.MANAGER || user?.role === Role.ADMIN) && (
                    <>
                      <Link
                        to={ROUTES.MANAGER_HOTELS}
                        className="flex w-full items-center px-3 py-2 text-sm text-slate-600 rounded-lg hover:bg-slate-50 transition"
                      >
                        Quản lý khách sạn
                      </Link>
                      <Link
                        to={ROUTES.MANAGER_ROOMS}
                        className="flex w-full items-center px-3 py-2 text-sm text-slate-600 rounded-lg hover:bg-slate-50 transition"
                      >
                        Quản lý phòng
                      </Link>
                      <Link
                        to={ROUTES.MANAGER_USERS}
                        className="flex w-full items-center px-3 py-2 text-sm text-slate-600 rounded-lg hover:bg-slate-50 transition"
                      >
                        Quản lý người dùng
                      </Link>
                    </>
                  )}

                  <hr className="my-1 border-slate-50" />
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 transition"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3 text-sm">
              <Link
                to={ROUTES.LOGIN}
                className="px-3.5 py-2 font-medium text-slate-600 hover:text-brand-600 rounded-lg hover:bg-slate-50 transition"
              >
                Đăng nhập
              </Link>
              <Link
                to={ROUTES.REGISTER}
                className="px-4 py-2 font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition hover:shadow-brand-100 hover:scale-[1.01]"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
