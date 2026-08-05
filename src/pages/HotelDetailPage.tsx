import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { hotelApi } from "../services/hotelApi";
import { bookingApi } from "../services/bookingApi";
import { reviewApi } from "../services/reviewApi";
import { useAuthStore } from "../store/authStore";
import { getErrorMessage } from "../services/apiClient";
import { ROUTES } from "../constants/routes";
import { Role } from "../types/auth";
import {
  getMediaUrl,
  handleImageError,
  DEFAULT_HOTEL_IMAGE,
  DEFAULT_ROOM_IMAGE,
} from "../utils/imageUtils";

export function HotelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const hotelId = parseInt(id || "0");
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const queryClient = useQueryClient();

  // Image Upload & Replacement States
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const uploadImageMutation = useMutation({
    mutationFn: (variables: { file: File; index: number | null }) =>
      hotelApi.uploadImage(hotelId, variables.file, variables.index ?? undefined),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["hotel", hotelId] });
      void queryClient.invalidateQueries({ queryKey: ["hotels"] });
      void queryClient.invalidateQueries({ queryKey: ["managerHotels"] });
      setUploadingImage(false);
      setActiveImageIndex(null);
      alert("Tải lên hình ảnh khách sạn thành công!");
    },
    onError: (err) => {
      setUploadingImage(false);
      setActiveImageIndex(null);
      alert(getErrorMessage(err, "Tải lên hình ảnh thất bại."));
    },
  });

  const handleDetailImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploadingImage(true);
      uploadImageMutation.mutate({ file, index: activeImageIndex });
    }
  };

  const triggerImageReplacement = (index: number) => {
    if (user?.role === Role.MANAGER || user?.role === Role.ADMIN) {
      setActiveImageIndex(index);
      fileInputRef.current?.click();
    }
  };

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

  const { data: reviewsData } = useQuery({
    queryKey: ["reviews", hotelId],
    queryFn: () => reviewApi.getAll({ hotelId }),
    enabled: hotelId > 0,
  });

  const localReviews = (reviewsData?.data ?? []).map((review) => ({
    id: review.id,
    userId: review.userId,
    author: review.username,
    rating: review.rating,
    comment: review.comment,
    date: new Date(review.createdAt).toLocaleDateString("vi-VN"),
  }));

  // Fetch hotel details
  const { data: hotelData, isLoading, error } = useQuery({
    queryKey: ["hotel", hotelId],
    queryFn: () => hotelApi.getById(hotelId),
    enabled: hotelId > 0,
  });

  // Fetch user's bookings to check if they have a completed booking at this hotel to post a review
  const { data: userBookingsData } = useQuery({
    queryKey: ["userBookings", user?.id],
    queryFn: () => bookingApi.getAll({ userId: user?.id || 0, status: "completed" }),
    enabled: isAuthenticated && !!user?.id,
  });

  // Check if user has a completed booking at this hotel
  const hasCompletedBooking = userBookingsData?.data?.content?.some(
    (booking) => booking.status === "completed" && booking.hotelId === hotelId
  ) || false;

  // Book room mutation
  const bookingMutation = useMutation({
    mutationFn: (body: { roomId: number; checkInDate: string; checkOutDate: string; guests: number }) =>
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

  // Fetch booked dates for the selected room
  const { data: bookedDatesData } = useQuery({
    queryKey: ["bookedDates", selectedRoomId],
    queryFn: () => bookingApi.getBookedDates(selectedRoomId || 0),
    enabled: !!selectedRoomId && isBookingModalOpen,
  });
  const bookedDates = bookedDatesData?.data || [];

  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

  const formatDateStr = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const isDateBooked = (date: Date) => {
    const dateStr = formatDateStr(date);
    return bookedDates.some((range) => {
      return dateStr >= range.checkInDate && dateStr < range.checkOutDate;
    });
  };

  const isDateInPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const hasBookedDateInRange = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    while (start < end) {
      if (isDateBooked(start)) {
        return true;
      }
      start.setDate(start.getDate() + 1);
    }
    return false;
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
    const numDays = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= numDays; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const handleDayClick = (date: Date) => {
    if (isDateInPast(date) || isDateBooked(date)) return;
    const dateStr = formatDateStr(date);
    
    if (!checkInDate || (checkInDate && checkOutDate)) {
      setCheckInDate(dateStr);
      setCheckOutDate("");
      setBookingError(null);
    } else {
      if (dateStr <= checkInDate) {
        setCheckInDate(dateStr);
      } else {
        if (hasBookedDateInRange(checkInDate, dateStr)) {
          setBookingError("Khoảng thời gian chọn chứa ngày đã được đặt");
          return;
        }
        setCheckOutDate(dateStr);
        setBookingError(null);
      }
    }
  };

  // Post review mutation
  const reviewMutation = useMutation({
    mutationFn: (body: { hotelId: number; rating: number; comment: string }) =>
      reviewApi.create(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["reviews", hotelId] });
      void queryClient.invalidateQueries({ queryKey: ["hotel", hotelId] });
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
    setCheckInDate("");
    setCheckOutDate("");
    setCurrentYear(new Date().getFullYear());
    setCurrentMonth(new Date().getMonth());
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
      hotelId: hotelId,
      rating: rating,
      comment: comment,
    });
  };

  const handleReviewDelete = async (reviewId: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) {
      try {
        await reviewApi.delete(reviewId);
        await queryClient.invalidateQueries({ queryKey: ["reviews", hotelId] });
        await queryClient.invalidateQueries({ queryKey: ["hotel", hotelId] });
      } catch (err) {
        alert(getErrorMessage(err, "Không thể xóa đánh giá này."));
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !hotelData?.data) {
    return (
      <div className="flex-1 max-w-xl mx-auto px-4 py-20 text-center">
        <div className="p-6 bg-red-50 text-red-700 rounded-2xl border border-red-100">
          <h2 className="font-bold text-lg">Lỗi tải chi tiết khách sạn</h2>
          <p className="text-sm mt-1">{getErrorMessage(error)}</p>
        </div>
      </div>
    );
  }

  const hotel = hotelData.data;
  const rooms = (hotel.rooms || []).filter(
    (room) => room.status !== "inactive" && room.status !== "maintenance"
  );

  const hotelImages = hotel.images ?? [];

  return (
    <div className="flex flex-col flex-1">

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 w-full flex-grow">
        {/* Title and Address Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">{hotel.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className="flex items-center gap-0.5 text-amber-500">
                {Array.from({ length: hotel.stars }).map((_, i) => (
                  <i key={i} className="fa-solid fa-star text-xs"></i>
                ))}
              </span>
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                <i className="fa-solid fa-location-dot text-slate-350"></i>
                {hotel.address}, {hotel.city}
              </span>
            </div>
          </div>

          <div className="flex gap-2 items-center flex-wrap">
            {(user?.role === Role.MANAGER || user?.role === Role.ADMIN) && (
              <>
                <label 
                  onClick={() => setActiveImageIndex(null)}
                  className="flex items-center gap-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 px-3.5 py-2 rounded-xl shadow-md transition cursor-pointer"
                >
                  <i className="fa-solid fa-upload"></i>
                  <span>{uploadingImage ? "Đang tải ảnh..." : "Tải thêm ảnh mới"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleDetailImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleDetailImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
              </>
            )}
            <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-3.5 py-2 rounded-xl shadow-sm transition">
              <i className="fa-solid fa-share-nodes"></i>
              <span>Chia sẻ</span>
            </button>
            <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-3.5 py-2 rounded-xl shadow-sm transition">
              <i className="fa-regular fa-heart"></i>
              <span>Lưu</span>
            </button>
          </div>
        </div>

        {/* Hotel image gallery grid */}
        {hotelImages && hotelImages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 rounded-2xl overflow-hidden shadow-md mb-8 h-[240px] sm:h-[360px] md:h-[420px] bg-slate-100">
            {/* Left large featured image */}
            <div 
              className={`md:col-span-2 md:row-span-2 relative overflow-hidden h-full ${
                (user?.role === Role.MANAGER || user?.role === Role.ADMIN) ? "cursor-pointer group" : ""
              }`}
              onClick={() => triggerImageReplacement(0)}
            >
              <img
                src={getMediaUrl(hotelImages[0], DEFAULT_HOTEL_IMAGE)}
                onError={(e) => handleImageError(e, DEFAULT_HOTEL_IMAGE)}
                alt={hotel.name}
                className="h-full w-full object-cover group-hover:scale-[1.02] transition duration-500"
              />
              {(user?.role === Role.MANAGER || user?.role === Role.ADMIN) && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white gap-2">
                  <i className="fa-solid fa-camera text-2xl"></i>
                  <span className="text-sm font-bold">Thay đổi ảnh bìa</span>
                </div>
              )}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="absolute bottom-4 left-4 bg-white/90 hover:bg-white text-slate-800 text-[10px] sm:text-xs font-bold px-4 py-2 rounded-lg shadow-md flex items-center gap-1.5 transition cursor-pointer z-10"
              >
                📷 <span>Xem mọi bức ảnh ({hotelImages.length})</span>
              </button>
            </div>

            {/* Right smaller images (6 items) */}
            {hotelImages.slice(1, 7).map((imgUrl, i) => {
              const imageIndex = i + 1;
              return (
                <div 
                  key={i} 
                  className={`hidden md:block overflow-hidden h-full relative ${
                    (user?.role === Role.MANAGER || user?.role === Role.ADMIN) ? "cursor-pointer group" : ""
                  }`}
                  onClick={() => triggerImageReplacement(imageIndex)}
                >
                  <img
                    src={getMediaUrl(imgUrl, DEFAULT_HOTEL_IMAGE)}
                    onError={(e) => handleImageError(e, DEFAULT_HOTEL_IMAGE)}
                    alt={`${hotel.name} ${imageIndex + 1}`}
                    className="h-full w-full object-cover group-hover:scale-[1.02] transition duration-500"
                  />
                  {(user?.role === Role.MANAGER || user?.role === Role.ADMIN) && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white gap-1.5 text-center px-2">
                      <i className="fa-solid fa-camera text-lg"></i>
                      <span className="text-xs font-bold">Thay đổi ảnh này</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden shadow-md mb-8 h-[300px] bg-slate-100 flex flex-col items-center justify-center gap-3 text-sm font-semibold text-slate-400">
            <p>Khách sạn chưa có ảnh</p>
            {(user?.role === Role.MANAGER || user?.role === Role.ADMIN) && (
              <label className="flex items-center gap-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 px-4 py-2.5 rounded-xl shadow-md transition cursor-pointer">
                <i className="fa-solid fa-upload"></i>
                <span>Tải ảnh lên ngay</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleDetailImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
              </label>
            )}
          </div>
        )}

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
                    <div key={room.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-3">
                      {room.images && room.images[0] && (
                        <div className="h-32 w-full rounded-lg overflow-hidden bg-slate-100">
                          <img
                            src={getMediaUrl(room.images[0], DEFAULT_ROOM_IMAGE)}
                            onError={(e) => handleImageError(e, DEFAULT_ROOM_IMAGE)}
                            alt={`Phòng ${room.roomNumber}`}
                            className="h-full w-full object-cover hover:scale-105 transition duration-300"
                          />
                        </div>
                      )}
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">Phòng {room.roomNumber} ({room.type})</h4>
                          <p className="text-[10px] text-slate-400 font-medium">Tiêu chuẩn • Giường lớn</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-extrabold text-brand-600">{(room.price).toLocaleString("vi-VN")}đ</p>
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

            {/* Address link built from current hotel data */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="font-bold text-slate-800 mb-2">Vị trí khách sạn</h3>
              <p className="text-sm text-slate-500 mb-4">{hotel.address}, {hotel.city}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${hotel.address}, ${hotel.city}`)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
              >
                Xem trên bản đồ
              </a>
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
              <span className="text-2xl font-black text-brand-600">{hotel.averageRating.toFixed(1)}</span>
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
                    {(user?.id === rev.userId || user?.role === Role.ADMIN) && (
                      <button
                        onClick={() => handleReviewDelete(rev.id)}
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
                <div className="h-12 w-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4 text-xl">
                  <i className="fa-solid fa-circle-check"></i>
                </div>
                <h4 className="font-bold text-slate-800">Đặt phòng thành công!</h4>
                <p className="text-xs text-slate-400 mt-1">Đang chuyển tới trang chi tiết đơn hàng...</p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="p-5 flex flex-col gap-4">
                {/* Custom Interactive Calendar */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-3">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="p-1 px-2.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition"
                    >
                      &larr;
                    </button>
                    <span>
                      Tháng {currentMonth + 1} / {currentYear}
                    </span>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="p-1 px-2.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition"
                    >
                      &rarr;
                    </button>
                  </div>

                  {/* Day Names Row */}
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 uppercase">
                    <span>CN</span>
                    <span>T2</span>
                    <span>T3</span>
                    <span>T4</span>
                    <span>T5</span>
                    <span>T6</span>
                    <span>T7</span>
                  </div>

                  {/* Days Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {getDaysInMonth(currentYear, currentMonth).map((date, idx) => {
                      if (!date) {
                        return <div key={`empty-${idx}`} />;
                      }

                      const dateStr = formatDateStr(date);
                      const isPast = isDateInPast(date);
                      const isBooked = isDateBooked(date);
                      const isSelectedCheckIn = checkInDate === dateStr;
                      const isSelectedCheckOut = checkOutDate === dateStr;
                      const isWithinRange =
                        checkInDate &&
                        checkOutDate &&
                        dateStr > checkInDate &&
                        dateStr < checkOutDate;

                      let btnClass = "h-8 w-8 text-xs font-semibold rounded-lg flex items-center justify-center transition ";

                      if (isPast) {
                        btnClass += "text-slate-300 bg-transparent cursor-not-allowed";
                      } else if (isBooked) {
                        btnClass += "bg-red-100 text-red-500 line-through border border-red-100 cursor-not-allowed";
                      } else if (isSelectedCheckIn || isSelectedCheckOut) {
                        btnClass += "bg-brand-600 text-white shadow-sm cursor-pointer";
                      } else if (isWithinRange) {
                        btnClass += "bg-brand-50 text-brand-700 cursor-pointer";
                      } else {
                        btnClass += "bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 cursor-pointer";
                      }

                      return (
                        <button
                          key={dateStr}
                          type="button"
                          disabled={isPast || isBooked}
                          onClick={() => handleDayClick(date)}
                          className={btnClass}
                          title={isBooked ? "Ngày đã có người đặt" : isPast ? "Ngày trong quá khứ" : date.getDate().toString()}
                        >
                          {date.getDate()}
                        </button>
                      );
                    })}
                  </div>

                  {/* Date selection summary */}
                  <div className="flex justify-between items-center text-[11px] font-medium text-slate-500 border-t border-slate-200/60 pt-2.5 mt-1">
                    <div>
                      <span>Nhận phòng: </span>
                      <span className="font-bold text-slate-700">
                        {checkInDate ? new Date(checkInDate).toLocaleDateString("vi-VN") : "Chưa chọn"}
                      </span>
                    </div>
                    <div>
                      <span>Trả phòng: </span>
                      <span className="font-bold text-slate-700">
                        {checkOutDate ? new Date(checkOutDate).toLocaleDateString("vi-VN") : "Chưa chọn"}
                      </span>
                    </div>
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
                    <span>{(selectedRoomPrice).toLocaleString("vi-VN")}đ / đêm</span>
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
