import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { notificationApi } from "../services/notificationApi";
import { bookingApi } from "../services/bookingApi";
import { useAuthStore } from "../store/authStore";
import { getErrorMessage } from "../services/apiClient";
import { toast } from "../components/Toast";
import { ROUTES } from "../constants/routes";
import { BookingStatus } from "../types/booking";

type FilterTab = "ALL" | "SUCCESS" | "CANCELLED" | "SYSTEM";

interface CombinedNotification {
  id: string;
  type: "booking_success" | "booking_cancelled" | "system";
  title: string;
  message: string;
  createdAt: string;
  status: "read" | "unread";
  bookingId?: number;
  hotelName?: string;
  roomName?: string;
  checkInDate?: string;
  checkOutDate?: string;
  totalPrice?: number;
}

export function NotificationsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const userId = user?.id || 0;

  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [page, setPage] = useState(0);
  const size = 15;

  // 1. Fetch system notifications
  const { data: notifRes, isLoading: isNotifLoading, error: notifError } = useQuery({
    queryKey: ["notifications", page],
    queryFn: () => notificationApi.getAll({ page: 0, size: 50, sort: "createdAt,desc" }),
  });

  // 2. Fetch user's bookings to generate real booking status notifications
  const { data: bookingsRes, isLoading: isBookingsLoading } = useQuery({
    queryKey: ["myNotificationsBookings", userId],
    queryFn: () => bookingApi.getAll({ userId, page: 0, size: 50, sort: "createdAt,desc" }),
    enabled: userId > 0,
  });

  // Mutation to mark a system notification as read
  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => notificationApi.markAsRead(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, "Không thể đánh dấu thông báo là đã đọc."));
    },
  });

  // Combine system notifications & user booking status notifications
  const allNotifications = useMemo<CombinedNotification[]>(() => {
    const list: CombinedNotification[] = [];

    // Map system notifications
    const systemNotifs = notifRes?.data?.content || [];
    systemNotifs.forEach((n) => {
      list.push({
        id: `sys-${n.id}`,
        type: "system",
        title: "Thông báo hệ thống",
        message: n.message,
        createdAt: n.createdAt,
        status: (n.status as "read" | "unread") || "read",
      });
    });

    // Map bookings into notifications (Đặt phòng thành công vs Hủy phòng thành công)
    const bookings = bookingsRes?.data?.content || [];
    bookings.forEach((b: any) => {
      const isCancelled = b.status === BookingStatus.CANCELLED;
      const isPending = b.status === BookingStatus.PENDING_PAYMENT;
      const hotelName = b.hotelName || "Khách sạn";
      const roomName = b.roomNumber ? `Phòng ${b.roomNumber}` : "Phòng nghỉ";

      if (isCancelled) {
        list.push({
          id: `book-cancel-${b.id}`,
          type: "booking_cancelled",
          title: "Hủy phòng thành công",
          message: `Đơn đặt phòng #${b.id} tại ${hotelName} (${roomName}) đã được hủy thành công.`,
          createdAt: b.updatedAt || b.createdAt || new Date().toISOString(),
          status: "read",
          bookingId: b.id,
          hotelName,
          roomName,
          checkInDate: b.checkInDate,
          checkOutDate: b.checkOutDate,
          totalPrice: b.totalPrice,
        });
      } else {
        // Confirmed, Completed, or Pending Payment -> Booking Success
        list.push({
          id: `book-success-${b.id}`,
          type: "booking_success",
          title: isPending ? "Đặt phòng thành công (Chờ thanh toán)" : "Đặt phòng thành công",
          message: `Bạn đã đặt thành công ${roomName} tại ${hotelName}. Thời gian: ${b.checkInDate} đến ${b.checkOutDate}.`,
          createdAt: b.createdAt || new Date().toISOString(),
          status: "read",
          bookingId: b.id,
          hotelName,
          roomName,
          checkInDate: b.checkInDate,
          checkOutDate: b.checkOutDate,
          totalPrice: b.totalPrice,
        });
      }
    });

    // Sort by date descending
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  }, [notifRes, bookingsRes]);

  // Filtered notifications based on active tab
  const filteredNotifications = useMemo(() => {
    if (activeTab === "SUCCESS") return allNotifications.filter((n) => n.type === "booking_success");
    if (activeTab === "CANCELLED") return allNotifications.filter((n) => n.type === "booking_cancelled");
    if (activeTab === "SYSTEM") return allNotifications.filter((n) => n.type === "system");
    return allNotifications;
  }, [allNotifications, activeTab]);

  const totalFiltered = filteredNotifications.length;
  const totalPages = Math.ceil(totalFiltered / size) || 1;
  const paginatedNotifications = useMemo(() => {
    const start = page * size;
    return filteredNotifications.slice(start, start + size);
  }, [filteredNotifications, page, size]);

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Đã đánh dấu tất cả thông báo hệ thống là đã đọc.");
    } catch {
      toast.error("Có lỗi xảy ra khi cập nhật thông báo.");
    }
  };

  const handleNotificationClick = (item: CombinedNotification) => {
    if (item.id.startsWith("sys-")) {
      const rawId = parseInt(item.id.replace("sys-", ""));
      if (item.status === "unread" && !isNaN(rawId)) {
        markAsReadMutation.mutate(rawId);
      }
    }
    if (item.bookingId) {
      navigate(`${ROUTES.BOOKING_HISTORY}?id=${item.bookingId}`);
    }
  };

  const isLoading = isNotifLoading || isBookingsLoading;

  return (
    <div className="flex flex-col flex-1 font-sans">
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 w-full flex-grow">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              Thông báo đặt phòng
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Theo dõi chi tiết kết quả Đặt phòng thành công và Hủy phòng thành công của bạn
            </p>
          </div>
          <button
            onClick={handleMarkAllAsRead}
            className="text-brand-700 hover:text-brand-800 font-bold text-xs border border-brand-100 bg-brand-50 hover:bg-brand-100/70 px-4 py-2.5 rounded-xl transition shadow-sm cursor-pointer"
          >
            Đánh dấu tất cả đã đọc
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-slate-100 pb-3">
          <button
            onClick={() => { setActiveTab("ALL"); setPage(0); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === "ALL"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            Tất cả ({allNotifications.length})
          </button>
          <button
            onClick={() => { setActiveTab("SUCCESS"); setPage(0); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "SUCCESS"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100"
            }`}
          >
            <i className="fa-solid fa-circle-check text-xs"></i>
            Đặt phòng thành công ({allNotifications.filter((n) => n.type === "booking_success").length})
          </button>
          <button
            onClick={() => { setActiveTab("CANCELLED"); setPage(0); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "CANCELLED"
                ? "bg-rose-600 text-white shadow-sm"
                : "bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-100"
            }`}
          >
            <i className="fa-solid fa-circle-xmark text-xs"></i>
            Hủy phòng thành công ({allNotifications.filter((n) => n.type === "booking_cancelled").length})
          </button>
          <button
            onClick={() => { setActiveTab("SYSTEM"); setPage(0); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "SYSTEM"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100"
            }`}
          >
            <i className="fa-solid fa-bell text-xs"></i>
            Hệ thống ({allNotifications.filter((n) => n.type === "system").length})
          </button>
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
            <p className="text-slate-400 text-sm font-medium mt-4">Đang tải danh sách thông báo...</p>
          </div>
        ) : notifError ? (
          <div className="p-8 text-center bg-red-50 text-red-700 rounded-2xl border border-red-100 shadow-sm">
            <p className="font-semibold">Lỗi tải thông báo</p>
            <p className="text-sm mt-1">{getErrorMessage(notifError)}</p>
          </div>
        ) : paginatedNotifications.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center px-4">
            <i className="fa-regular fa-bell-slash text-4xl text-slate-300 mb-2"></i>
            <p className="text-slate-600 font-bold mt-2">Không có thông báo nào</p>
            <p className="text-slate-400 text-xs mt-1">Các cập nhật đặt phòng hoặc hủy phòng sẽ hiển thị tại đây</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            {paginatedNotifications.map((item) => {
              const isSuccess = item.type === "booking_success";
              const isCancelled = item.type === "booking_cancelled";

              return (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-5 rounded-2xl border shadow-sm transition-all duration-200 cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                    isSuccess
                      ? "bg-white border-emerald-100 hover:border-emerald-200 hover:shadow-md"
                      : isCancelled
                      ? "bg-white border-rose-100 hover:border-rose-200 hover:shadow-md"
                      : "bg-white border-slate-100 hover:border-slate-200"
                  }`}
                >
                  <div className="flex gap-4 items-start flex-1">
                    {/* Icon indicator */}
                    <div
                      className={`p-3 rounded-xl shrink-0 flex items-center justify-center text-lg ${
                        isSuccess
                          ? "bg-emerald-50 text-emerald-600"
                          : isCancelled
                          ? "bg-rose-50 text-rose-600"
                          : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      <i
                        className={
                          isSuccess
                            ? "fa-solid fa-circle-check"
                            : isCancelled
                            ? "fa-solid fa-circle-xmark"
                            : "fa-solid fa-bell"
                        }
                      ></i>
                    </div>

                    {/* Notification Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            isSuccess
                              ? "bg-emerald-100 text-emerald-800"
                              : isCancelled
                              ? "bg-rose-100 text-rose-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {item.title}
                        </span>

                        {item.bookingId && (
                          <span className="text-[11px] font-bold text-slate-400">
                            Mã đơn: #{item.bookingId}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed font-semibold mt-1.5">
                        {item.message}
                      </p>

                      {/* Extra metadata details for booking */}
                      {item.bookingId && (
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-50">
                          {item.checkInDate && item.checkOutDate && (
                            <span>
                              <i className="fa-regular fa-calendar mr-1 text-slate-400"></i>
                              {item.checkInDate} &rarr; {item.checkOutDate}
                            </span>
                          )}
                          {item.totalPrice && (
                            <span className="font-bold text-slate-700">
                              <i className="fa-solid fa-money-bill-wave mr-1 text-emerald-600"></i>
                              {item.totalPrice.toLocaleString("vi-VN")} VNĐ
                            </span>
                          )}
                        </div>
                      )}

                      <p className="text-[10px] text-slate-400 font-medium mt-2">
                        <i className="fa-regular fa-clock mr-1"></i>
                        {new Date(item.createdAt).toLocaleString("vi-VN")}
                      </p>
                    </div>
                  </div>

                  {/* Right Action Button */}
                  {item.bookingId && (
                    <Link
                      to={`${ROUTES.BOOKING_HISTORY}?id=${item.bookingId}`}
                      onClick={(e) => e.stopPropagation()}
                      className="shrink-0 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5 self-end sm:self-center"
                    >
                      <span>Xem chi tiết đơn</span>
                      <i className="fa-solid fa-chevron-right text-[10px]"></i>
                    </Link>
                  )}
                </div>
              );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-1.5 mt-8 text-sm font-semibold">
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
                        ? "bg-slate-900 border-slate-900 text-white"
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
    </div>
  );
}
