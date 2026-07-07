import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "../components/Header";
import { notificationApi } from "../services/notificationApi";
import { getErrorMessage } from "../services/apiClient";

export function NotificationsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const size = 10;

  // Query notifications
  const { data, isLoading, error } = useQuery({
    queryKey: ["notifications", page],
    queryFn: () =>
      notificationApi.getAll({
        page,
        size,
        sort: "createdAt,desc",
      }),
  });

  const notifications = data?.data?.content || [];
  const totalPages = data?.data?.totalPages || 0;

  // Mutation to mark a notification as read
  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (err) => {
      alert(getErrorMessage(err, "Không thể đánh dấu thông báo này là đã đọc."));
    },
  });

  // Mark all as read helper
  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => n.status === "unread");
    if (unreadNotifications.length === 0) return;

    try {
      await Promise.all(unreadNotifications.map((n) => notificationApi.markAsRead(n.id)));
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      alert("Đã đánh dấu tất cả thông báo là đã đọc.");
    } catch {
      alert("Có lỗi xảy ra khi cập nhật thông báo.");
    }
  };

  const handleNotificationClick = (id: number, status: string) => {
    if (status === "unread") {
      markAsReadMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 w-full flex-grow">
        {/* Title and Action Row */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">Thông báo</h1>
            <p className="text-slate-400 text-sm mt-1">Cập nhật tin tức mới nhất về đặt phòng của bạn</p>
          </div>
          <button
            onClick={handleMarkAllAsRead}
            className="text-brand-600 hover:text-brand-700 font-semibold text-xs border border-brand-100 bg-brand-50/50 hover:bg-brand-50 px-3.5 py-2 rounded-xl transition cursor-pointer"
          >
            Đánh dấu tất cả đã đọc
          </button>
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
            <p className="text-slate-400 text-sm font-medium mt-4">Đang tải thông báo...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-red-50 text-red-700 rounded-2xl border border-red-100 shadow-sm">
            <p className="font-semibold">Lỗi tải thông báo</p>
            <p className="text-sm mt-1">{getErrorMessage(error)}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center px-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-slate-500 font-semibold mt-4">Bạn chưa có thông báo nào</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif.id, notif.status)}
                className={`p-5 rounded-2xl border shadow-sm transition duration-200 cursor-pointer flex justify-between items-start gap-4 ${
                  notif.status === "unread"
                    ? "bg-white border-brand-100 ring-1 ring-brand-50"
                    : "bg-white/80 border-slate-100 opacity-80 hover:opacity-100"
                }`}
              >
                <div className="flex gap-3.5 items-start">
                  <span className={`text-base p-1.5 rounded-full ${notif.status === "unread" ? "bg-brand-50 text-brand-600" : "bg-slate-50 text-slate-400"}`}>
                    🔔
                  </span>
                  <div>
                    <p className={`text-xs text-slate-700 leading-relaxed ${notif.status === "unread" ? "font-bold text-slate-800" : "font-medium"}`}>
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">
                      {new Date(notif.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                </div>

                {notif.status === "unread" && (
                  <span className="h-2 w-2 bg-brand-600 rounded-full flex-shrink-0 mt-2"></span>
                )}
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-1.5 mt-6 text-sm font-semibold">
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
    </div>
  );
}
