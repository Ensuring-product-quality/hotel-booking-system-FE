import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { bookingApi } from "../services/bookingApi";
import { useAuthStore } from "../store/authStore";
import { getErrorMessage } from "../services/apiClient";
import { ROUTES } from "../constants/routes";
import { BookingStatus } from "../types/booking";

const STATUS_TABS = [
  { id: "all",             label: "Tất cả",        icon: "fa-solid fa-list" },
  { id: "pending_payment", label: "Chờ xác nhận",  icon: "fa-solid fa-clock" },
  { id: "confirmed",       label: "Đã xác nhận",   icon: "fa-solid fa-circle-check" },
  { id: "checked_in",      label: "Đang nhận phòng",icon: "fa-solid fa-key" },
  { id: "checked_out",     label: "Đã trả phòng",  icon: "fa-solid fa-door-open" },
  { id: "completed",       label: "Hoàn thành",    icon: "fa-solid fa-star" },
  { id: "cancelled",       label: "Đã hủy",        icon: "fa-solid fa-ban" },
];

function getStatusMeta(status: BookingStatus) {
  switch (status) {
    case BookingStatus.PENDING_PAYMENT:
      return { text: "Chờ xác nhận", bg: "bg-amber-50", text_c: "text-amber-700", border: "border-amber-200", dot: "bg-amber-400" };
    case BookingStatus.CONFIRMED:
      return { text: "Đã xác nhận", bg: "bg-blue-50", text_c: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500" };
    case BookingStatus.CHECKED_IN:
      return { text: "Đang nhận phòng", bg: "bg-emerald-50", text_c: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" };
    case BookingStatus.CHECKED_OUT:
      return { text: "Đã trả phòng", bg: "bg-purple-50", text_c: "text-purple-700", border: "border-purple-200", dot: "bg-purple-500" };
    case BookingStatus.COMPLETED:
      return { text: "Hoàn thành", bg: "bg-green-50", text_c: "text-green-700", border: "border-green-200", dot: "bg-green-500" };
    case BookingStatus.CANCELLED:
      return { text: "Đã hủy", bg: "bg-red-50", text_c: "text-red-700", border: "border-red-200", dot: "bg-red-400" };
    default:
      return { text: status, bg: "bg-slate-50", text_c: "text-slate-600", border: "border-slate-200", dot: "bg-slate-400" };
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function calcNights(checkIn: string, checkOut: string) {
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  const diff = Math.abs(b.getTime() - a.getTime());
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function BookingHistoryPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const userId = user?.id || 0;

  const [activeStatus, setActiveStatus] = useState("all");
  const [page, setPage] = useState(0);
  const size = 6;

  const { data, isLoading, error } = useQuery({
    queryKey: ["bookingHistory", userId, activeStatus, page],
    queryFn: () =>
      bookingApi.getAll({
        userId,
        status: activeStatus === "all" ? undefined : activeStatus,
        page,
        size,
        sort: "createdAt,desc",
      }),
    enabled: isAuthenticated && userId > 0,
  });

  const bookings = data?.data?.content || [];
  const totalPages = data?.data?.totalPages || 0;

  // Not authenticated state
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col flex-1">
        <main className="mx-auto max-w-5xl px-4 py-20 w-full flex-grow flex flex-col items-center justify-center gap-6 text-center">
          <div className="h-24 w-24 rounded-full bg-brand-50 flex items-center justify-center mx-auto">
            <i className="fa-regular fa-calendar-check text-4xl text-brand-500"></i>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800">Lịch sử đặt phòng</h1>
          <p className="text-slate-500 max-w-md">
            Vui lòng đăng nhập để xem toàn bộ lịch sử đặt phòng và chi tiết từng đơn hàng của bạn.
          </p>
          <div className="flex gap-3">
            <Link
              to={`${ROUTES.LOGIN}?redirect=${ROUTES.MY_BOOKINGS}`}
              className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-brand-600/20"
            >
              Đăng nhập ngay
            </Link>
            <Link
              to={ROUTES.HOME}
              className="px-6 py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl text-sm hover:bg-slate-50 transition"
            >
              Về trang chủ
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-slate-50/50">
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 w-full flex-grow">

        {/* ── Page Header ── */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-1">
              <i className="fa-solid fa-calendar-days mr-1.5"></i>Quản lý đặt phòng
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
              Lịch sử đặt phòng
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Xem toàn bộ lịch sử và chi tiết các đơn đặt phòng của bạn
            </p>
          </div>
          <Link
            to={ROUTES.HOTELS}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-sm transition shadow-md shadow-brand-600/20 shrink-0"
          >
            <i className="fa-solid fa-plus text-xs"></i>
            Đặt phòng mới
          </Link>
        </div>

        {/* ── Status Filter Tabs ── */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 mb-6 scrollbar-hide">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveStatus(tab.id); setPage(0); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                activeStatus === tab.id
                  ? "bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-600/20"
                  : "bg-white text-slate-500 border-slate-200 hover:border-brand-300 hover:text-brand-600"
              }`}
            >
              <i className={`${tab.icon} text-[10px]`}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-100 shadow-sm gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
            <p className="text-slate-400 text-sm font-medium">Đang tải lịch sử đặt phòng...</p>
          </div>
        ) : error ? (
          <div className="p-10 text-center bg-red-50 text-red-600 rounded-2xl border border-red-100 shadow-sm">
            <i className="fa-solid fa-triangle-exclamation text-3xl mb-3 block"></i>
            <p className="font-bold text-base">Không thể tải dữ liệu</p>
            <p className="text-sm mt-1">{getErrorMessage(error)}</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center gap-4 px-4">
            <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center">
              <i className="fa-regular fa-clipboard text-4xl text-slate-300"></i>
            </div>
            <p className="text-slate-600 font-bold text-lg">Chưa có đơn đặt phòng</p>
            <p className="text-slate-400 text-sm max-w-xs">
              {activeStatus === "all"
                ? "Bạn chưa thực hiện đặt phòng nào. Hãy khám phá các khách sạn tuyệt vời ngay hôm nay!"
                : "Không có đơn đặt phòng nào ở trạng thái này."}
            </p>
            {activeStatus !== "all" && (
              <button
                onClick={() => setActiveStatus("all")}
                className="mt-2 px-4 py-2 text-xs font-semibold text-brand-600 hover:bg-brand-50 border border-brand-200 rounded-xl transition cursor-pointer"
              >
                Xem tất cả đơn
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {bookings.map((booking) => {
              const sm = getStatusMeta(booking.status as BookingStatus);
              const nights = calcNights(booking.checkInDate, booking.checkOutDate);

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
                >
                  <div className="flex flex-col sm:flex-row">

                    {/* Left accent bar */}
                    <div className={`w-full sm:w-1.5 h-1.5 sm:h-auto ${sm.dot} shrink-0`}></div>

                    {/* Main content */}
                    <div className="flex-1 p-5 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">

                        {/* Info block */}
                        <div className="flex-1 min-w-0">

                          {/* Header row */}
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${sm.bg} ${sm.text_c} ${sm.border}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${sm.dot}`}></span>
                              {sm.text}
                            </span>
                            <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                              Mã đơn: <span className="font-bold text-slate-600">#{booking.id}</span>
                            </span>
                          </div>

                          {/* Hotel name */}
                          <h3 className="font-extrabold text-slate-800 text-base sm:text-lg leading-tight mb-3 group-hover:text-brand-600 transition">
                            {booking.hotelName || "Khách sạn"}
                          </h3>

                          {/* Grid info */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-slate-400 font-semibold uppercase tracking-wide text-[10px]">
                                <i className="fa-solid fa-calendar-arrow-down mr-1"></i>Nhận phòng
                              </span>
                              <span className="text-slate-700 font-bold">{formatDate(booking.checkInDate)}</span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-slate-400 font-semibold uppercase tracking-wide text-[10px]">
                                <i className="fa-solid fa-calendar-arrow-up mr-1"></i>Trả phòng
                              </span>
                              <span className="text-slate-700 font-bold">{formatDate(booking.checkOutDate)}</span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-slate-400 font-semibold uppercase tracking-wide text-[10px]">
                                <i className="fa-solid fa-moon mr-1"></i>Số đêm
                              </span>
                              <span className="text-slate-700 font-bold">{nights} đêm</span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-slate-400 font-semibold uppercase tracking-wide text-[10px]">
                                <i className="fa-solid fa-users mr-1"></i>Số khách
                              </span>
                              <span className="text-slate-700 font-bold">{booking.guests} khách</span>
                            </div>
                          </div>

                          {/* Room tag */}
                          {booking.roomNumber && (
                            <div className="mt-3">
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                                <i className="fa-solid fa-door-closed text-slate-400"></i>
                                Phòng số: <span className="text-slate-700 font-bold">{booking.roomNumber}</span>
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Price + Action block */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 sm:gap-4 border-t border-slate-50 sm:border-0 pt-4 sm:pt-0 sm:min-w-[140px]">
                          <div className="text-right">
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Tổng chi phí</p>
                            <p className="text-lg font-extrabold text-brand-600">
                              {(booking.totalPrice || 0).toLocaleString("vi-VN")}
                              <span className="text-xs font-normal text-slate-400 ml-0.5">đ</span>
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              navigate(ROUTES.BOOKING_DETAIL.replace(":id", booking.id.toString()))
                            }
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-brand-600 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-sm"
                          >
                            <i className="fa-solid fa-eye text-[10px]"></i>
                            Xem chi tiết
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0}
                  className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
                >
                  <i className="fa-solid fa-chevron-left text-xs"></i>
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`h-9 w-9 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      page === i
                        ? "bg-brand-600 border-brand-600 text-white shadow-md shadow-brand-600/20"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages - 1}
                  className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
                >
                  <i className="fa-solid fa-chevron-right text-xs"></i>
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
