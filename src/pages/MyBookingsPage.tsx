import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "../components/Header";
import { bookingApi } from "../services/bookingApi";
import { useAuthStore } from "../store/authStore";
import { getErrorMessage } from "../services/apiClient";
import { ROUTES } from "../constants/routes";
import { BookingStatus } from "../types/booking";

export function MyBookingsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const userId = parseInt(user?.id || "0");

  const [activeStatus, setActiveStatus] = useState<string>("all");
  const [page, setPage] = useState(0);
  const size = 5;

  // Query user bookings
  const { data, isLoading, error } = useQuery({
    queryKey: ["myBookings", userId, activeStatus, page],
    queryFn: () =>
      bookingApi.getAll({
        userId,
        status: activeStatus === "all" ? undefined : activeStatus,
        page,
        size,
        sort: "createdAt,desc",
      }),
    enabled: userId > 0,
  });

  const bookings = data?.data?.content || [];
  const totalPages = data?.data?.totalPages || 0;

  const getStatusLabel = (status: BookingStatus) => {
    switch (status) {
      case "pending":
        return { text: "Chờ xác nhận", className: "bg-amber-50 text-amber-700 border-amber-100" };
      case "confirmed":
        return { text: "Đã xác nhận", className: "bg-blue-50 text-blue-700 border-blue-100" };
      case "cancelled":
        return { text: "Đã hủy", className: "bg-red-50 text-red-700 border-red-100" };
      case "completed":
        return { text: "Đã hoàn thành", className: "bg-green-50 text-green-700 border-green-100" };
      default:
        return { text: status, className: "bg-slate-50 text-slate-700 border-slate-100" };
    }
  };

  const getMockHotelName = (id: number) => {
    // Standard mock names matching seed database hotel IDs
    if (id === 1 || id % 2 === 1) return "Grand Palace Hotel";
    return "Ocean Breeze Resort";
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 w-full flex-grow">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">Đơn đặt phòng của tôi</h1>
          <p className="text-slate-400 text-sm mt-1">Quản lý lịch sử đặt phòng của bạn tại HotelBooking</p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex border-b border-slate-200 gap-1.5 overflow-x-auto pb-px mb-8 text-sm">
          {[
            { id: "all", label: "Tất cả" },
            { id: "pending", label: "Chờ xác nhận" },
            { id: "confirmed", label: "Đã xác nhận" },
            { id: "completed", label: "Đã hoàn thành" },
            { id: "cancelled", label: "Đã hủy" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveStatus(tab.id);
                setPage(0); // Reset page
              }}
              className={`px-4 py-3 font-semibold border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeStatus === tab.id
                  ? "border-brand-600 text-brand-600"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
            <p className="text-slate-400 text-sm font-medium mt-4">Đang tải danh sách đặt phòng...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-red-50 text-red-700 rounded-2xl border border-red-100 shadow-sm">
            <p className="font-semibold">Lỗi tải danh sách</p>
            <p className="text-sm mt-1">{getErrorMessage(error)}</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center px-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2m-6-9l2 2 4-4" />
            </svg>
            <p className="text-slate-500 font-semibold mt-4">Không tìm thấy đơn đặt phòng nào</p>
            <p className="text-slate-400 text-sm mt-1">Bạn chưa thực hiện giao dịch nào trong trạng thái này.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {bookings.map((booking) => {
              const status = getStatusLabel(booking.status);
              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 hover:shadow-md transition duration-300"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className={`text-[10px] font-bold uppercase border px-2 py-0.5 rounded-full ${status.className}`}>
                        {status.text}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400">Mã đơn: #{booking.id}</span>
                    </div>

                    <h3 className="font-extrabold text-slate-800 text-lg hover:text-brand-600 transition">
                      {getMockHotelName(booking.roomId)}
                    </h3>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-500 font-medium mt-1">
                      <p>
                        Ngày nhận: <span className="text-slate-700 font-semibold">{booking.checkInDate}</span>
                      </p>
                      <p>
                        Ngày trả: <span className="text-slate-700 font-semibold">{booking.checkOutDate}</span>
                      </p>
                      <p>Số khách: <span className="text-slate-700 font-semibold">{booking.guests} khách</span></p>
                      <p>Phòng số: <span className="text-slate-700 font-semibold">{booking.roomId}</span></p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t border-slate-50 sm:border-0 pt-4 sm:pt-0">
                    <button
                      onClick={() => navigate(ROUTES.BOOKING_DETAIL.replace(":id", booking.id.toString()))}
                      className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition cursor-pointer"
                    >
                      Chi tiết đơn
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-1.5 mt-4 text-sm font-semibold">
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
