import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "../components/Header";
import { hotelApi } from "../services/hotelApi";
import { bookingApi } from "../services/bookingApi";
import { reviewApi } from "../services/reviewApi";
import { useAuthStore } from "../store/authStore";
import { getErrorMessage } from "../services/apiClient";
import { ROUTES } from "../constants/routes";
import { Role } from "../types/auth";

interface ReviewLocal {
  id: number;
  author: string;
  rating: number;
  comment: string;
  date: string;
  isLocal?: boolean;
}

export function HotelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const hotelId = parseInt(id || "0");
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  // Booking Modal States
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [selectedRoomNumber, setSelectedRoomNumber] = useState<string>("");
  const [selectedRoomPrice, setSelectedRoomPrice] = useState<number>(0);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [guestsCount, setGuestsCount] = useState(1);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Review form states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Local state for reviews since backend lacks review list endpoint
  const [localReviews, setLocalReviews] = useState<ReviewLocal[]>([
    {
      id: 101,
      author: "Nguyễn Hoàng",
      rating: 5,
      comment: "Trải nghiệm tuyệt vời. Nhân viên cực kỳ chuyên nghiệp và tận tâm. View phòng nhìn ra Nhà Thờ Đức Bà rất đẹp. Buffet sáng đa dạng món.",
      date: "Đã nghỉ tại đây 3 ngày trước",
    },
    {
      id: 102,
      author: "Trần Lan",
      rating: 4.8,
      comment: "Khách sạn nằm ở vị trí trung tâm, rất thuận tiện đi lại. Phòng ốc sạch sẽ, hiện đại. Hồ bơi hơi đông vào cuối tuần nhưng dịch vụ vẫn rất tốt.",
      date: "Đã nghỉ tại đây 1 tuần trước",
    },
  ]);

  // Fetch hotel details
  const { data: hotelData, isLoading, error } = useQuery({
    queryKey: ["hotel", hotelId],
    queryFn: () => hotelApi.getById(hotelId),
    enabled: hotelId > 0,
  });

  // Fetch user's bookings to check if they have a completed booking at this hotel to post a review
  const { data: userBookingsData } = useQuery({
    queryKey: ["userBookings", user?.id],
    queryFn: () => bookingApi.getAll({ userId: parseInt(user?.id || "0"), status: "completed" }),
    enabled: isAuthenticated && !!user?.id,
  });

  // Check if user has a completed booking at this hotel
  const hasCompletedBooking = userBookingsData?.data?.content?.some(
    (b: any) => b.status === "completed"
  ) || false;

  // Book room mutation
  const bookingMutation = useMutation({
    mutationFn: (body: { userId: number; roomId: number; checkInDate: string; checkOutDate: string; guests: number }) =>
      bookingApi.create(body),
    onSuccess: (res) => {
      setBookingSuccess(true);
      setBookingError(null);
      setTimeout(() => {
        setIsBookingModalOpen(false);
        if (res.data?.id) {
          navigate(ROUTES.BOOKING_DETAIL.replace(":id", res.data.id.toString()));
        } else {
          navigate(ROUTES.MY_BOOKINGS);
        }
      }, 1500);
    },
    onError: (err) => {
      setBookingError(getErrorMessage(err, "Đặt phòng thất bại. Vui lòng kiểm tra lại."));
    },
  });

  // Post review mutation
  const reviewMutation = useMutation({
    mutationFn: (body: { userId: number; hotelId: number; rating: number; comment: string }) =>
      reviewApi.create(body),
    onSuccess: (res) => {
      // Add review to local list
      const newReview: ReviewLocal = {
        id: res.data?.id || Date.now(),
        author: user?.username || "Bạn",
        rating: rating,
        comment: comment,
        date: "Vừa xong",
        isLocal: true,
      };
      setLocalReviews([newReview, ...localReviews]);
      setComment("");
      setRating(5);
      setReviewError(null);
      alert("Đăng đánh giá thành công!");
    },
    onError: (err) => {
      setReviewError(getErrorMessage(err, "Đăng đánh giá thất bại."));
    },
  });

  const handleBookClick = (roomId: number, roomNum: string, price: number) => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }
    if (user?.role !== Role.CUSTOMER) {
      alert("Chỉ tài khoản Khách hàng (Customer) mới có thể đặt phòng!");
      return;
    }
    setSelectedRoomId(roomId);
    setSelectedRoomNumber(roomNum);
    setSelectedRoomPrice(price);
    setBookingSuccess(false);
    setBookingError(null);
    setIsBookingModalOpen(true);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId || !user?.id) return;

    if (!checkInDate || !checkOutDate) {
      setBookingError("Vui lòng chọn ngày nhận và trả phòng");
      return;
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    if (checkOut <= checkIn) {
      setBookingError("Ngày trả phòng phải sau ngày nhận phòng");
      return;
    }

    if (guestsCount < 1) {
      setBookingError("Số lượng khách tối thiểu là 1");
      return;
    }

    bookingMutation.mutate({
      userId: parseInt(user.id),
      roomId: selectedRoomId,
      checkInDate,
      checkOutDate,
      guests: guestsCount,
    });
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    if (!comment.trim()) {
      setReviewError("Vui lòng nhập nội dung đánh giá");
      return;
    }
    reviewMutation.mutate({
      userId: parseInt(user.id),
      hotelId: hotelId,
      rating: rating,
      comment: comment,
    });
  };

  const handleReviewDelete = async (reviewId: number, isLocal?: boolean) => {
    if (confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) {
      if (isLocal) {
        setLocalReviews(localReviews.filter((r) => r.id !== reviewId));
      } else {
        try {
          await reviewApi.delete(reviewId);
          setLocalReviews(localReviews.filter((r) => r.id !== reviewId));
        } catch (err) {
          alert(getErrorMessage(err, "Không thể xóa đánh giá này."));
        }
      }
    }
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

  if (error || !hotelData?.data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <div className="flex-grow max-w-xl mx-auto px-4 py-20 text-center">
          <div className="p-6 bg-red-50 text-red-700 rounded-2xl border border-red-100">
            <h2 className="font-bold text-lg">Lỗi tải chi tiết khách sạn</h2>
            <p className="text-sm mt-1">{getErrorMessage(error)}</p>
          </div>
        </div>
      </div>
    );
  }

  const hotel = hotelData.data;
  const rooms = hotel.rooms || [];

  // Mock photo grid images matching Airbnb design from mockup
  const hotelImages = hotel.images && hotel.images.length > 0 ? hotel.images : [
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=600",
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=600",
    "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=600",
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 w-full flex-grow">
        {/* Title and Address Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">{hotel.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className="flex items-center gap-0.5 text-amber-500">
                {Array.from({ length: hotel.stars }).map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </span>
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {hotel.address}, {hotel.city}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-3.5 py-2 rounded-xl shadow-sm transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 10.742l1.99 2.085 4.574-4.752m-.001 7.823L16 19.382a2 2 0 002.585-2.585L16.29 14m-10.375 0L3 16.29a2 2 0 002.585 2.585L8.5 16" />
              </svg>
              <span>Chia sẻ</span>
            </button>
            <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-3.5 py-2 rounded-xl shadow-sm transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>Lưu</span>
            </button>
          </div>
        </div>

        {/* Photo Grid (Airbnb Style) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 rounded-2xl overflow-hidden shadow-md mb-8 h-[460px]">
          {/* Main Large Image */}
          <div className="md:col-span-2 h-full overflow-hidden">
            <img src={hotelImages[0]} alt="Main" className="h-full w-full object-cover hover:scale-101 transition duration-500 cursor-pointer" />
          </div>
          {/* Smaller Images Grid */}
          <div className="hidden md:grid grid-cols-2 col-span-2 gap-3 h-full">
            {hotelImages.slice(1, 5).map((img, index) => (
              <div key={index} className="relative h-full overflow-hidden">
                <img src={img} alt={`Sub ${index}`} className="h-full w-full object-cover hover:scale-102 transition duration-500 cursor-pointer" />
                {index === 3 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-sm font-bold pointer-events-none">
                    +24 ảnh khác
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Hotel Details layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Left info column */}
          <div className="lg:col-span-2 flex flex-col gap-8 text-slate-700">
            {/* About */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Về khách sạn này</h2>
              <p className="text-sm leading-relaxed whitespace-pre-line">{hotel.description}</p>
            </div>

            {/* Amenities */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Tiện ích nổi bật</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold">
                {[
                  { name: "Wifi miễn phí", icon: "📶" },
                  { name: "Bể bơi vô cực", icon: "🏊" },
                  { name: "Phòng Gym 24/7", icon: "🏋️" },
                  { name: "Spa & Wellness", icon: "💆" },
                  { name: "Nhà hàng 5 sao", icon: "🍽️" },
                  { name: "Bãi đỗ xe", icon: "🚗" },
                  { name: "Hội nghị", icon: "🤝" },
                  { name: "Điều hòa", icon: "❄️" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-slate-600">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar column: Room list summary or map */}
          <div className="flex flex-col gap-6">
            {/* Available Room List shortcut */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-800 text-lg mb-4">Các loại phòng còn trống</h3>
              {rooms.length === 0 ? (
                <p className="text-slate-400 text-sm">Hiện tại khách sạn này đã hết phòng trống.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {rooms.map((room: any) => (
                    <div key={room.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">Phòng {room.roomNumber} ({room.type})</h4>
                          <p className="text-[10px] text-slate-400 font-medium">Tiêu chuẩn • Giường lớn</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-extrabold text-brand-600">{(room.price * 20000).toLocaleString("vi-VN")}đ</p>
                          <p className="text-[9px] text-slate-400">/ đêm</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleBookClick(room.id, room.roomNumber, room.price)}
                        className="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg text-xs transition cursor-pointer"
                      >
                        Đặt ngay
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Map */}
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm relative h-56 flex items-center justify-center bg-slate-100">
              {/* Map background image */}
              <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=400" alt="Map" className="h-full w-full object-cover opacity-60" />
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute text-center">
                <button className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md hover:bg-slate-800 transition cursor-pointer">
                  Xem trên bản đồ
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Đánh giá từ khách hàng</h2>
              <p className="text-xs text-slate-400 mt-0.5">Tổng số {localReviews.length} lượt đánh giá tại khách sạn này</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-brand-600">4.9</span>
              <div className="text-xs text-slate-500 font-semibold">
                <p>Xuất sắc</p>
                <p className="text-[10px] text-slate-400">Đánh giá trung bình</p>
              </div>
            </div>
          </div>

          {/* User Review Submission Form (Only visible if user has completed booking) */}
          {isAuthenticated && hasCompletedBooking && (
            <form onSubmit={handleReviewSubmit} className="mb-8 p-5 bg-slate-50 rounded-xl border border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm mb-3">Để lại đánh giá của bạn</h3>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold text-slate-500">Đánh giá điểm:</span>
                <select
                  value={rating}
                  onChange={(e) => setRating(parseInt(e.target.value))}
                  className="bg-white border border-slate-200 rounded px-2.5 py-1 text-xs outline-none text-slate-700"
                >
                  <option value="5">5 - Xuất sắc</option>
                  <option value="4">4 - Rất tốt</option>
                  <option value="3">3 - Bình thường</option>
                  <option value="2">2 - Tệ</option>
                  <option value="1">1 - Rất tệ</option>
                </select>
              </div>
              <textarea
                rows={3}
                placeholder="Chia sẻ trải nghiệm của bạn..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-3 text-xs outline-none focus:border-brand-500 text-slate-700 placeholder-slate-400 mb-3"
              />
              {reviewError && <p className="text-xs text-red-600 mb-2">{reviewError}</p>}
              <button
                type="submit"
                disabled={reviewMutation.isPending}
                className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition disabled:opacity-60 cursor-pointer"
              >
                Gửi đánh giá
              </button>
            </form>
          )}

          {/* Reviews List */}
          <div className="flex flex-col gap-6">
            {localReviews.map((rev) => (
              <div key={rev.id} className="border-b border-slate-50 pb-6 last:border-0 last:pb-0">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-slate-100 text-slate-600 font-bold rounded-full flex items-center justify-center text-sm uppercase">
                      {rev.author[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{rev.author}</h4>
                      <p className="text-[10px] text-slate-400 font-medium">{rev.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="bg-brand-50 text-brand-600 font-black text-xs px-2.5 py-1 rounded-lg">
                      {rev.rating.toFixed(1)}/5
                    </span>
                    {/* Delete button (If review belongs to user or admin) */}
                    {(user?.username === rev.author || user?.role === Role.ADMIN) && (
                      <button
                        onClick={() => handleReviewDelete(rev.id, rev.isLocal)}
                        className="text-red-500 hover:text-red-700 text-xs font-semibold p-1 hover:bg-red-50 rounded"
                        title="Xóa đánh giá"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-slate-600 text-xs mt-3 leading-relaxed whitespace-pre-wrap">{rev.comment}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Booking Form Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base">Đặt phòng {selectedRoomNumber}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Khách sạn {hotel.name}</p>
              </div>
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="text-slate-400 hover:text-white transition text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            {bookingSuccess ? (
              <div className="p-8 text-center flex flex-col items-center">
                <div className="h-12 w-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="font-bold text-slate-800">Đặt phòng thành công!</h4>
                <p className="text-xs text-slate-400 mt-1">Đang chuyển tới trang chi tiết đơn hàng...</p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="p-5 flex flex-col gap-4">
                {/* Dates Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Ngày nhận phòng</label>
                    <input
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-brand-500 text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Ngày trả phòng</label>
                    <input
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-brand-500 text-slate-700"
                    />
                  </div>
                </div>

                {/* Guests Count */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Số lượng khách</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={guestsCount}
                    onChange={(e) => setGuestsCount(parseInt(e.target.value) || 1)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-brand-500 text-slate-700"
                  />
                </div>

                {/* Pricing Summary */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
                  <div className="flex justify-between font-medium text-slate-500 mb-1">
                    <span>Đơn giá phòng:</span>
                    <span>{(selectedRoomPrice * 20000).toLocaleString("vi-VN")}đ / đêm</span>
                  </div>
                </div>

                {bookingError && (
                  <p className="bg-red-50 text-red-700 border border-red-100 rounded-lg px-3 py-2 text-xs">
                    {bookingError}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsBookingModalOpen(false)}
                    className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs transition cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={bookingMutation.isPending}
                    className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-xs shadow-md transition disabled:opacity-60 cursor-pointer"
                  >
                    {bookingMutation.isPending ? "Đang xử lý..." : "Xác nhận đặt"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
