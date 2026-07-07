import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "../components/Header";
import { bookingApi } from "../services/bookingApi";
import { getErrorMessage } from "../services/apiClient";
import { BookingStatus } from "../types/booking";

export function StaffBookingsPage() {
  const queryClient = useQueryClient();
  const [activeStatus, setActiveStatus] = useState<string>("all");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(0);
  const size = 10;

  // Query all bookings in system
  const { data, isLoading, error } = useQuery({
    queryKey: ["staffBookings", activeStatus, keyword, page],
    queryFn: () =>
      bookingApi.getAll({
        status: activeStatus === "all" ? undefined : activeStatus,
        keyword: keyword || undefined,
        page,
        size,
        sort: "createdAt,desc",
      }),
  });

  // Change status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: BookingStatus }) =>
      bookingApi.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffBookings"] });
      alert("Cập nhật trạng thái đặt phòng thành công!");
    },
    onError: (err) => {
      alert(getErrorMessage(err, "Không thể cập nhật trạng thái đặt phòng."));
    },
  });

  // Cancel booking mutation
  const cancelMutation = useMutation({
    mutationFn: (id: number) => bookingApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffBookings"] });
      alert("Hủy đặt phòng thành công!");
    },
    onError: (err) => {
      alert(getErrorMessage(err, "Hủy đặt phòng thất bại."));
    },
  });

  const bookings = data?.data?.content || [];
  const totalPages = data?.data?.totalPages || 0;
  const totalElements = data?.data?.totalElements || 0;

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

  const handleStatusChange = (id: number, status: BookingStatus) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleCancelClick = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn hủy đặt phòng này?")) {
      cancelMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 w-full flex-grow">
        {/* Title & Count */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">Quản lý đặt phòng (Staff)</h1>
          <p className="text-slate-400 text-sm mt-1">
            Tổng cộng có {totalElements} giao dịch đặt phòng trong hệ thống
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-8">
          {/* Status filter tabs */}
          <div className="flex border-b border-slate-100 gap-1 overflow-x-auto pb-px text-xs font-semibold">
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
                  setPage(0);
                }}
                className={`px-3 py-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
                  activeStatus === tab.id
                    ? "border-brand-600 text-brand-600"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Keyword Search */}
          <div className="flex gap-2 w-full sm:w-80">
            <input
              type="text"
              placeholder="Tìm kiếm theo mã đơn..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="flex-grow border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-brand-500 text-slate-700"
            />
          </div>
        </div>

        {/* Booking Table / Cards */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
            <p className="text-slate-400 text-sm font-medium mt-4">Đang tải danh sách...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-red-50 text-red-700 rounded-2xl border border-red-100">
            <p className="font-semibold">Lỗi tải dữ liệu</p>
            <p className="text-sm mt-1">{getErrorMessage(error)}</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center px-4">
            <p className="text-slate-500 font-semibold">Không tìm thấy đơn hàng nào</p>
            <p className="text-slate-400 text-sm mt-1">Hệ thống hiện không có giao dịch phù hợp với tiêu chí.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase text-[9px] tracking-wider">
                  <tr>
                    <th className="py-4 px-6">ID</th>
                    <th className="py-4 px-6">Khách hàng</th>
                    <th className="py-4 px-6">Phòng số</th>
                    <th className="py-4 px-6">Ngày Check-in / Out</th>
                    <th className="py-4 px-6">Số khách</th>
                    <th className="py-4 px-6">Trạng thái</th>
                    <th className="py-4 px-6 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700">
                  {bookings.map((booking) => {
                    const status = getStatusLabel(booking.status);
                    return (
                      <tr key={booking.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-4.5 px-6 font-extrabold text-slate-800">#{booking.id}</td>
                        <td className="py-4.5 px-6 font-bold">User #{booking.userId}</td>
                        <td className="py-4.5 px-6 font-bold">Room #{booking.roomId}</td>
                        <td className="py-4.5 px-6 font-medium text-slate-500">
                          {booking.checkInDate} / {booking.checkOutDate}
                        </td>
                        <td className="py-4.5 px-6 text-slate-500 font-semibold">{booking.guests} khách</td>
                        <td className="py-4.5 px-6">
                          <span className={`px-2.5 py-0.5 border rounded-full text-[9px] uppercase font-bold ${status.className}`}>
                            {status.text}
                          </span>
                        </td>
                        <td className="py-4.5 px-6 text-right flex justify-end gap-1.5">
                          {/* Confirm action */}
                          {booking.status === "pending" && (
                            <button
                              onClick={() => handleStatusChange(booking.id, "confirmed")}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 rounded-lg transition cursor-pointer"
                            >
                              Xác nhận
                            </button>
                          )}

                          {/* Complete action */}
                          {booking.status === "confirmed" && (
                            <button
                              onClick={() => handleStatusChange(booking.id, "completed")}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 rounded-lg transition cursor-pointer"
                            >
                              Hoàn thành
                            </button>
                          )}

                          {/* Cancel action */}
                          {(booking.status === "pending" || booking.status === "confirmed") && (
                            <button
                              onClick={() => handleCancelClick(booking.id)}
                              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-100 rounded-lg transition cursor-pointer"
                            >
                              Hủy bỏ
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
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
    </div>
  );
}
