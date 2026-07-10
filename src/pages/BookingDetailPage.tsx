import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "../components/Header";
import { bookingApi } from "../services/bookingApi";
import { paymentApi } from "../services/paymentApi";
import { useAuthStore } from "../store/authStore";
import { getErrorMessage } from "../services/apiClient";
import { ROUTES } from "../constants/routes";
import { PaymentMethod } from "../types/payment";

export function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const bookingId = parseInt(id || "0");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  // Form states for checkout
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credit_card");
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Fetch booking details
  const { data: bookingData, isLoading, error } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => bookingApi.getById(bookingId),
    enabled: bookingId > 0,
    refetchInterval: (query) => {
      // Poll payment status if it is pending
      const paymentStatus = query.state.data?.data?.paymentStatus;
      return paymentStatus === "pending" ? 5000 : false;
    },
  });

  // Pre-fill user data
  useEffect(() => {
    if (user) {
      setFullName(user.username);
      setEmail(user.email);
    }
  }, [user]);

  // Payment mutation
  const paymentMutation = useMutation({
    mutationFn: (body: { bookingId: number; amount: number; paymentMethod: PaymentMethod }) =>
      paymentApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking", bookingId] });
      alert("Thanh toán thành công!");
    },
    onError: (err) => {
      setCheckoutError(getErrorMessage(err, "Thanh toán thất bại."));
    },
  });

  // Cancellation mutation
  const cancelMutation = useMutation({
    mutationFn: () => bookingApi.delete(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking", bookingId] });
      alert("Hủy đặt phòng thành công!");
      navigate(ROUTES.MY_BOOKINGS);
    },
    onError: (err) => {
      alert(getErrorMessage(err, "Hủy đặt phòng thất bại."));
    },
  });

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingData?.data) return;

    if (!fullName || !phone || !email) {
      setCheckoutError("Vui lòng nhập đầy đủ họ tên, số điện thoại và email.");
      return;
    }

    const amount = bookingData.data.room.price * 20000 * 2; // Fixed conversion or base total price

    paymentMutation.mutate({
      bookingId,
      amount,
      paymentMethod,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error || !bookingData?.data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <div className="flex-grow max-w-xl mx-auto px-4 py-20 text-center">
          <div className="p-6 bg-red-50 text-red-700 rounded-2xl border border-red-100 shadow-sm">
            <h2 className="font-bold text-lg">Lỗi tải thông tin đặt phòng</h2>
            <p className="text-sm mt-1">{getErrorMessage(error)}</p>
          </div>
        </div>
      </div>
    );
  }

  const booking = bookingData.data;
  const room = booking.room;
  const status = booking.status;
  const paymentStatus = booking.paymentStatus;

  // Calculation details
  const checkIn = new Date(booking.checkInDate);
  const checkOut = new Date(booking.checkOutDate);
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
  const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const basePriceVND = room.price * 20000;
  const roomTotal = basePriceVND * nights;
  const tax = roomTotal * 0.1;
  const total = roomTotal + tax;

  const getStatusBadgeClass = () => {
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

  const getStatusLabel = () => {
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

  const getMockHotelName = (id: number) => {
    if (id === 1 || id % 2 === 1) return "InterContinental Danang Sun Peninsula";
    return "Ocean Breeze Resort";
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 w-full flex-grow">
        {/* Progress Bar Mockup */}
        <div className="flex justify-center items-center gap-2 text-xs font-semibold text-slate-400 mb-8">
          <span className="flex items-center gap-1.5 text-brand-600">
            <span className="h-5 w-5 bg-brand-600 text-white rounded-full flex items-center justify-center text-[10px]">1</span>
            Thông tin
          </span>
          <span className="h-px w-10 bg-slate-200"></span>
          <span className="flex items-center gap-1.5">
            <span className="h-5 w-5 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center text-[10px]">2</span>
            Xác nhận
          </span>
        </div>

        {/* Outer Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Guest Info & Payment Form */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Guest Info Form */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h2 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
                <span className="text-brand-600">👤</span>
                Thông tin khách hàng
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Họ và tên</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={paymentStatus === "completed"}
                    placeholder="Nguyễn Văn A"
                    className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-xs outline-none focus:border-brand-500 text-slate-700 disabled:bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={paymentStatus === "completed"}
                    placeholder="090 123 4567"
                    className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-xs outline-none focus:border-brand-500 text-slate-700 disabled:bg-slate-50"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Địa chỉ Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={paymentStatus === "completed"}
                    placeholder="example@hotelbooking.com"
                    className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-xs outline-none focus:border-brand-500 text-slate-700 disabled:bg-slate-50"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Yêu cầu đặc biệt (Không bắt buộc)</label>
                  <textarea
                    rows={3}
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    disabled={paymentStatus === "completed"}
                    placeholder="Ví dụ: Phòng không hút thuốc, nhận phòng sớm..."
                    className="w-full border border-slate-200 rounded-lg p-3.5 text-xs outline-none focus:border-brand-500 text-slate-700 disabled:bg-slate-50"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Form */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h2 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
                <span className="text-brand-600">💳</span>
                Phương thức thanh toán
              </h2>

              {paymentStatus === "completed" ? (
                <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl flex items-center gap-3">
                  <span className="text-xl">✅</span>
                  <div>
                    <p className="font-bold text-xs">Đã thanh toán thành công!</p>
                    <p className="text-[10px] text-emerald-600 mt-0.5">HotelBooking đã xác thực giao dịch cho đơn hàng này.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCheckoutSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-3">
                    {[
                      { id: "credit_card", label: "Thẻ tín dụng / Ghi nợ", sub: "Visa, Mastercard, JCB, American Express", icon: "💳" },
                      { id: "bank_transfer", label: "Chuyển khoản ngân hàng", sub: "Xác nhận nhanh trong vòng 15 phút", icon: "🏦" },
                      { id: "paypal", label: "Ví điện tử", sub: "MoMo, ZaloPay, ShopeePay", icon: "👛" },
                    ].map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-start gap-3 p-4 rounded-xl border transition cursor-pointer hover:bg-slate-50 ${
                          paymentMethod === method.id
                            ? "border-brand-600 bg-brand-50/20"
                            : "border-slate-200"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === method.id}
                          onChange={() => setPaymentMethod(method.id as PaymentMethod)}
                          className="mt-1 h-4.5 w-4.5 text-brand-600 border-slate-200 focus:ring-brand-500 cursor-pointer"
                        />
                        <div className="flex-grow flex justify-between items-center text-xs">
                          <div>
                            <p className="font-bold text-slate-800">{method.label}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{method.sub}</p>
                          </div>
                          <span className="text-xl">{method.icon}</span>
                        </div>
                      </label>
                    ))}
                  </div>

                  {checkoutError && (
                    <p className="bg-red-50 text-red-700 border border-red-100 rounded-lg px-3 py-2 text-xs">
                      {checkoutError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={paymentMutation.isPending}
                    className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-sm transition hover:scale-[1.01] shadow-lg shadow-brand-600/10 cursor-pointer disabled:opacity-60"
                  >
                    {paymentMutation.isPending ? "Đang xử lý..." : "Hoàn tất đặt phòng"}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Column: Booking Summary Card */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Hotel Image & Name */}
              <div className="relative h-44">
                <img
                  src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=600"
                  alt="Hotel"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="font-bold text-sm">{getMockHotelName(room.hotelId)}</h3>
                  <p className="text-[10px] text-slate-300 mt-0.5 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    Bãi Bắc, Sơn Trà, Đà Nẵng, Việt Nam
                  </p>
                </div>
              </div>

              {/* Booking Info Fields */}
              <div className="p-5 flex flex-col gap-4 text-xs text-slate-700">
                {/* Status Badges */}
                <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                  <span className="font-bold text-slate-400">Trạng thái đơn:</span>
                  <span className={`px-2.5 py-0.5 border rounded-full font-bold uppercase text-[9px] ${getStatusBadgeClass()}`}>
                    {getStatusLabel()}
                  </span>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4 border-b border-slate-50 pb-4">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">Nhận phòng</p>
                    <p className="font-extrabold text-slate-800">{booking.checkInDate}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">Trả phòng</p>
                    <p className="font-extrabold text-slate-800">{booking.checkOutDate}</p>
                  </div>
                </div>

                {/* Room and Nights */}
                <div className="flex justify-between border-b border-slate-50 pb-3 font-semibold">
                  <span className="text-slate-500">Loại phòng:</span>
                  <span className="text-slate-800">{room.type}</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-3 font-semibold">
                  <span className="text-slate-500">Số phòng:</span>
                  <span className="text-slate-800">#{room.roomNumber}</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-3 font-semibold">
                  <span className="text-slate-500">Số đêm:</span>
                  <span className="text-slate-800">{nights} đêm</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-3 font-semibold">
                  <span className="text-slate-500">Số khách:</span>
                  <span className="text-slate-800">{booking.guests} khách</span>
                </div>

                {/* Price Breakdown */}
                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex justify-between font-medium text-slate-500">
                    <span>Giá phòng (x{nights} đêm):</span>
                    <span>{roomTotal.toLocaleString("vi-VN")}đ</span>
                  </div>
                  <div className="flex justify-between font-medium text-slate-500">
                    <span>Thuế &amp; phí dịch vụ (10%):</span>
                    <span>{tax.toLocaleString("vi-VN")}đ</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-slate-800 text-sm border-t border-slate-100 pt-3.5">
                    <span>Tổng cộng:</span>
                    <span className="text-brand-600 text-base">{total.toLocaleString("vi-VN")}đ</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cancel Booking Action */}
            {(status === "pending" || status === "confirmed") && (
              <button
                onClick={() => {
                  if (confirm("Bạn có chắc chắn muốn hủy đặt phòng này không?")) {
                    cancelMutation.mutate();
                  }
                }}
                disabled={cancelMutation.isPending}
                className="w-full py-3 border border-red-200 text-red-600 font-bold hover:bg-red-50 rounded-xl text-xs transition cursor-pointer disabled:opacity-50"
              >
                {cancelMutation.isPending ? "Đang hủy..." : "Hủy đơn đặt phòng"}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
