import { useState } from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { bookingApi } from "../services/bookingApi";
import { getErrorMessage } from "../services/apiClient";
import type { BookingDetailDTO } from "../types/booking";

export function BookingLookupPage() {
  const [bookingIdInput, setBookingIdInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingDetails, setBookingDetails] = useState<BookingDetailDTO | null>(null);

  const handleLookupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBookingDetails(null);

    // Sanitize Booking ID (extract digits)
    const numericIdStr = bookingIdInput.replace(/\D/g, "");
    if (!numericIdStr) {
      setError("Vui lòng nhập Mã đặt phòng hợp lệ (số ID hoặc HB-ID).");
      return;
    }

    if (!emailInput) {
      setError("Vui lòng nhập địa chỉ email đã dùng đặt phòng.");
      return;
    }

    const bookingId = parseInt(numericIdStr);
    setIsLoading(true);

    try {
      const response = await bookingApi.publicLookup(bookingId, emailInput);
      if (response.success && response.data) {
        setBookingDetails(response.data);
      } else {
        setError(response.message || "Không tìm thấy thông tin đặt phòng.");
      }
    } catch (err: any) {
      setError(getErrorMessage(err, "Không tìm thấy thông tin đặt phòng với thông tin đã nhập."));
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "confirmed":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-100";
      case "completed":
        return "bg-green-50 text-green-700 border-green-100";
      default:
        return "bg-slate-50 text-slate-700 border-slate-100";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận";
      case "confirmed":
        return "Đã xác nhận";
      case "cancelled":
        return "Đã hủy";
      case "completed":
        return "Đã hoàn thành";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 w-full flex-grow flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 w-full max-w-5xl items-center">
          
          {/* Left Column - Content */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-slate-700">
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full w-fit border border-emerald-100">
              🛡️ Hệ thống tra cứu an toàn
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-800 leading-tight">
              Quản lý kỳ nghỉ <br />
              <span className="text-brand-600">Dễ dàng & Nhanh chóng</span>
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed max-w-lg">
              Không cần đăng nhập, bạn có thể tìm thấy mọi thông tin về phòng đã đặt, lịch trình và hóa đơn chỉ với vài thông tin cơ bản.
            </p>

            <div className="mt-4 flex flex-col gap-5">
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0 text-sm">
                  🎫
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800">Mã đặt phòng là gì?</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-normal max-w-md">
                    Là số ID đơn hàng hoặc chuỗi định dạng (ví dụ: HB-15) được gửi trong email xác nhận sau khi bạn đặt phòng thành công.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0 text-sm">
                  📞
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800">Cần hỗ trợ ngay?</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-normal">
                    Hotline <span className="font-bold text-slate-800">1900 6789</span> luôn sẵn sàng giải đáp mọi thắc mắc của bạn 24/7.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Form Card */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl">
              <h2 className="text-lg font-bold text-slate-800">Tra cứu thông tin</h2>
              <p className="text-xs text-slate-400 mt-1 mb-6">Vui lòng điền thông tin bên dưới để bắt đầu</p>

              <form onSubmit={handleLookupSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Mã đặt phòng (Booking ID)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      🔑
                    </span>
                    <input 
                      type="text" 
                      required
                      placeholder="VD: HB-15 hoặc 15"
                      value={bookingIdInput}
                      onChange={(e) => setBookingIdInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs focus:border-brand-500 focus:bg-white focus:outline-none transition text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Email hoặc Số điện thoại
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      ✉️
                    </span>
                    <input 
                      type="email" 
                      required
                      placeholder="Nhập email đã dùng đặt phòng"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs focus:border-brand-500 focus:bg-white focus:outline-none transition text-slate-800"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-xs text-rose-700 font-medium">
                    ⚠️ {error}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#0b1528] hover:bg-brand-600 text-white font-bold py-3.5 rounded-xl transition duration-200 cursor-pointer shadow-md flex items-center justify-center gap-2 text-xs disabled:bg-slate-400"
                >
                  {isLoading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  ) : (
                    <>Tìm kiếm thông tin ➔</>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <button 
                  onClick={() => alert("Vui lòng liên hệ Hotline 1900 6789 để được cấp lại mã đặt phòng.")}
                  className="text-slate-400 hover:text-brand-600 transition font-medium cursor-pointer"
                >
                  Quên mã đặt phòng?
                </button>
                <div className="text-slate-400 flex items-center gap-1.5">
                  <span>Hoặc liên hệ qua</span>
                  <button onClick={() => alert("Tổng đài hỗ trợ: 1900 6789")} className="hover:text-brand-600 transition cursor-pointer">💬</button>
                  <button onClick={() => alert("Hotline: 1900 6789")} className="hover:text-brand-600 transition cursor-pointer">📞</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Booking Details Display Section */}
      {bookingDetails && (
        <section className="bg-slate-100 py-16 w-full border-t border-slate-200/60">
          <div className="mx-auto max-w-3xl px-4">
            <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4 mb-6">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chi tiết đơn đặt phòng</span>
                  <h3 className="text-lg font-bold text-slate-800 mt-0.5">
                    Mã đặt phòng: <span className="text-brand-600 font-extrabold">HB-{bookingDetails.id}</span>
                  </h3>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeClass(bookingDetails.status)}`}>
                    {getStatusLabel(bookingDetails.status)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    bookingDetails.paymentStatus === "completed" 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                      : "bg-amber-50 text-amber-700 border-amber-100"
                  }`}>
                    {bookingDetails.paymentStatus === "completed" ? "Đã thanh toán" : "Chờ thanh toán"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm mb-6">
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Khách hàng</p>
                  <p className="font-semibold text-slate-800">{bookingDetails.user.username}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{bookingDetails.user.email}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Số lượng khách</p>
                  <p className="font-semibold text-slate-800">{bookingDetails.guests} người lớn</p>
                </div>

                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Ngày nhận phòng</p>
                  <p className="font-semibold text-slate-800">{bookingDetails.checkInDate}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Ngày trả phòng</p>
                  <p className="font-semibold text-slate-800">{bookingDetails.checkOutDate}</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs text-brand-600 font-bold uppercase tracking-wider mb-0.5">Phòng đã đặt</p>
                  <h4 className="text-sm font-bold text-slate-800">
                    Phòng {bookingDetails.room.roomNumber} - Loại: {bookingDetails.room.type}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-normal max-w-sm line-clamp-1">
                    {bookingDetails.room.description || "Phòng nghỉ cao cấp đầy đủ tiện nghi chuẩn 5 sao."}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Tổng chi phí</p>
                  <p className="text-base font-extrabold text-brand-600">
                    {(bookingDetails.totalPrice * 20000).toLocaleString("vi-VN")} VNĐ
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
