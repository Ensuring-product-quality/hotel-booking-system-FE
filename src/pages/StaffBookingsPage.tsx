import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { Role } from "../types/auth";
import { ROUTES } from "../constants/routes";
import { bookingApi } from "../services/bookingApi";
import { roomApi } from "../services/roomApi";
import { hotelApi } from "../services/hotelApi";
import { userApi } from "../services/userApi";
import { paymentApi } from "../services/paymentApi";
import { getErrorMessage } from "../services/apiClient";
import { BookingStatus } from "../types/booking";
import type { BookingResponseDTO } from "../types/booking";

import { notificationApi } from "../services/notificationApi";
import { ManagerHotelsPage } from "./ManagerHotelsPage";
import { ManagerRoomsPage } from "./ManagerRoomsPage";

type StaffTab = "bookings" | "inventory" | "reports" | "services" | "customers" | "notifications" | "hotels" | "rooms";

export function StaffBookingsPage() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<StaffTab>("bookings");
  const [globalSearch, setGlobalSearch] = useState("");

  // Notifications states
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationFilterStatus, setNotificationFilterStatus] = useState<"ALL" | "unread" | "read">("ALL");

  const { data: notificationsRes } = useQuery({
    queryKey: ["staffNotificationsReal"],
    queryFn: () => notificationApi.getAll({ page: 0, size: 50 }),
    refetchInterval: 10000,
  });
  const notifications = useMemo(() => notificationsRes?.data?.content || [], [notificationsRes]);
  const unreadCount = useMemo(() => notifications.filter((n) => n.status === "unread").length, [notifications]);

  const updateRoomStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      roomApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffRoomsReal"] });
      queryClient.invalidateQueries({ queryKey: ["managerRooms"] });
      alert("Cập nhật trạng thái phòng thành công!");
    },
    onError: (err) => {
      alert(getErrorMessage(err, "Không thể cập nhật trạng thái phòng."));
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffNotificationsReal"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffNotificationsReal"] });
    },
  });

  // Booking Tab Sub-Filter
  const [bookingSubTab, setBookingSubTab] = useState<"new" | "pending" | "history">("new");
  const [bookingFilterStatus, setBookingFilterStatus] = useState<string>("ALL");
  const [bookingFilterDate, setBookingFilterDate] = useState<string>("");

  // Selected Detail Modals
  const [selectedBooking, setSelectedBooking] = useState<BookingResponseDTO | null>(null);

  // Service Request items local state for front-desk actions
  const [serviceRequests, setServiceRequests] = useState([
    { id: 1, type: "Spa", category: "Yêu cầu thêm", title: "Massage Body 60p", room: "Phòng 402", guest: "Ms. Thanh Hương", status: "pending", time: "10:45 AM" },
    { id: 2, type: "Phục vụ phòng", category: "Nhà hàng", title: "Thêm 2 khăn tắm & Nước", room: "Phòng 215", guest: "Mr. David Smith", status: "pending", time: "11:02 AM" },
    { id: 3, type: "Nhà hàng", category: "Nhà hàng", title: "Bữa trưa tại phòng (In-room)", desc: "2 Phở bò, 1 Nước cam ép, 1 Salad", room: "Phòng 508", guest: "Trần Văn An", status: "in_progress", remaining: "08:24 còn lại" },
    { id: 4, type: "Giặt là", category: "Giặt là", title: "Giặt nhanh (Express)", room: "Phòng 102", guest: "Mrs. Lee", status: "in_progress", remaining: "Đã trôi qua 45p" },
    { id: 5, type: "Nhà hàng", category: "Nhà hàng", title: "Đặt bàn tối (4 khách)", room: "Phòng 303", guest: "Hoàn thành lúc 09:30 AM", status: "completed" },
    { id: 6, type: "Thiết bị", category: "Yêu cầu thêm", title: "Máy sấy tóc hỏng - Thay mới", room: "Phòng 612", guest: "Hoàn thành lúc 08:15 AM", status: "completed" },
  ]);

  // ==================== REAL DATA FROM BACKEND APIS ====================
  const { data: bookingsRes, isLoading: isBookingsLoading } = useQuery({
    queryKey: ["staffBookingsReal"],
    queryFn: () => bookingApi.getAll({ page: 0, size: 100, sort: "createdAt,desc" }),
  });
  const bookings = useMemo(() => bookingsRes?.data?.content || [], [bookingsRes]);

  const { data: roomsRes } = useQuery({
    queryKey: ["staffRoomsReal"],
    queryFn: () => roomApi.getAll({ page: 0, size: 100 }),
  });
  const rooms = useMemo(() => roomsRes?.data?.content || [], [roomsRes]);

  const { data: hotelsRes } = useQuery({
    queryKey: ["staffHotelsReal"],
    queryFn: () => hotelApi.getAll({ page: 0, size: 100 }),
  });
  const hotels = useMemo(() => hotelsRes?.data?.content || [], [hotelsRes]);

  const { data: usersRes } = useQuery({
    queryKey: ["staffUsersReal"],
    queryFn: () => userApi.getAll({ page: 0, size: 100 }),
  });
  const users = useMemo(() => usersRes?.data?.content || [], [usersRes]);

  const { data: paymentsRes } = useQuery({
    queryKey: ["staffPaymentsReal"],
    queryFn: () => paymentApi.getAll({ page: 0, size: 100 }),
  });
  const payments = useMemo(() => paymentsRes?.data?.content || [], [paymentsRes]);

  // ==================== DYNAMIC CALCULATIONS & METRICS ====================
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  const pendingCount = useMemo(
    () => bookings.filter((b) => b.status === BookingStatus.PENDING_PAYMENT).length,
    [bookings]
  );
  const confirmedCount = useMemo(
    () => bookings.filter((b) => b.status === BookingStatus.CONFIRMED).length,
    [bookings]
  );

  const availableRooms = useMemo(
    () => rooms.filter((r) => r.status === "active" || r.status === "available"),
    [rooms]
  );
  const occupiedRooms = useMemo(
    () => rooms.filter((r) => r.status === "occupied"),
    [rooms]
  );
  const dirtyRooms = useMemo(
    () => rooms.filter((r) => r.status === "cleaning"),
    [rooms]
  );
  const maintenanceRooms = useMemo(
    () => rooms.filter((r) => r.status === "maintenance"),
    [rooms]
  );

  const roomsByHotel = useMemo(() => {
    const groups: { [key: number]: typeof rooms } = {};
    rooms.forEach((r) => {
      if (!groups[r.hotelId]) {
        groups[r.hotelId] = [];
      }
      groups[r.hotelId].push(r);
    });
    return groups;
  }, [rooms]);

  const todayArrivals = useMemo(
    () => bookings.filter((b) => b.checkInDate === todayStr || b.status === BookingStatus.CONFIRMED),
    [bookings, todayStr]
  );
  const todayDepartures = useMemo(
    () => bookings.filter((b) => b.checkOutDate === todayStr || b.status === BookingStatus.COMPLETED),
    [bookings, todayStr]
  );

  const totalDeskRevenue = useMemo(() => {
    let sum = 0;
    payments.forEach((p) => {
      if (p.status === "completed") sum += p.amount;
    });
    if (sum === 0) {
      bookings.forEach((b) => {
        if (b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.COMPLETED) sum += b.totalPrice;
      });
    }
    return sum;
  }, [payments, bookings]);

  // Filtered Bookings for Table
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (bookingSubTab === "new" && (b.status === BookingStatus.CANCELLED || b.status === BookingStatus.CHECKED_OUT || b.status === BookingStatus.COMPLETED)) return false;
      if (bookingSubTab === "pending" && b.status !== BookingStatus.PENDING_PAYMENT) return false;
      if (bookingSubTab === "history" && b.status !== BookingStatus.COMPLETED && b.status !== BookingStatus.CHECKED_OUT && b.status !== BookingStatus.CANCELLED) return false;

      const matchesStatus = bookingFilterStatus === "ALL" || b.status === bookingFilterStatus;
      
      const matchesDate = !bookingFilterDate || (bookingFilterDate >= b.checkInDate && bookingFilterDate <= b.checkOutDate);

      const searchLower = globalSearch.trim().toLowerCase();
      const matchesSearch =
        !searchLower ||
        String(b.id).includes(searchLower) ||
        b.roomNumber?.toLowerCase().includes(searchLower) ||
        b.hotelName?.toLowerCase().includes(searchLower) ||
        b.userFullName?.toLowerCase().includes(searchLower) ||
        b.userPhone?.includes(searchLower);

      return matchesStatus && matchesDate && matchesSearch;
    });
  }, [bookings, bookingSubTab, bookingFilterStatus, bookingFilterDate, globalSearch]);

  // Status Change Mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: BookingStatus }) =>
      bookingApi.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffBookingsReal"] });
      alert("Cập nhật trạng thái thành công!");
    },
    onError: (err) => {
      alert(getErrorMessage(err, "Cập nhật thất bại."));
    },
  });

  // Check-in Mutation
  const checkInMutation = useMutation({
    mutationFn: (id: number) => bookingApi.checkIn(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffBookingsReal"] });
      queryClient.invalidateQueries({ queryKey: ["staffRoomsReal"] });
      alert("Check-in thành công!");
    },
    onError: (err) => {
      alert(getErrorMessage(err, "Check-in thất bại."));
    },
  });

  // Check-out Mutation
  const checkOutMutation = useMutation({
    mutationFn: (id: number) => bookingApi.checkOut(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffBookingsReal"] });
      queryClient.invalidateQueries({ queryKey: ["staffRoomsReal"] });
      alert("Check-out thành công! Phòng đã được chuyển sang trạng thái dọn dẹp.");
    },
    onError: (err) => {
      alert(getErrorMessage(err, "Check-out thất bại."));
    },
  });

  const getHotelName = (id: number, fallbackName?: string) => {
    if (fallbackName) return fallbackName;
    const found = hotels.find((h) => h.id === id);
    return found ? found.name : `Khách sạn #${id}`;
  };

  const handleUpdateServiceStatus = (id: number, nextStatus: string) => {
    setServiceRequests((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: nextStatus } : item))
    );
  };

  return (
    <div className="min-h-screen bg-[#06101E] text-slate-100 flex font-sans antialiased">
      {/* ================= SIDEBAR ĐIỀU HÀNH LỄ TÂN ================= */}
      <aside className="w-64 bg-[#0A192F] border-r border-slate-800/80 flex flex-col shrink-0 justify-between">
        <div>
          {/* Logo & Header Lễ Tân */}
          <div className="p-6 border-b border-slate-800/80">
            <Link to={ROUTES.HOME} className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-teal-500/20">
                L
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white group-hover:text-teal-400 transition">
                  {currentUser?.role === Role.MANAGER ? "Manager" : "LuxStay"}
                </span>
                <p className="text-[10px] text-teal-400/80 uppercase font-semibold tracking-wider">
                  {currentUser?.role === Role.MANAGER ? "Quản lý khách sạn" : "Quản Lý Lễ Tân (Front Desk)"}
                </p>
              </div>
            </Link>
          </div>

          {/* Nav Items */}
          <nav className="p-4 flex flex-col gap-1.5 text-sm font-medium text-slate-400">
            <button
              onClick={() => setActiveTab("bookings")}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition cursor-pointer ${activeTab === "bookings"
                  ? "bg-teal-600/20 text-teal-300 font-semibold border border-teal-500/30 shadow-md"
                  : "hover:bg-slate-800/60 hover:text-slate-200"
                }`}
            >
              <i className="fa-regular fa-calendar-check text-base"></i>
              <span>Quản Lý Đặt Phòng</span>
            </button>

            <button
              onClick={() => setActiveTab("inventory")}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition cursor-pointer ${activeTab === "inventory"
                  ? "bg-teal-600/20 text-teal-300 font-semibold border border-teal-500/30 shadow-md"
                  : "hover:bg-slate-800/60 hover:text-slate-200"
                }`}
            >
              <i className="fa-solid fa-grid-2 text-base"></i>
              <span>Sơ Đồ Kho Phòng</span>
            </button>

            {currentUser?.role !== Role.MANAGER ? (
              <>
                <button
                  onClick={() => setActiveTab("services")}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition cursor-pointer ${activeTab === "services"
                      ? "bg-teal-600/20 text-teal-300 font-semibold border border-teal-500/30 shadow-md"
                      : "hover:bg-slate-800/60 hover:text-slate-200"
                    }`}
                >
                  <i className="fa-solid fa-[#00B4D8] fa-concierge-bell text-base"></i>
                  <span>Yêu Cầu Dịch Vụ</span>
                </button>

                <button
                  onClick={() => setActiveTab("reports")}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition cursor-pointer ${activeTab === "reports"
                      ? "bg-teal-600/20 text-teal-300 font-semibold border border-teal-500/30 shadow-md"
                      : "hover:bg-slate-800/60 hover:text-slate-200"
                    }`}
                >
                  <i className="fa-solid fa-chart-pie text-base"></i>
                  <span>Báo Cáo Vận Hành</span>
                </button>

                <button
                  onClick={() => setActiveTab("customers")}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition cursor-pointer ${activeTab === "customers"
                      ? "bg-teal-600/20 text-teal-300 font-semibold border border-teal-500/30 shadow-md"
                      : "hover:bg-slate-800/60 hover:text-slate-200"
                    }`}
                >
                  <i className="fa-solid fa-users text-base"></i>
                  <span>Quản Lý Khách Hàng</span>
                </button>

                <button
                  onClick={() => setActiveTab("notifications")}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl transition cursor-pointer ${activeTab === "notifications"
                      ? "bg-teal-600/20 text-teal-300 font-semibold border border-teal-500/30 shadow-md"
                      : "hover:bg-slate-800/60 hover:text-slate-200"
                    }`}
                >
                  <div className="flex items-center gap-3.5">
                    <i className="fa-regular fa-bell text-base"></i>
                    <span>Thông Báo System</span>
                  </div>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-teal-500 text-slate-950 text-[10px] font-extrabold shadow">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab("hotels")}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition cursor-pointer w-full text-left ${activeTab === "hotels"
                      ? "bg-teal-600/20 text-teal-300 font-semibold border border-teal-500/30 shadow-md"
                      : "hover:bg-slate-800/60 hover:text-slate-200"
                    }`}
                >
                  <i className="fa-solid fa-hotel text-base"></i>
                  <span>Quản Lý Khách Sạn</span>
                </button>

                <button
                  onClick={() => setActiveTab("rooms")}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition cursor-pointer w-full text-left ${activeTab === "rooms"
                      ? "bg-teal-600/20 text-teal-300 font-semibold border border-teal-500/30 shadow-md"
                      : "hover:bg-slate-800/60 hover:text-slate-200"
                    }`}
                >
                  <i className="fa-solid fa-bed text-base"></i>
                  <span>Quản Lý Phòng</span>
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Action Button & Link Home */}
        <div className="p-4 border-t border-slate-800/80 flex flex-col gap-2">
          <Link
            to={ROUTES.HOME}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-teal-300 border border-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
          >
            <i className="fa-solid fa-house"></i>
            <span>Về Trang Khách Hàng</span>
          </Link>
        </div>
      </aside>

      {/* ================= KHU VỰC NỘI DUNG CHÍNH ================= */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#06101E] text-slate-100 overflow-y-auto">
        {/* HEADER ĐỈNH */}
        <header className="h-16 border-b border-slate-800/80 bg-[#0A192F]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="relative w-80">
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
            <input
              type="text"
              placeholder="Tìm kiếm đặt phòng, phòng, khách hàng..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 outline-none focus:border-teal-500/60 transition"
            />
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            {/* Chuông thông báo chảy xuống (Notification Dropdown) */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationOpen((prev) => !prev)}
                className="relative p-2 hover:text-white transition cursor-pointer"
                title="Thông báo mới nhất"
              >
                <i className="fa-regular fa-bell text-base"></i>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-teal-400"></span>
                )}
              </button>

              {/* Dropdown Panel hiển thị tối đa 10 thông báo mới nhất */}
              {isNotificationOpen && (
                <div className="absolute right-0 top-11 z-50 w-80 sm:w-96 bg-[#0A192F] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
                  <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
                    <h4 className="font-bold text-white text-xs flex items-center gap-2">
                      <i className="fa-solid fa-bell text-teal-400"></i>
                      Thông Báo Lễ Tân ({unreadCount} chưa đọc)
                    </h4>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllAsReadMutation.mutate()}
                        className="text-[10px] text-teal-400 hover:text-teal-300 font-semibold cursor-pointer"
                      >
                        Đọc tất cả
                      </button>
                    )}
                  </div>

                  {/* Danh sách 10 thông báo lăn chuột */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60 font-semibold">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs">Chưa có thông báo nào.</div>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markAsReadMutation.mutate(n.id)}
                          className={`p-3.5 hover:bg-slate-900/50 transition cursor-pointer flex items-start gap-3 text-xs ${n.status === "unread" ? "bg-teal-500/5" : ""
                            }`}
                        >
                          <span className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${n.status === "unread" ? "bg-teal-400" : "bg-slate-700"}`}></span>
                          <div className="flex-1 min-w-0">
                            <p className={`text-slate-200 leading-snug ${n.status === "unread" ? "font-bold text-white" : ""}`}>{n.message}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{n.createdAt || "Vừa xong"}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Nút Xem Tất Cả Thông Báo không giới hạn */}
                  <div className="p-3 border-t border-slate-800 bg-slate-900/80 text-center">
                    <button
                      onClick={() => {
                        setIsNotificationOpen(false);
                        setActiveTab("notifications");
                      }}
                      className="text-xs font-bold text-teal-400 hover:text-teal-300 transition cursor-pointer"
                    >
                      Xem Tất Cả Thông Báo ({notifications.length}) &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button className="p-2 hover:text-white transition">
              <i className="fa-regular fa-envelope text-base"></i>
            </button>

            <div className="h-6 w-px bg-slate-800 mx-1"></div>

            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center justify-center font-bold text-xs uppercase shadow-inner">
                {currentUser?.username?.[0] || "L"}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-100">{currentUser?.username || "Lễ Tân Trưởng"}</p>
                <p className="text-[10px] text-teal-400 font-semibold uppercase">
                  {currentUser?.role === Role.MANAGER ? "QUẢN LÝ KHÁCH SẠN" : "LỄ TÂN HỆ THỐNG"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* CÁC TAB NỘI DUNG LỄ TÂN */}
        <main className="p-8 max-w-7xl mx-auto w-full flex-1">
          {/* ================= TAB 1: QUẢN LÝ ĐẶT PHÒNG (MOCKUP 1) ================= */}
          {activeTab === "bookings" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Tiêu đề & Thẻ đếm badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-white">
                    {currentUser?.role === Role.MANAGER ? "Quản Lý Đặt Phòng" : "Quản Lý Đặt Phòng Lễ Tân"}
                  </h1>
                  <p className="text-slate-400 text-xs mt-1">
                    Chào buổi sáng, hôm nay có <strong className="text-teal-400">{pendingCount}</strong> yêu cầu mới cần xử lý.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-[#0A192F] border border-slate-800 rounded-xl px-4 py-2.5 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center text-sm font-bold">
                      <i className="fa-solid fa-clock-rotate-left"></i>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Chờ xác nhận</p>
                      <p className="text-lg font-black text-white">{String(pendingCount).padStart(2, "0")}</p>
                    </div>
                  </div>

                  <div className="bg-[#0A192F] border border-slate-800 rounded-xl px-4 py-2.5 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-bold">
                      <i className="fa-solid fa-circle-check"></i>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Đã xác nhận</p>
                      <p className="text-lg font-black text-white">{String(confirmedCount).padStart(2, "0")}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thanh Bộ Lọc Lễ Tân */}
              <div className="bg-[#0A192F] border border-slate-800/80 rounded-2xl p-4 flex flex-wrap items-center gap-4 text-xs font-semibold">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">KHOẢNG NGÀY</label>
                  <input
                    type="date"
                    value={bookingFilterDate}
                    onChange={(e) => setBookingFilterDate(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-teal-500/60"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">TRẠNG THÁI</label>
                  <select
                    value={bookingFilterStatus}
                    onChange={(e) => setBookingFilterStatus(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-teal-500/60"
                  >
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value={BookingStatus.PENDING_PAYMENT}>Chờ xác nhận (PENDING_PAYMENT)</option>
                    <option value={BookingStatus.CONFIRMED}>Đã xác nhận (CONFIRMED)</option>
                    <option value={BookingStatus.CHECKED_IN}>Đã nhận phòng (CHECKED_IN)</option>
                    <option value={BookingStatus.CHECKED_OUT}>Đã trả phòng (CHECKED_OUT)</option>
                    <option value={BookingStatus.COMPLETED}>Đã hoàn thành (COMPLETED)</option>
                    <option value={BookingStatus.CANCELLED}>Đã hủy (CANCELLED)</option>
                  </select>
                </div>
              </div>

              {/* Sub Tabs Yêu cầu mới / Chờ xác nhận / Lịch sử */}
              <div className="border-b border-slate-800 flex gap-6 text-xs font-bold text-slate-400">
                <button
                  onClick={() => setBookingSubTab("new")}
                  className={`pb-3 border-b-2 transition flex items-center gap-2 cursor-pointer ${bookingSubTab === "new"
                      ? "border-teal-400 text-teal-300"
                      : "border-transparent hover:text-white"
                    }`}
                >
                  <span>Yêu cầu mới</span>
                  <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px]">
                    {bookings.length}
                  </span>
                </button>

                <button
                  onClick={() => setBookingSubTab("pending")}
                  className={`pb-3 border-b-2 transition flex items-center gap-2 cursor-pointer ${bookingSubTab === "pending"
                      ? "border-teal-400 text-teal-300"
                      : "border-transparent hover:text-white"
                    }`}
                >
                  <span>Chờ xác nhận</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px]">
                    {pendingCount}
                  </span>
                </button>

                <button
                  onClick={() => setBookingSubTab("history")}
                  className={`pb-3 border-b-2 transition flex items-center gap-2 cursor-pointer ${bookingSubTab === "history"
                      ? "border-teal-400 text-teal-300"
                      : "border-transparent hover:text-white"
                    }`}
                >
                  <span>Lịch sử đặt phòng</span>
                </button>
              </div>

              {/* Bảng Danh Sách Đặt Phòng */}
              <div className="bg-[#0A192F] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  {isBookingsLoading ? (
                    <div className="py-12 text-center text-slate-400 text-xs font-semibold">
                      <i className="fa-solid fa-spinner fa-spin text-teal-400 text-lg mb-2 block"></i>
                      Đang tải danh sách đặt phòng...
                    </div>
                  ) : filteredBookings.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs">Không có yêu cầu đặt phòng phù hợp.</div>
                  ) : (
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-900/90 text-slate-400 uppercase text-[9px] font-bold tracking-wider border-b border-slate-800">
                        <tr>
                          <th className="py-3.5 px-6">KHÁCH HÀNG</th>
                          <th className="py-3.5 px-6">NGÀY NHẬN/TRẢ</th>
                          <th className="py-3.5 px-6">LOẠI PHÒNG / SỐ PHÒNG</th>
                          <th className="py-3.5 px-6">TỔNG TIỀN</th>
                          <th className="py-3.5 px-6">TRẠNG THÁI</th>
                          <th className="py-3.5 px-6 text-center">THAO TÁC XỬ LÝ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-semibold">
                        {filteredBookings.map((b) => (
                          <tr key={b.id} className="hover:bg-slate-900/40 transition">
                            <td className="py-4 px-6 font-bold text-white flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-teal-500/20 text-teal-300 font-bold flex items-center justify-center text-xs uppercase border border-teal-500/30">
                                {b.userFullName?.[0] || "U"}
                              </div>
                              <div>
                                <p className="font-bold text-white text-xs">{b.userFullName || `Khách hàng #${b.userId}`}</p>
                                <p className="text-[10px] text-slate-400">{b.userPhone || "Chưa có SĐT"} • Đơn #{b.id}</p>
                                <p className="text-[9px] text-teal-400 font-semibold">{b.guests} khách</p>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-slate-300">
                              <p className="font-bold text-white">{b.checkInDate}</p>
                              <p className="text-[10px] text-slate-400">&rarr; {b.checkOutDate}</p>
                            </td>
                            <td className="py-4 px-6">
                              <p className="text-white font-bold">{getHotelName(b.hotelId, b.hotelName)}</p>
                              <span className="px-2 py-0.5 bg-slate-800 text-teal-300 rounded font-bold text-[10px] border border-slate-700">
                                Phòng {b.roomNumber}
                              </span>
                            </td>
                            <td className="py-4 px-6 font-extrabold text-white text-sm">
                              {b.totalPrice.toLocaleString("vi-VN")} VND
                            </td>
                            <td className="py-4 px-6">
                              <span
                                className={`px-2.5 py-1 rounded text-[9px] font-extrabold uppercase border ${
                                  b.status === BookingStatus.CONFIRMED
                                    ? "bg-teal-500/20 text-teal-300 border-teal-500/30"
                                    : b.status === BookingStatus.CHECKED_IN
                                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                      : b.status === BookingStatus.CHECKED_OUT
                                        ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                                        : b.status === BookingStatus.COMPLETED
                                          ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                                          : b.status === BookingStatus.PENDING_PAYMENT
                                            ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                            : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                                }`}
                              >
                                {b.status === BookingStatus.PENDING_PAYMENT
                                  ? "CHỜ XÁC NHẬN"
                                  : b.status === BookingStatus.CONFIRMED
                                    ? "ĐÃ XÁC NHẬN"
                                    : b.status === BookingStatus.CHECKED_IN
                                      ? "ĐÃ CHECK-IN"
                                      : b.status === BookingStatus.CHECKED_OUT
                                        ? "ĐÃ CHECK-OUT"
                                        : b.status === BookingStatus.COMPLETED
                                          ? "HOÀN THÀNH"
                                          : "ĐÃ HỦY"}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-center">
                              <div className="flex items-center justify-center gap-2">
                                {/* Duyệt đơn (CONFIRMED) - chỉ cho phép đơn PENDING_PAYMENT */}
                                {b.status === BookingStatus.PENDING_PAYMENT && (
                                  <button
                                    onClick={() => updateStatusMutation.mutate({ id: b.id, status: BookingStatus.CONFIRMED })}
                                    title="Duyệt đơn"
                                    className="h-8 px-2 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-lg flex items-center justify-center hover:bg-teal-500 hover:text-slate-950 transition cursor-pointer font-bold text-[10px]"
                                  >
                                    <i className="fa-solid fa-check mr-1 text-xs"></i> Duyệt
                                  </button>
                                )}

                                {/* Check-in button - chỉ cho phép đơn CONFIRMED */}
                                {b.status === BookingStatus.CONFIRMED && (
                                  <button
                                    onClick={() => {
                                      if (confirm(`Thực hiện Check-in cho đơn #${b.id}?`)) {
                                        checkInMutation.mutate(b.id);
                                      }
                                    }}
                                    title="Check-in khách"
                                    className="h-8 px-2.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg flex items-center gap-1 hover:bg-emerald-500 hover:text-slate-950 transition cursor-pointer font-bold text-[10px]"
                                  >
                                    <i className="fa-solid fa-key text-[10px]"></i> Check-in
                                  </button>
                                )}

                                {/* Check-out button - chỉ cho phép đơn CHECKED_IN */}
                                {b.status === BookingStatus.CHECKED_IN && (
                                  <button
                                    onClick={() => {
                                      if (confirm(`Thực hiện Check-out cho đơn #${b.id}?`)) {
                                        checkOutMutation.mutate(b.id);
                                      }
                                    }}
                                    title="Check-out khách"
                                    className="h-8 px-2.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg flex items-center gap-1 hover:bg-indigo-500 hover:text-slate-950 transition cursor-pointer font-bold text-[10px]"
                                  >
                                    <i className="fa-solid fa-door-open text-[10px]"></i> Check-out
                                  </button>
                                )}

                                {/* Xem chi tiết */}
                                <button
                                  onClick={() => setSelectedBooking(b)}
                                  title="Xem chi tiết"
                                  className="h-8 w-8 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center hover:bg-slate-700 transition cursor-pointer"
                                >
                                  <i className="fa-regular fa-eye text-xs"></i>
                                </button>

                                {/* Từ chối / Hủy đơn - Cho phép hủy nếu chưa check-out hay completed */}
                                {b.status !== BookingStatus.CANCELLED && b.status !== BookingStatus.CHECKED_OUT && b.status !== BookingStatus.COMPLETED && (
                                  <button
                                    onClick={() => {
                                      if (confirm("Từ chối / Hủy đơn này?")) {
                                        updateStatusMutation.mutate({ id: b.id, status: BookingStatus.CANCELLED });
                                      }
                                    }}
                                    title="Từ chối / Hủy"
                                    className="h-8 w-8 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center hover:bg-rose-500 hover:text-white transition cursor-pointer"
                                  >
                                    <i className="fa-solid fa-xmark text-xs"></i>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Xu Hướng Đặt Phòng & Lịch Công Việc (Ẩn đối với MANAGER) */}
              {currentUser?.role !== Role.MANAGER && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Xu hướng Đặt phòng */}
                  <div className="lg:col-span-2 bg-[#0A192F] border border-slate-800/80 rounded-2xl p-6 space-y-4">
                    <h3 className="font-bold text-white text-base">Xu Hướng Đặt Phòng Theo Loại</h3>
                    <div className="space-y-4 pt-2">
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="text-slate-200">Deluxe Ocean View</span>
                          <span className="text-teal-400">85% Lấp đầy</span>
                        </div>
                        <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                          <div className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full w-[85%]"></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="text-slate-200">Executive Suite</span>
                          <span className="text-teal-400">62% Lấp đầy</span>
                        </div>
                        <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                          <div className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full w-[62%]"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lịch Công Việc Lễ Tân */}
                  <div className="bg-[#0A192F] border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-white text-base">Lịch Công Việc Ca Làm</h3>
                      <button onClick={() => alert("Thêm sự kiện mới")} className="h-8 w-8 rounded-lg bg-teal-500 text-slate-950 flex items-center justify-center font-bold text-xs cursor-pointer">
                        +
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
                        <div className="px-2.5 py-1 bg-teal-500/20 text-teal-300 rounded-lg text-[10px] font-extrabold text-center">
                          T5 <br /> 15
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Đón đoàn 20 khách VIP</p>
                          <p className="text-[10px] text-slate-400">Từ Công ty Du lịch SunTravel</p>
                        </div>
                      </div>

                      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
                        <div className="px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-lg text-[10px] font-extrabold text-center">
                          T5 <br /> 16
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Kiểm kê phòng VIP Suite</p>
                          <p className="text-[10px] text-slate-400">Bộ phận buồng phòng báo cáo</p>
                        </div>
                      </div>
                    </div>

                    <button onClick={() => alert("Mở toàn bộ lịch công việc")} className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs border border-slate-800 cursor-pointer">
                      Xem tất cả lịch
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 2: SƠ ĐỒ KHO PHÒNG (MOCKUP 2) ================= */}
          {activeTab === "inventory" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-white">
                    {currentUser?.role === Role.MANAGER ? "Sơ Đồ Kho Phòng" : "Sơ Đồ Kho Phòng Lễ Tân"}
                  </h1>
                  <p className="text-slate-400 text-xs mt-1">Cập nhật thời gian thực tình trạng từng phòng của khách sạn.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-400 font-bold bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                    CẬP NHẬT: 10:45 AM
                  </span>
                </div>
              </div>

              {/* Status Bar Summary */}
              <div className="bg-[#0A192F] border border-slate-800/80 rounded-2xl p-4 flex flex-wrap items-center gap-6 text-xs font-bold">
                <span className="flex items-center gap-2 text-teal-400">
                  <span className="h-3 w-3 rounded-full bg-teal-400"></span> Trống ({availableRooms.length})
                </span>
                <span className="flex items-center gap-2 text-blue-400">
                  <span className="h-3 w-3 rounded-full bg-blue-500"></span> Đang ở ({occupiedRooms.length})
                </span>
                <span className="flex items-center gap-2 text-rose-400">
                  <span className="h-3 w-3 rounded-full bg-rose-500"></span> Cần dọn dẹp ({dirtyRooms.length})
                </span>
                <span className="flex items-center gap-2 text-amber-400">
                  <span className="h-3 w-3 rounded-full bg-amber-500"></span> Bảo trì ({maintenanceRooms.length})
                </span>
              </div>

              {/* Sơ đồ phòng thực tế */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-extrabold text-teal-400 border-l-4 border-teal-400 pl-3 mb-6">
                    Sơ Đồ Phòng Theo Khách Sạn ({rooms.length} phòng)
                  </h3>

                  {rooms.length === 0 ? (
                    <div className="bg-[#0A192F] border border-slate-800/80 rounded-2xl p-8 text-center text-slate-400">
                      Chưa có phòng nào được thiết lập cho khách sạn này.
                    </div>
                  ) : hotels.length === 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {rooms.map((r) => (
                        <div key={r.id} className="bg-[#0A192F] border border-slate-800/80 rounded-2xl p-4 space-y-3 shadow-lg hover:border-teal-500/50 transition">
                          <div className="flex justify-between items-center">
                            <span className="text-2xl font-black text-white">Phòng {r.roomNumber}</span>
                            <span className="px-2 py-0.5 bg-slate-800 text-teal-300 font-bold text-[9px] rounded uppercase border border-slate-700">
                              {r.type}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-400">Sức chứa:</span>
                              <span className="text-white font-bold">{r.capacity} khách</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-400">Đơn giá:</span>
                              <span className="text-teal-400 font-bold">{r.price.toLocaleString("vi-VN")}đ</span>
                            </div>
                            <div className="flex justify-between text-xs items-center pt-1.5">
                              <span className="text-slate-400">Trạng thái:</span>
                              <select
                                value={r.status === "active" ? "available" : r.status}
                                onChange={(e) => updateRoomStatusMutation.mutate({ id: r.id, status: e.target.value })}
                                disabled={updateRoomStatusMutation.isPending}
                                className={`px-2 py-0.5 border rounded-full text-[9px] uppercase font-bold cursor-pointer outline-none focus:ring-1 focus:ring-teal-500/50 ${r.status === "active" || r.status === "available"
                                    ? "bg-green-500/20 text-green-300 border-green-500/30"
                                    : r.status === "occupied"
                                      ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                                      : r.status === "cleaning"
                                        ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                        : r.status === "maintenance"
                                          ? "bg-red-500/20 text-red-300 border-red-500/30"
                                          : "bg-slate-850 text-slate-450 border-slate-750"
                                  }`}
                              >
                                <option value="available" className="bg-[#0A192F] text-green-300">Sẵn sàng</option>
                                <option value="occupied" className="bg-[#0A192F] text-blue-300">Có khách</option>
                                <option value="cleaning" className="bg-[#0A192F] text-amber-300">Dọn dẹp</option>
                                <option value="maintenance" className="bg-[#0A192F] text-red-300">Bảo trì</option>
                                <option value="inactive" className="bg-[#0A192F] text-slate-400">Tạm ngưng</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {hotels.map((h) => {
                        const hotelRooms = roomsByHotel[h.id] || [];
                        if (hotelRooms.length === 0) return null;

                        return (
                          <div key={h.id} className="space-y-4">
                            <h4 className="text-xs font-bold text-slate-350 uppercase tracking-wider pl-2.5 border-l-2 border-teal-500">
                              {h.name} ({hotelRooms.length} phòng)
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                              {hotelRooms.map((r) => (
                                <div key={r.id} className="bg-[#0A192F] border border-slate-800/80 rounded-2xl p-4 space-y-3 shadow-lg hover:border-teal-500/50 transition">
                                  <div className="flex justify-between items-center">
                                    <span className="text-2xl font-black text-white">Phòng {r.roomNumber}</span>
                                    <span className="px-2 py-0.5 bg-slate-800 text-teal-300 font-bold text-[9px] rounded uppercase border border-slate-700">
                                      {r.type}
                                    </span>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                      <span className="text-slate-400">Sức chứa:</span>
                                      <span className="text-white font-bold">{r.capacity} khách</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                      <span className="text-slate-400">Đơn giá:</span>
                                      <span className="text-teal-400 font-bold">{r.price.toLocaleString("vi-VN")}đ</span>
                                    </div>
                                    <div className="flex justify-between text-xs items-center pt-1.5">
                                      <span className="text-slate-400">Trạng thái:</span>
                                      <select
                                        value={r.status === "active" ? "available" : r.status}
                                        onChange={(e) => updateRoomStatusMutation.mutate({ id: r.id, status: e.target.value })}
                                        disabled={updateRoomStatusMutation.isPending}
                                        className={`px-2 py-0.5 border rounded-full text-[9px] uppercase font-bold cursor-pointer outline-none focus:ring-1 focus:ring-teal-500/50 ${r.status === "active" || r.status === "available"
                                            ? "bg-green-500/20 text-green-300 border-green-500/30"
                                            : r.status === "occupied"
                                              ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                                              : r.status === "cleaning"
                                                ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                                : r.status === "maintenance"
                                                  ? "bg-red-500/20 text-red-300 border-red-500/30"
                                                  : "bg-slate-850 text-slate-450 border-slate-750"
                                          }`}
                                      >
                                        <option value="available" className="bg-[#0A192F] text-green-300">Sẵn sàng</option>
                                        <option value="occupied" className="bg-[#0A192F] text-blue-300">Có khách</option>
                                        <option value="cleaning" className="bg-[#0A192F] text-amber-300">Dọn dẹp</option>
                                        <option value="maintenance" className="bg-[#0A192F] text-red-300">Bảo trì</option>
                                        <option value="inactive" className="bg-[#0A192F] text-slate-400">Tạm ngưng</option>
                                      </select>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Quick Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#0A192F] border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center text-xl shrink-0">
                    <i className="fa-solid fa-door-open"></i>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">{availableRooms.length}</h3>
                    <p className="text-xs text-slate-400 font-semibold">Phòng trống hôm nay</p>
                  </div>
                </div>

                <div className="bg-[#0A192F] border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-xl shrink-0">
                    <i className="fa-solid fa-plane-arrival"></i>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">{todayArrivals.length}</h3>
                    <p className="text-xs text-slate-400 font-semibold">Dự kiến khách đến</p>
                  </div>
                </div>

                <div className="bg-[#0A192F] border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-xl shrink-0">
                    <i className="fa-solid fa-plane-departure"></i>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">{todayDepartures.length}</h3>
                    <p className="text-xs text-slate-400 font-semibold">Yêu cầu Check-out</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: QUẢN LÝ YÊU CẦU DỊCH VỤ (MOCKUP 4) ================= */}
          {activeTab === "services" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-white">Quản Lý Yêu Cầu Dịch Vụ</h1>
                  <p className="text-slate-400 text-xs mt-1">Theo dõi và xử lý yêu cầu từ phòng của khách hàng theo thời gian thực.</p>
                </div>
              </div>

              {/* Service Counters Header */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#0A192F] border border-slate-800/80 rounded-2xl p-5">
                  <p className="text-[10px] font-bold uppercase text-slate-400">ĐANG CHỜ XỬ LÝ</p>
                  <h3 className="text-3xl font-black text-white mt-1">
                    {serviceRequests.filter((s) => s.status === "pending").length}
                  </h3>
                </div>

                <div className="bg-[#0A192F] border border-slate-800/80 rounded-2xl p-5">
                  <p className="text-[10px] font-bold uppercase text-slate-400">ĐANG THỰC HIỆN</p>
                  <h3 className="text-3xl font-black text-white mt-1">
                    {serviceRequests.filter((s) => s.status === "in_progress").length}
                  </h3>
                </div>

                <div className="bg-[#0A192F] border border-slate-800/80 rounded-2xl p-5">
                  <p className="text-[10px] font-bold uppercase text-slate-400">HOÀN THÀNH</p>
                  <h3 className="text-3xl font-black text-white mt-1">
                    {serviceRequests.filter((s) => s.status === "completed").length}
                  </h3>
                </div>

                <div className="bg-[#0A192F] border border-slate-800/80 rounded-2xl p-5">
                  <p className="text-[10px] font-bold uppercase text-slate-400">THỜI GIAN TRUNG BÌNH</p>
                  <h3 className="text-3xl font-black text-teal-400 mt-1">14 Phút</h3>
                </div>
              </div>

              {/* Kanban / Cards List by Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Đang chờ */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase text-rose-400 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-rose-500"></span> Đang chờ (Pending)
                  </h3>

                  {serviceRequests
                    .filter((s) => s.status === "pending")
                    .map((item) => (
                      <div key={item.id} className="bg-[#0A192F] border border-slate-800/80 rounded-2xl p-4 space-y-3 shadow-lg">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="px-2 py-0.5 bg-teal-500/20 text-teal-300 rounded uppercase">{item.category}</span>
                          <span className="text-slate-400">{item.time}</span>
                        </div>
                        <h4 className="font-bold text-white text-sm">{item.title}</h4>
                        <p className="text-xs text-slate-300">{item.room} &bull; {item.guest}</p>
                        <button
                          onClick={() => handleUpdateServiceStatus(item.id, "in_progress")}
                          className="w-full py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer"
                        >
                          Nhận việc
                        </button>
                      </div>
                    ))}
                </div>

                {/* Đang thực hiện */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase text-teal-400 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-teal-400"></span> Đang thực hiện (In Progress)
                  </h3>

                  {serviceRequests
                    .filter((s) => s.status === "in_progress")
                    .map((item) => (
                      <div key={item.id} className="bg-[#0A192F] border border-slate-800/80 rounded-2xl p-4 space-y-3 shadow-lg">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded uppercase">{item.category}</span>
                          <span className="text-teal-400">{item.remaining}</span>
                        </div>
                        <h4 className="font-bold text-white text-sm">{item.title}</h4>
                        {item.desc && <p className="text-xs text-slate-400">{item.desc}</p>}
                        <p className="text-xs text-slate-300">{item.room} &bull; {item.guest}</p>
                        <button
                          onClick={() => handleUpdateServiceStatus(item.id, "completed")}
                          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                        >
                          Hoàn tất
                        </button>
                      </div>
                    ))}
                </div>

                {/* Hoàn thành */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase text-emerald-400 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400"></span> Hoàn thành (Completed)
                  </h3>

                  {serviceRequests
                    .filter((s) => s.status === "completed")
                    .map((item) => (
                      <div key={item.id} className="bg-[#0A192F]/60 border border-slate-800/60 rounded-2xl p-4 space-y-2 opacity-80">
                        <h4 className="font-bold text-white text-xs line-through">{item.title}</h4>
                        <p className="text-[10px] text-slate-400">{item.room} &bull; {item.guest}</p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 4: BÁO CÁO VẬN HÀNH HÀNG NGÀY (MOCKUP 3) ================= */}
          {activeTab === "reports" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-white">Báo Cáo Vận Hành Hàng Ngày</h1>
                  <p className="text-slate-400 text-xs mt-1">Dữ liệu tổng hợp tình hình vận hành lễ tân hôm nay.</p>
                </div>
              </div>

              {/* Cards Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#0A192F] border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center text-xl shrink-0">
                    <i className="fa-solid fa-arrow-right-to-bracket"></i>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Khách Check-in</p>
                    <h3 className="text-2xl font-black text-white">{todayArrivals.length} / 32 dự kiến</h3>
                  </div>
                </div>

                <div className="bg-[#0A192F] border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-xl shrink-0">
                    <i className="fa-solid fa-arrow-right-from-bracket"></i>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Khách Check-out</p>
                    <h3 className="text-2xl font-black text-white">{todayDepartures.length} / 18 dự kiến</h3>
                  </div>
                </div>

                <div className="bg-[#0A192F] border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl shrink-0">
                    <i className="fa-solid fa-wallet"></i>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Doanh thu tại quầy</p>
                    <h3 className="text-2xl font-black text-white">{totalDeskRevenue.toLocaleString("vi-VN")} VND</h3>
                  </div>
                </div>
              </div>

              {/* Feedback List & Urgent Items */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#0A192F] border border-slate-800/80 rounded-2xl p-6 space-y-4">
                  <h3 className="font-bold text-white text-base">Phản Hồi Nhanh Từ Khách Hàng (4.8/5.0)</h3>
                  <div className="space-y-3 pt-2">
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                      <div className="flex justify-between text-xs font-bold text-white">
                        <span>Lê Văn Nam (Phòng 402)</span>
                        <span className="text-amber-400">★★★★★</span>
                      </div>
                      <p className="text-xs text-slate-400">"Nhân viên lễ tân rất nhiệt tình, hỗ trợ check-in sớm. Phòng sạch sẽ."</p>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                      <div className="flex justify-between text-xs font-bold text-white">
                        <span>Nguyễn Thị Thu (Phòng 205)</span>
                        <span className="text-amber-400">★★★★☆</span>
                      </div>
                      <p className="text-xs text-slate-400">"Mọi thứ ổn, quy trình check-out hơi đông một chút."</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0A192F] border border-slate-800/80 rounded-2xl p-6 space-y-4">
                  <h3 className="font-bold text-white text-base">Danh Sách Hoạt Động Cần Xử Lý</h3>
                  <div className="space-y-3 pt-2">
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-white">Phạm Quốc Quân (Phòng 302)</p>
                        <p className="text-[10px] text-slate-400">Check-in muộn lúc 22:00</p>
                      </div>
                      <span className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded font-bold text-[10px]">CHỜ XỬ LÝ</span>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-white">Vương Đình Dũng (Phòng 108)</p>
                        <p className="text-[10px] text-slate-400">Dọn phòng khẩn cấp</p>
                      </div>
                      <span className="px-2 py-1 bg-teal-500/20 text-teal-300 rounded font-bold text-[10px]">ĐANG DỌN</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 5: QUẢN LÝ KHÁCH HÀNG (MOCKUP 5) ================= */}
          {activeTab === "customers" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-white">Quản Lý Khách Hàng Thân Thiết</h1>
                  <p className="text-slate-400 text-xs mt-1">Danh sách khách hàng VIP và lịch sử lưu trú tại LuxStay.</p>
                </div>
              </div>

              {/* Customer Metric Counters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#0A192F] border border-slate-800/80 rounded-2xl p-5">
                  <p className="text-[10px] font-bold uppercase text-slate-400">THÀNH VIÊN VIP</p>
                  <h3 className="text-3xl font-black text-white mt-1">{users.length}</h3>
                </div>

                <div className="bg-[#0A192F] border border-slate-800/80 rounded-2xl p-5">
                  <p className="text-[10px] font-bold uppercase text-slate-400">TỶ LỆ QUAY LẠI</p>
                  <h3 className="text-3xl font-black text-teal-400 mt-1">64.5%</h3>
                </div>

                <div className="bg-[#0A192F] border border-slate-800/80 rounded-2xl p-5">
                  <p className="text-[10px] font-bold uppercase text-slate-400">YÊU CẦU ĐẶC BIỆT</p>
                  <h3 className="text-3xl font-black text-amber-400 mt-1">12</h3>
                </div>

                <div className="bg-[#0A192F] border border-slate-800/80 rounded-2xl p-5">
                  <p className="text-[10px] font-bold uppercase text-slate-400">DOANH THU TRUNG BÌNH/KHÁCH</p>
                  <h3 className="text-3xl font-black text-emerald-400 mt-1">4.2Mđ</h3>
                </div>
              </div>

              {/* Customers Directory Table */}
              <div className="bg-[#0A192F] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-4 border-b border-slate-800">
                  <h3 className="font-bold text-white text-sm">Danh Sách Khách Hàng Lưu Trú</h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900/90 text-slate-400 uppercase text-[9px] font-bold tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="py-3.5 px-6">KHÁCH HÀNG</th>
                        <th className="py-3.5 px-6">HẠNG THÀNH VIÊN</th>
                        <th className="py-3.5 px-6">LẦN Ở CUỐI</th>
                        <th className="py-3.5 px-6 text-right">THAO TÁC</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-semibold">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-900/40 transition">
                          <td className="py-4 px-6 flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-teal-500/20 text-teal-300 font-bold flex items-center justify-center text-xs uppercase border border-teal-500/30">
                              {u.username[0]}
                            </div>
                            <div>
                              <p className="font-bold text-white text-xs">{u.username}</p>
                              <p className="text-[10px] text-slate-400">{u.email}</p>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="px-2 py-0.5 bg-teal-500/20 text-teal-300 rounded font-bold text-[9px] uppercase border border-teal-500/30">
                              Diamond Elite
                            </span>
                          </td>
                          <td className="py-4 px-6 text-slate-400">3 ngày trước</td>
                          <td className="py-4 px-6 text-right">
                            <button onClick={() => alert(`Xem hồ sơ khách hàng ${u.username}`)} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg border border-slate-700 cursor-pointer">
                              Hồ sơ
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 6: NHẬT KÝ THÔNG BÁO LỄ TÂN (XEM TẤT CẢ KHÔNG GIỚI HẠN) ================= */}
          {activeTab === "notifications" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-white">Nhật Ký Thông Báo Lễ Tân</h1>
                  <p className="text-slate-400 text-xs mt-1">
                    Xem lại toàn bộ lịch sử thông báo, yêu cầu nhận phòng và các ghi chú vận hành không giới hạn.
                  </p>
                </div>
                <button
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={unreadCount === 0}
                  className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition cursor-pointer"
                >
                  <i className="fa-solid fa-check-double"></i>
                  <span>Đánh Dấu Tất Cả Đã Đọc ({unreadCount})</span>
                </button>
              </div>

              {/* Bộ lọc thông báo */}
              <div className="bg-[#0A192F] border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between text-xs font-semibold">
                <div className="flex gap-2">
                  {(["ALL", "unread", "read"] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setNotificationFilterStatus(st)}
                      className={`px-3 py-1.5 rounded-lg border transition cursor-pointer ${notificationFilterStatus === st
                          ? "bg-teal-500/20 text-teal-300 border-teal-500/40 font-bold"
                          : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                        }`}
                    >
                      {st === "ALL" ? "Tất cả thông báo" : st === "unread" ? "Chưa đọc" : "Đã đọc"}
                    </button>
                  ))}
                </div>
                <span className="text-slate-400 text-xs">
                  Hiển thị <strong className="text-teal-400">{notifications.length}</strong> thông báo
                </span>
              </div>

              {/* Danh sách thông báo dạng Card */}
              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <div className="p-12 text-center bg-[#0A192F] border border-slate-800/80 rounded-2xl text-slate-400 text-xs font-semibold">
                    Không tìm thấy thông báo nào trong nhật ký.
                  </div>
                ) : (
                  notifications
                    .filter((n) => (notificationFilterStatus === "ALL" ? true : n.status === notificationFilterStatus))
                    .map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markAsReadMutation.mutate(n.id)}
                        className={`bg-[#0A192F] border rounded-2xl p-5 transition cursor-pointer flex items-center justify-between gap-4 ${n.status === "unread"
                            ? "border-teal-500/40 bg-teal-500/5 shadow-lg"
                            : "border-slate-800/80 opacity-85"
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`h-10 w-10 rounded-xl flex items-center justify-center text-base shrink-0 font-bold ${n.status === "unread"
                                ? "bg-teal-500/20 text-teal-300 border border-teal-500/40"
                                : "bg-slate-800 text-slate-400 border border-slate-700"
                              }`}
                          >
                            <i className="fa-solid fa-bell"></i>
                          </div>
                          <div>
                            <p className={`text-sm ${n.status === "unread" ? "font-bold text-white" : "text-slate-300"}`}>
                              {n.message}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                              <span><i className="fa-regular fa-clock"></i> {n.createdAt || "Hôm nay"}</span>
                              &bull;
                              <span className={n.status === "unread" ? "text-teal-400 font-bold" : "text-slate-500"}>
                                {n.status === "unread" ? "Chưa đọc" : "Đã đọc"}
                              </span>
                            </p>
                          </div>
                        </div>

                        {n.status === "unread" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsReadMutation.mutate(n.id);
                            }}
                            className="px-3 py-1.5 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 text-xs font-bold rounded-xl transition cursor-pointer shrink-0"
                          >
                            Đánh dấu đã đọc
                          </button>
                        )}
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {activeTab === "hotels" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <ManagerHotelsPage />
            </div>
          )}

          {activeTab === "rooms" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <ManagerRoomsPage />
            </div>
          )}
        </main>
      </div>

      {/* ================= MODAL XEM CHI TIẾT ĐẶT PHÒNG ================= */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#0A192F] border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Chi Tiết Đơn Đặt Phòng #{selectedBooking.id}</h3>
              <button onClick={() => setSelectedBooking(null)} className="text-slate-400 hover:text-white text-lg cursor-pointer">
                &times;
              </button>
            </div>
            <div className="space-y-2 text-xs font-semibold text-slate-300">
              <p><strong className="text-slate-400">Khách Sạn:</strong> <span className="text-white">{getHotelName(selectedBooking.hotelId, selectedBooking.hotelName)}</span></p>
              <p><strong className="text-slate-400">Số Phòng:</strong> <span className="text-teal-400">{selectedBooking.roomNumber}</span></p>
              <p><strong className="text-slate-400">Check-In:</strong> <span className="text-white">{selectedBooking.checkInDate}</span></p>
              <p><strong className="text-slate-400">Check-Out:</strong> <span className="text-white">{selectedBooking.checkOutDate}</span></p>
              <p><strong className="text-slate-400">Số Lượng Khách:</strong> <span className="text-white">{selectedBooking.guests} người</span></p>
              <p><strong className="text-slate-400">Tổng Tiền:</strong> <span className="text-emerald-400 font-extrabold text-sm">{selectedBooking.totalPrice.toLocaleString("vi-VN")} VND</span></p>
              <p><strong className="text-slate-400">Trạng Thái:</strong> <span className="text-teal-300 uppercase font-bold">{selectedBooking.status}</span></p>
            </div>
            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button onClick={() => setSelectedBooking(null)} className="px-4 py-2 bg-slate-800 text-slate-200 rounded-xl font-bold text-xs cursor-pointer">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
