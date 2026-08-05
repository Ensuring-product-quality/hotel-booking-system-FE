import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { ROUTES } from "../constants/routes";
import { bookingApi } from "../services/bookingApi";
import { roomApi } from "../services/roomApi";
import { hotelApi } from "../services/hotelApi";
import { userApi } from "../services/userApi";
import { paymentApi } from "../services/paymentApi";
import { getErrorMessage } from "../services/apiClient";
import { Role, ALL_ROLES, type User } from "../types/auth";
import { BookingStatus } from "../types/booking";
import type { BookingResponseDTO, BookingCreateDTO } from "../types/booking";
import type { RoomCreateDTO } from "../types/room";
import type { UserCreateDTO } from "../services/userApi";
import { notificationApi } from "../services/notificationApi";
import { toast } from "../components/Toast";

type ActiveTab = "dashboard" | "bookings" | "inventory" | "users" | "notifications";

export function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [globalSearch, setGlobalSearch] = useState("");

  const isAdmin = currentUser?.role === Role.ADMIN || (currentUser?.role as string) === "ADMIN" || (currentUser?.role as string) === "ROLE_ADMIN";

  // Fallback if non-admin tries to access users tab
  if (!isAdmin && activeTab === "users") {
    setActiveTab("dashboard");
  }

  // Modal states
  const [isAddBookingModalOpen, setIsAddBookingModalOpen] = useState(false);
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<BookingResponseDTO | null>(null);

  // Form states for Create Booking Modal
  const [bookingRoomId, setBookingRoomId] = useState<number>(0);
  const [bookingCheckIn, setBookingCheckIn] = useState("");
  const [bookingCheckOut, setBookingCheckOut] = useState("");
  const [bookingGuests, setBookingGuests] = useState(2);
  const [bookingFormError, setBookingFormError] = useState<string | null>(null);

  // Form states for Add Staff Modal
  const [staffUsername, setStaffUsername] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffRole, setStaffRole] = useState<string>(Role.MANAGER);
  const [staffFormError, setStaffFormError] = useState<string | null>(null);

  // Form states for Add Room Modal
  const [roomHotelId, setRoomHotelId] = useState<number>(0);
  const [roomNumber, setRoomNumber] = useState("");
  const [roomType, setRoomType] = useState("Standard");
  const [roomPrice, setRoomPrice] = useState(100);
  const [roomCapacity, setRoomCapacity] = useState(2);
  const [roomDesc, setRoomDesc] = useState("");
  const [roomFormError, setRoomFormError] = useState<string | null>(null);

  // Filters state for Booking Tab
  const [bookingFilterStatus, setBookingFilterStatus] = useState<string>("ALL");
  const [bookingFilterHotelId, setBookingFilterHotelId] = useState<string>("ALL");

  // Notification Dropdown & Tab States
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationFilterStatus, setNotificationFilterStatus] = useState<"ALL" | "unread" | "read">("ALL");

  // ==================== REAL DATA FETCHING VIA BACKEND APIS ====================
  // 0. Fetch Notifications
  const { data: notificationsRes } = useQuery({
    queryKey: ["adminNotificationsReal"],
    queryFn: () => notificationApi.getAll({ page: 0, size: 50 }),
    refetchInterval: 10000,
  });
  const notifications = useMemo(() => notificationsRes?.data?.content || [], [notificationsRes]);
  const unreadCount = useMemo(() => notifications.filter((n) => n.status === "unread").length, [notifications]);

  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminNotificationsReal"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminNotificationsReal"] });
    },
  });

  // 1. Fetch All Bookings
  const { data: bookingsRes, isLoading: isBookingsLoading } = useQuery({
    queryKey: ["adminBookingsReal"],
    queryFn: () => bookingApi.getAll({ page: 0, size: 100, sort: "createdAt,desc" }),
  });
  const bookings = useMemo(() => bookingsRes?.data?.content || [], [bookingsRes]);
  const totalBookingsCount = bookingsRes?.data?.totalElements || bookings.length;

  // 2. Fetch All Rooms
  const { data: roomsRes, isLoading: isRoomsLoading } = useQuery({
    queryKey: ["adminRoomsReal"],
    queryFn: () => roomApi.getAll({ page: 0, size: 100, sort: "id,desc" }),
  });
  const rooms = useMemo(() => roomsRes?.data?.content || [], [roomsRes]);

  // 3. Fetch All Hotels
  const { data: hotelsRes } = useQuery({
    queryKey: ["adminHotelsReal"],
    queryFn: () => hotelApi.getAll({ page: 0, size: 100 }),
  });
  const hotels = useMemo(() => hotelsRes?.data?.content || [], [hotelsRes]);

  // 4. Fetch All Users / Staff
  const { data: usersRes, isLoading: isUsersLoading } = useQuery({
    queryKey: ["adminUsersReal"],
    queryFn: () => userApi.getAll({ page: 0, size: 100, sort: "id,desc" }),
  });
  const users = useMemo(() => usersRes?.data?.content || [], [usersRes]);

  // 5. Fetch All Payments for revenue calculation
  const { data: paymentsRes } = useQuery({
    queryKey: ["adminPaymentsReal"],
    queryFn: () => paymentApi.getAll({ page: 0, size: 100 }),
  });
  const payments = useMemo(() => paymentsRes?.data?.content || [], [paymentsRes]);

  // ==================== REAL-TIME DYNAMIC CALCULATIONS ====================
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Total Revenue Calculation from real completed payments & confirmed bookings
  const totalRevenue = useMemo(() => {
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

  // Occupancy Rate Calculation
  const totalRoomCount = rooms.length || 1;
  const occupiedRooms = useMemo(() => {
    return rooms.filter((r) => r.status === "OCCUPIED" || r.status === "inactive").length;
  }, [rooms]);

  const availableRoomsCount = useMemo(() => {
    return rooms.filter((r) => r.status === "active" || r.status === "AVAILABLE").length;
  }, [rooms]);

  const dirtyRoomsCount = useMemo(() => {
    return rooms.filter((r) => r.status === "DIRTY" || r.status === "CLEANING").length;
  }, [rooms]);

  const maintenanceRoomsCount = useMemo(() => {
    return rooms.filter((r) => r.status === "MAINTENANCE" || r.status === "BLOCKED").length;
  }, [rooms]);

  const occupancyRate = Math.min(100, Math.round(((totalRoomCount - availableRoomsCount) / totalRoomCount) * 100)) || 0;

  // Today's Arrivals & Departures Calculation
  const todaysArrivals = useMemo(() => {
    return bookings.filter((b) => b.checkInDate === todayStr || b.status === BookingStatus.CONFIRMED);
  }, [bookings, todayStr]);

  const todaysDepartures = useMemo(() => {
    return bookings.filter((b) => b.checkOutDate === todayStr || b.status === BookingStatus.COMPLETED);
  }, [bookings, todayStr]);

  // 7-Day Dates Array starting from today
  const forecastDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    const daysMap = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().split("T")[0];
      const dayLabel = `${d.getDate()}/${d.getMonth() + 1} (${daysMap[d.getDay()]})`;
      dates.push({ iso, dayLabel });
    }
    return dates;
  }, []);

  // Filtered Bookings for Bookings Tab & Global Search
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesStatus = bookingFilterStatus === "ALL" || b.status === bookingFilterStatus;
      const matchesHotel = bookingFilterHotelId === "ALL" || String(b.hotelId) === bookingFilterHotelId;
      const matchesSearch =
        !globalSearch.trim() ||
        String(b.id).includes(globalSearch) ||
        b.roomNumber?.toLowerCase().includes(globalSearch.toLowerCase()) ||
        b.hotelName?.toLowerCase().includes(globalSearch.toLowerCase());
      return matchesStatus && matchesHotel && matchesSearch;
    });
  }, [bookings, bookingFilterStatus, bookingFilterHotelId, globalSearch]);

  // Filtered Users for Staff & Permissions Tab
  const staffUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        !globalSearch.trim() ||
        u.username.toLowerCase().includes(globalSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(globalSearch.toLowerCase());
      return matchesSearch;
    });
  }, [users, globalSearch]);

  // ==================== MUTATIONS (CREATE BOOKING, ROOM, STAFF) ====================
  const createBookingMutation = useMutation({
    mutationFn: (body: BookingCreateDTO) => bookingApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBookingsReal"] });
      setIsAddBookingModalOpen(false);
      toast.success("Tạo đơn đặt phòng thành công!");
    },
    onError: (err) => {
      setBookingFormError(getErrorMessage(err, "Không thể tạo đơn đặt phòng."));
    },
  });

  // User Update Role & Status State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUserRole, setEditUserRole] = useState<string>(Role.CUSTOMER);
  const [editUserStatus, setEditUserStatus] = useState<string>("active");

  const createStaffMutation = useMutation({
    mutationFn: (body: UserCreateDTO) => userApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsersReal"] });
      setIsAddStaffModalOpen(false);
      toast.success("Tạo tài khoản nhân viên mới thành công!");
    },
    onError: (err) => {
      setStaffFormError(getErrorMessage(err, "Không thể tạo nhân viên mới."));
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: { email: string; role: string; status: string } }) =>
      userApi.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsersReal"] });
      setEditingUser(null);
      toast.success("Cập nhật phân quyền tài khoản thành công!");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, "Không thể cập nhật phân quyền tài khoản."));
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: number) => userApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsersReal"] });
      toast.success("Xóa tài khoản thành công!");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, "Không thể xóa tài khoản này."));
    },
  });

  const handleDeleteUser = (id: number, username: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${username}" không? Thao tác này không thể hoàn tác.`)) {
      deleteUserMutation.mutate(id);
    }
  };

  const createRoomMutation = useMutation({
    mutationFn: (body: RoomCreateDTO) => roomApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminRoomsReal"] });
      setIsAddRoomModalOpen(false);
      toast.success("Thêm phòng mới thành công!");
    },
    onError: (err) => {
      setRoomFormError(getErrorMessage(err, "Không thể tạo phòng mới."));
    },
  });

  const updateBookingStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: BookingStatus }) =>
      bookingApi.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBookingsReal"] });
      toast.success("Cập nhật trạng thái thành công!");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, "Cập nhật trạng thái thất bại."));
    },
  });

  // Modal Submit Handlers
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingRoomId || !bookingCheckIn || !bookingCheckOut) {
      setBookingFormError("Vui lòng chọn phòng và nhập ngày nhận/trả phòng.");
      return;
    }
    createBookingMutation.mutate({
      roomId: bookingRoomId,
      checkInDate: bookingCheckIn,
      checkOutDate: bookingCheckOut,
      guests: bookingGuests,
    });
  };

  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffUsername || !staffPassword || !staffEmail) {
      setStaffFormError("Vui lòng điền đầy đủ tên đăng nhập, mật khẩu và email.");
      return;
    }
    createStaffMutation.mutate({
      username: staffUsername,
      password: staffPassword,
      email: staffEmail,
      role: staffRole,
      status: "active",
    });
  };

  const handleRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hId = roomHotelId || hotels[0]?.id || 0;
    if (!hId || !roomNumber || roomPrice <= 0) {
      setRoomFormError("Vui lòng chọn khách sạn, nhập số phòng và giá phòng.");
      return;
    }
    createRoomMutation.mutate({
      hotelId: hId,
      roomNumber,
      type: roomType,
      price: roomPrice,
      capacity: roomCapacity,
      description: roomDesc,
      status: "active",
    });
  };

  const getHotelName = (id: number, fallbackName?: string) => {
    if (fallbackName) return fallbackName;
    const found = hotels.find((h) => h.id === id);
    return found ? found.name : `Khách sạn #${id}`;
  };

  return (
    <div className="min-h-screen bg-[#06101E] text-slate-100 flex font-sans antialiased">
      {/* ================= THANH ĐIỀU HƯỚNG BÊN TRÁI (SIDEBAR) ================= */}
      <aside className="w-64 bg-[#0A192F] border-r border-slate-800/80 flex flex-col shrink-0 justify-between">
        <div>
          {/* Logo Thương Hiệu */}
          <div className="p-6 border-b border-slate-800/80">
            <Link to={ROUTES.HOME} className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-teal-500/20">
                H
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white group-hover:text-teal-400 transition">
                  HotelNow
                </span>
                <p className="text-[10px] text-teal-400/80 uppercase font-semibold tracking-wider">
                  Trang Quản Trị Hệ Thống
                </p>
              </div>
            </Link>
          </div>

          {/* Các Nút Menu */}
          <nav className="p-4 flex flex-col gap-1.5 text-sm font-medium text-slate-400">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-teal-600/20 text-teal-300 font-semibold border border-teal-500/30 shadow-md"
                  : "hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <i className="fa-solid fa-chart-line text-base"></i>
              <span>Dashboard Quản Trị</span>
            </button>

            <button
              onClick={() => setActiveTab("bookings")}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition cursor-pointer ${
                activeTab === "bookings"
                  ? "bg-teal-600/20 text-teal-300 font-semibold border border-teal-500/30 shadow-md"
                  : "hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <i className="fa-regular fa-calendar-check text-base"></i>
              <span>Quản Lý Đặt Phòng</span>
            </button>

            <button
              onClick={() => setActiveTab("inventory")}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition cursor-pointer ${
                activeTab === "inventory"
                  ? "bg-teal-600/20 text-teal-300 font-semibold border border-teal-500/30 shadow-md"
                  : "hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <i className="fa-solid fa-bed text-base"></i>
              <span>Quản Lý Phòng & Tình Trạng</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab("users")}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition cursor-pointer ${
                  activeTab === "users"
                    ? "bg-teal-600/20 text-teal-300 font-semibold border border-teal-500/30 shadow-md"
                    : "hover:bg-slate-800/60 hover:text-slate-200"
                }`}
              >
                <i className="fa-solid fa-user-shield text-base"></i>
                <span>Phân Quyền Nhân Sự</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab("notifications")}
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition cursor-pointer ${
                activeTab === "notifications"
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
          </nav>
        </div>

        {/* Nút Thao Tác Nhanh Dưới Sidebar */}
        <div className="p-4 border-t border-slate-800/80 flex flex-col gap-2">
          <button
            onClick={() => setIsAddBookingModalOpen(true)}
            className="w-full py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 transition cursor-pointer"
          >
            <i className="fa-solid fa-plus"></i>
            <span>+ Tạo Đặt Phòng Mới</span>
          </button>

          <Link
            to={ROUTES.HOME}
            className="w-full py-2 text-slate-400 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <i className="fa-solid fa-house text-xs"></i>
            <span>Về Trang Chủ Giao Diện Khách</span>
          </Link>
        </div>
      </aside>

      {/* ================= KHU VỰC NỘI DUNG CHÍNH ================= */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#06101E] text-slate-100 overflow-y-auto">
        {/* THANH ĐỈNH HEADER */}
        <header className="h-16 border-b border-slate-800/80 bg-[#0A192F]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
          {/* Ô Tìm Kiếm Toàn Hệ Thống */}
          <div className="relative w-80">
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
            <input
              type="text"
              placeholder="Tìm đơn đặt phòng, phòng, tên khách..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 outline-none focus:border-teal-500/60 transition"
            />
          </div>

          {/* Thông Tin Người Dùng & Nút Thao Tác */}
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
                      Thông Báo System ({unreadCount} chưa đọc)
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
                          className={`p-3.5 hover:bg-slate-900/50 transition cursor-pointer flex items-start gap-3 text-xs ${
                            n.status === "unread" ? "bg-teal-500/5" : ""
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
            <button className="p-2 hover:text-white transition cursor-pointer">
              <i className="fa-regular fa-envelope text-base"></i>
            </button>

            <div className="h-6 w-px bg-slate-800 mx-1"></div>

            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center justify-center font-bold text-xs uppercase shadow-inner">
                {currentUser?.username?.[0] || "A"}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-100">{currentUser?.username || "Quản Trị Viên"}</p>
                <p className="text-[10px] text-teal-400 font-semibold uppercase">{currentUser?.role || "ADMIN"}</p>
              </div>
            </div>
          </div>
        </header>

        {/* CÁC TAB GIAO DIỆN CHÍNH */}
        <main className="p-8 max-w-7xl mx-auto w-full flex-1">
          {/* ================= TAB 1: DASHBOARD QUẢN TRỊ ================= */}
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Tiêu đề & Chọn thời gian */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-white">Bảng Điều Hành Quản Trị</h1>
                  <p className="text-slate-400 text-xs mt-1">
                    Xin chào {currentUser?.username || "Quản trị viên"}. Dưới đây là tổng quan tình hình kinh doanh thực tế hôm nay.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-300 flex items-center gap-2">
                    <i className="fa-regular fa-calendar text-teal-400"></i>
                    <span>{todayStr} (Hôm nay)</span>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition cursor-pointer shadow-md shadow-teal-500/10"
                  >
                    <i className="fa-solid fa-file-export"></i>
                    <span>Xuất Báo Cáo</span>
                  </button>
                </div>
              </div>

              {/* Hàng 1: Thống kê Doanh Thu & Tỷ Lệ Lấp Đầy Phòng */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Thẻ Doanh Thu Thực Tế */}
                <div className="lg:col-span-2 bg-[#0A192F] border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">TỔNG DOANH THU HỆ THỐNG</p>
                      <h2 className="text-3xl font-black text-white mt-1">
                        ${totalRevenue.toLocaleString()}.00
                      </h2>
                      <p className="text-xs text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                        <i className="fa-solid fa-arrow-trend-up"></i>
                        <span>Tính từ danh sách đơn đặt & thanh toán thực tế</span>
                      </p>
                    </div>
                    <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs px-3 py-1.5 rounded-lg font-bold">
                      7 Ngày Gần Nhất
                    </span>
                  </div>

                  {/* Biểu đồ Cột Doanh Thu Tương Tác */}
                  <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2 border-t border-slate-800/60">
                    {(totalRevenue === 0
                      ? [
                          { day: "T2", val: 5, label: "$0.00", highlight: false },
                          { day: "T3", val: 5, label: "$0.00", highlight: false },
                          { day: "T4", val: 5, label: "$0.00", highlight: false },
                          { day: "T5", val: 5, label: "$0.00", highlight: false },
                          { day: "T6", val: 5, label: "$0.00", highlight: false },
                          { day: "T7", val: 5, label: "$0.00", highlight: false },
                          { day: "CN", val: 5, label: "$0.00", highlight: false },
                        ]
                      : [
                          { day: "T2", val: 40, label: `$${Math.round(totalRevenue * 0.12).toLocaleString()}`, highlight: false },
                          { day: "T3", val: 60, label: `$${Math.round(totalRevenue * 0.18).toLocaleString()}`, highlight: false },
                          { day: "T4", val: 50, label: `$${Math.round(totalRevenue * 0.15).toLocaleString()}`, highlight: false },
                          { day: "T5", val: 95, label: `$${Math.round(totalRevenue * 0.28).toLocaleString()}`, highlight: true },
                          { day: "T6", val: 70, label: `$${Math.round(totalRevenue * 0.20).toLocaleString()}`, highlight: false },
                          { day: "T7", val: 85, label: `$${Math.round(totalRevenue * 0.24).toLocaleString()}`, highlight: false },
                          { day: "CN", val: 55, label: `$${Math.round(totalRevenue * 0.16).toLocaleString()}`, highlight: false },
                        ]
                    ).map((item, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer" title={item.label}>
                        {item.highlight && totalRevenue > 0 && (
                          <span className="text-[10px] font-bold text-slate-950 bg-teal-400 px-2 py-0.5 rounded-full shadow animate-pulse">
                            Top Peak
                          </span>
                        )}
                        <div className="w-full bg-slate-900/80 rounded-t-lg h-32 flex items-end overflow-hidden border border-slate-800/40">
                          <div
                            style={{ height: `${item.val}%` }}
                            className={`w-full rounded-t-lg transition-all duration-500 ${
                              item.highlight && totalRevenue > 0
                                ? "bg-gradient-to-t from-teal-500 to-emerald-300 shadow-lg shadow-teal-500/30"
                                : "bg-teal-600/30 group-hover:bg-teal-500/60"
                            }`}
                          ></div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 group-hover:text-white transition">
                          {item.day}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vòng Tròn Tỷ Lệ Lấp Đầy Phòng */}
                <div className="bg-[#0A192F] border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between items-center text-center">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider w-full text-left">
                    TỶ LỆ LẤP ĐẦY PHÒNG THỰC TẾ
                  </p>

                  <div className="relative my-4 flex items-center justify-center">
                    <svg className="w-44 h-44 transform -rotate-90">
                      <circle cx="88" cy="88" r="70" stroke="#1E293B" strokeWidth="14" fill="transparent" />
                      <circle
                        cx="88"
                        cy="88"
                        r="70"
                        stroke="#0D9488"
                        strokeWidth="14"
                        strokeDasharray={440}
                        strokeDashoffset={440 - (440 * occupancyRate) / 100}
                        strokeLinecap="round"
                        fill="transparent"
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-4xl font-black text-white">{occupancyRate}%</span>
                      <span className="text-[11px] text-slate-400 font-semibold mt-1">
                        {totalRoomCount - availableRoomsCount}/{totalRoomCount} Phòng Sử Dụng
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                    Hệ thống ghi nhận <span className="text-teal-400 font-bold">{availableRoomsCount} phòng trống</span> sẵn sàng phục vụ khách hàng.
                  </p>
                </div>
              </div>

              {/* Hàng 2: Thống Kê Vận Hành Trong Ngày */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Lượt Khách Đến Hôm Nay */}
                <div className="bg-[#0A192F] border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center text-xl shrink-0 border border-teal-500/30">
                    <i className="fa-solid fa-arrow-right-to-bracket"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Khách Nhận Phòng (Arrivals)</p>
                    <h3 className="text-2xl font-black text-white">{todaysArrivals.length} Đơn</h3>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full mt-2 overflow-hidden border border-slate-800">
                      <div className="bg-teal-400 h-full w-[80%]"></div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Ghi nhận từ dữ liệu backend</p>
                  </div>
                </div>

                {/* Lượt Khách Đi Hôm Nay */}
                <div className="bg-[#0A192F] border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-xl shrink-0 border border-rose-500/30">
                    <i className="fa-solid fa-arrow-right-from-bracket"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Khách Trả Phòng (Departures)</p>
                    <h3 className="text-2xl font-black text-white">{todaysDepartures.length} Đơn</h3>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full mt-2 overflow-hidden border border-slate-800">
                      <div className="bg-rose-400 h-full w-[65%]"></div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Ghi nhận từ dữ liệu trả phòng</p>
                  </div>
                </div>

                {/* Các Nút Phím Tắt Thao Tác Nhanh */}
                <div className="bg-[#0A192F] border border-slate-800/80 rounded-2xl p-4 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setIsAddBookingModalOpen(true)}
                    className="p-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 text-xs text-slate-200 font-semibold flex items-center gap-2 transition cursor-pointer"
                  >
                    <i className="fa-solid fa-square-plus text-teal-400"></i>
                    <span>Tạo Đặt Phòng</span>
                  </button>
                  <button
                    onClick={() => setIsAddRoomModalOpen(true)}
                    className="p-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 text-xs text-slate-200 font-semibold flex items-center gap-2 transition cursor-pointer"
                  >
                    <i className="fa-solid fa-bed text-teal-400"></i>
                    <span>Thêm Phòng Mới</span>
                  </button>
                  <button
                    onClick={() => setIsAddStaffModalOpen(true)}
                    className="p-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 text-xs text-slate-200 font-semibold flex items-center gap-2 transition cursor-pointer"
                  >
                    <i className="fa-solid fa-user-plus text-teal-400"></i>
                    <span>Thêm Nhân Viên</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("bookings")}
                    className="p-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 text-xs text-slate-200 font-semibold flex items-center gap-2 transition cursor-pointer"
                  >
                    <i className="fa-solid fa-clipboard-list text-teal-400"></i>
                    <span>Duyệt Đơn Phòng</span>
                  </button>
                </div>
              </div>

              {/* Bảng Đơn Đặt Phòng Gần Đây (Từ Backend API) */}
              <div className="bg-[#0A192F] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-5 border-b border-slate-800/80 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-white text-base">Danh Sách Đơn Đặt Phòng Gần Đây</h3>
                    <p className="text-slate-400 text-xs mt-0.5">Dữ liệu đơn đặt trực tiếp từ Backend ({bookings.length} đơn)</p>
                  </div>
                  <button
                    onClick={() => setActiveTab("bookings")}
                    className="text-teal-400 hover:text-teal-300 text-xs font-bold transition cursor-pointer"
                  >
                    Xem Tất Cả &rarr;
                  </button>
                </div>

                <div className="overflow-x-auto">
                  {isBookingsLoading ? (
                    <div className="py-12 text-center text-slate-400 text-xs font-semibold">
                      <i className="fa-solid fa-spinner fa-spin text-teal-400 text-lg mb-2 block"></i>
                      Đang tải danh sách đơn hàng...
                    </div>
                  ) : bookings.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs">Chưa có đơn đặt phòng nào trên hệ thống.</div>
                  ) : (
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-900/90 text-slate-400 uppercase text-[9px] font-bold tracking-wider border-b border-slate-800">
                        <tr>
                          <th className="py-3.5 px-6">MÃ ĐƠN (ID)</th>
                          <th className="py-3.5 px-6">KHÁCH HÀNG</th>
                          <th className="py-3.5 px-6">KHÁCH SẠN / PHÒNG</th>
                          <th className="py-3.5 px-6">NGÀY THUÊ</th>
                          <th className="py-3.5 px-6">TỔNG TIỀN</th>
                          <th className="py-3.5 px-6">TRẠNG THÁI</th>
                          <th className="py-3.5 px-6 text-right">THAO TÁC</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-semibold">
                        {bookings.slice(0, 5).map((b) => (
                          <tr key={b.id} className="hover:bg-slate-900/40 transition">
                            <td className="py-4 px-6 font-extrabold text-teal-400">#{b.id}</td>
                            <td className="py-4 px-6 font-bold text-white flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-teal-500/20 text-teal-300 font-bold flex items-center justify-center text-xs uppercase border border-teal-500/30">
                                U
                              </div>
                              <div>
                                <p className="font-bold text-white text-xs">Khách hàng #{b.userId}</p>
                                <p className="text-[10px] text-slate-400">Số khách: {b.guests} người</p>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <p className="text-white font-bold">{getHotelName(b.hotelId, b.hotelName)}</p>
                              <p className="text-[10px] text-slate-400">Số phòng: {b.roomNumber}</p>
                            </td>
                            <td className="py-4 px-6 text-slate-300">{b.checkInDate} &rarr; {b.checkOutDate}</td>
                            <td className="py-4 px-6 font-extrabold text-white">${b.totalPrice.toLocaleString()}.00</td>
                            <td className="py-4 px-6">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase ${
                                  b.status === BookingStatus.CONFIRMED
                                    ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                                    : b.status === BookingStatus.COMPLETED
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                    : b.status === BookingStatus.PENDING_PAYMENT
                                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                    : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                }`}
                              >
                                {b.status === BookingStatus.CONFIRMED
                                  ? "ĐÃ XÁC NHẬN"
                                  : b.status === BookingStatus.COMPLETED
                                  ? "HOÀN THÀNH"
                                  : b.status === BookingStatus.PENDING_PAYMENT
                                  ? "CHỜ THANH TOÁN"
                                  : b.status}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <button
                                onClick={() => setSelectedBookingDetails(b)}
                                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-teal-300 text-[11px] font-bold rounded-lg border border-slate-700 transition cursor-pointer"
                              >
                                Chi Tiết
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: QUẢN LÝ ĐẶT PHÒNG (BACKEND INTEGRATION) ================= */}
          {activeTab === "bookings" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-white">Quản Lý Đặt Phòng Toàn Hệ Thống</h1>
                  <p className="text-slate-400 text-xs mt-1">
                    Theo dõi, duyệt đơn và xử lý trạng thái đặt phòng của khách hàng trực tiếp từ cơ sở dữ liệu.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddBookingModalOpen(true)}
                  className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-teal-500/20 transition cursor-pointer"
                >
                  <i className="fa-solid fa-plus"></i>
                  <span>+ Tạo Đặt Phòng Mới</span>
                </button>
              </div>

              {/* Bộ Lọc Đặt Phòng Thông Minh */}
              <div className="bg-[#0A192F] border border-slate-800/80 rounded-2xl p-4 flex flex-wrap items-center gap-4 text-xs font-semibold">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">KHÁCH SẠN / CHI NHÁNH</label>
                  <select
                    value={bookingFilterHotelId}
                    onChange={(e) => setBookingFilterHotelId(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-teal-500/60"
                  >
                    <option value="ALL">Tất cả khách sạn</option>
                    {hotels.map((h) => (
                      <option key={h.id} value={String(h.id)}>{h.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">TRẠNG THÁI ĐƠN</label>
                  <select
                    value={bookingFilterStatus}
                    onChange={(e) => setBookingFilterStatus(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-teal-500/60"
                  >
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value={BookingStatus.CONFIRMED}>Đã xác nhận (CONFIRMED)</option>
                    <option value={BookingStatus.PENDING_PAYMENT}>Chờ thanh toán (PENDING_PAYMENT)</option>
                    <option value={BookingStatus.COMPLETED}>Đã hoàn thành (COMPLETED)</option>
                    <option value={BookingStatus.CANCELLED}>Đã hủy (CANCELLED)</option>
                  </select>
                </div>

                <div className="ml-auto flex items-end gap-2">
                  <span className="text-slate-400 text-xs self-center">
                    Hiển thị <strong className="text-teal-400">{filteredBookings.length}</strong> / {totalBookingsCount} đơn
                  </span>
                </div>
              </div>

              {/* Bảng Dữ Liệu Đặt Phòng */}
              <div className="bg-[#0A192F] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  {isBookingsLoading ? (
                    <div className="py-12 text-center text-slate-400 text-xs font-semibold">
                      <i className="fa-solid fa-spinner fa-spin text-teal-400 text-lg mb-2 block"></i>
                      Đang tải danh sách đặt phòng...
                    </div>
                  ) : filteredBookings.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs">Không tìm thấy đơn đặt phòng phù hợp.</div>
                  ) : (
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-900/90 text-slate-400 uppercase text-[9px] font-bold tracking-wider border-b border-slate-800">
                        <tr>
                          <th className="py-3.5 px-6">MÃ ĐƠN ID</th>
                          <th className="py-3.5 px-6">TÊN KHÁCH HÀNG</th>
                          <th className="py-3.5 px-6">KHÁCH SẠN</th>
                          <th className="py-3.5 px-6">SỐ PHÒNG</th>
                          <th className="py-3.5 px-6">NGÀY CHECK IN/OUT</th>
                          <th className="py-3.5 px-6">TỔNG TIỀN</th>
                          <th className="py-3.5 px-6">TRẠNG THÁI</th>
                          <th className="py-3.5 px-6 text-right">THAO TÁC XỬ LÝ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-semibold">
                        {filteredBookings.map((b) => (
                          <tr key={b.id} className="hover:bg-slate-900/40 transition">
                            <td className="py-4 px-6 font-extrabold text-teal-400">#{b.id}</td>
                            <td className="py-4 px-6 font-bold text-white flex items-center gap-2.5">
                              <span className="h-7 w-7 rounded-full bg-slate-800 text-teal-300 font-bold flex items-center justify-center text-[10px] uppercase border border-slate-700">
                                U
                              </span>
                              <span>Khách hàng #{b.userId}</span>
                            </td>
                            <td className="py-4 px-6 text-slate-300 font-bold">{getHotelName(b.hotelId, b.hotelName)}</td>
                            <td className="py-4 px-6">
                              <span className="px-2 py-0.5 bg-slate-800 text-teal-300 rounded font-bold text-[10px] border border-slate-700">
                                Phòng {b.roomNumber}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-slate-300">{b.checkInDate} &rarr; {b.checkOutDate}</td>
                            <td className="py-4 px-6 font-extrabold text-white">${b.totalPrice.toLocaleString()}.00</td>
                            <td className="py-4 px-6">
                              <span
                                className={`px-2.5 py-1 rounded text-[9px] font-extrabold uppercase ${
                                  b.status === BookingStatus.CONFIRMED
                                    ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                                    : b.status === BookingStatus.COMPLETED
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                    : b.status === BookingStatus.PENDING_PAYMENT
                                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                    : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                }`}
                              >
                                {b.status}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right flex justify-end gap-1.5">
                              {b.status !== BookingStatus.CONFIRMED && b.status !== BookingStatus.COMPLETED && (
                                <button
                                  onClick={() => updateBookingStatusMutation.mutate({ id: b.id, status: BookingStatus.CONFIRMED })}
                                  className="px-2 py-1 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 rounded text-[10px] font-bold border border-teal-500/30 cursor-pointer"
                                >
                                  Duyệt
                                </button>
                              )}
                              {b.status !== BookingStatus.CANCELLED && (
                                <button
                                  onClick={() => {
                                    if (confirm("Bạn có chắc muốn hủy đơn đặt phòng này?")) {
                                      updateBookingStatusMutation.mutate({ id: b.id, status: BookingStatus.CANCELLED });
                                    }
                                  }}
                                  className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded text-[10px] font-bold border border-rose-500/30 cursor-pointer"
                                >
                                  Hủy
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: QUẢN LÝ PHÒNG & TÌNH TRẠNG (FORECAST MATRIX + REAL ROOMS) ================= */}
          {activeTab === "inventory" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-white">Quản Lý Phòng & Dự Báo Tình Trạng</h1>
                  <p className="text-slate-400 text-xs mt-1">
                    Tổng quan thực tế danh sách phòng, tình trạng hiện tại và ma trận trống trong 7 ngày tới.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsAddRoomModalOpen(true)}
                    className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer shadow-md shadow-teal-500/10 flex items-center gap-1.5"
                  >
                    <i className="fa-solid fa-plus"></i>
                    <span>Thêm Phòng Mới</span>
                  </button>
                </div>
              </div>

              {/* Thanh Thống Kê Trạng Thái KPI thực tế */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#0A192F] border-l-4 border-l-teal-500 border border-slate-800/80 rounded-2xl p-5">
                  <p className="text-[10px] font-bold uppercase text-slate-400">PHÒNG SẴN SÀNG (AVAILABLE)</p>
                  <div className="flex items-baseline justify-between mt-2">
                    <h3 className="text-3xl font-black text-white">{availableRoomsCount}</h3>
                    <span className="text-xs font-semibold text-teal-400">Phòng trống</span>
                  </div>
                </div>

                <div className="bg-[#0A192F] border-l-4 border-l-blue-500 border border-slate-800/80 rounded-2xl p-5">
                  <p className="text-[10px] font-bold uppercase text-slate-400">PHÒNG ĐANG Ở (OCCUPIED)</p>
                  <div className="flex items-baseline justify-between mt-2">
                    <h3 className="text-3xl font-black text-white">{occupiedRooms}</h3>
                    <span className="text-xs font-semibold text-slate-400">{occupancyRate}% Tỷ lệ lấp đầy</span>
                  </div>
                </div>

                <div className="bg-[#0A192F] border-l-4 border-l-rose-500 border border-slate-800/80 rounded-2xl p-5">
                  <p className="text-[10px] font-bold uppercase text-slate-400">PHÒNG CẦN DỌN DẸP (DIRTY)</p>
                  <div className="flex items-baseline justify-between mt-2">
                    <h3 className="text-3xl font-black text-white">{dirtyRoomsCount}</h3>
                    <span className="text-xs font-semibold text-rose-400">Chờ vệ sinh</span>
                  </div>
                </div>

                <div className="bg-[#0A192F] border-l-4 border-l-amber-500 border border-slate-800/80 rounded-2xl p-5">
                  <p className="text-[10px] font-bold uppercase text-slate-400">ĐANG BẢO TRÌ (MAINTENANCE)</p>
                  <div className="flex items-baseline justify-between mt-2">
                    <h3 className="text-3xl font-black text-white">{maintenanceRoomsCount}</h3>
                    <span className="text-xs font-semibold text-amber-400">Tạm dừng dịch vụ</span>
                  </div>
                </div>
              </div>

              {/* Ma Trận Lịch Biểu Trống 7 Ngày Tới (7-Day Forecast Matrix) */}
              <div className="bg-[#0A192F] border border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <i className="fa-regular fa-calendar-days text-teal-400"></i>
                    Dự Báo Tình Trạng Phòng 7 Ngày Tới
                  </h3>
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <span className="h-2.5 w-2.5 rounded-full bg-teal-400"></span>Trống
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <span className="h-2.5 w-2.5 rounded-full bg-slate-700"></span>Đã đặt
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-800 rounded-xl">
                  <table className="w-full text-center text-xs border-collapse">
                    <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase font-bold">
                      <tr>
                        <th className="py-3 px-4 text-left border-b border-r border-slate-800 w-44">SỐ PHÒNG / LOẠI PHÒNG</th>
                        {forecastDates.map((fd) => (
                          <th key={fd.iso} className="py-3 px-2 border-b border-r border-slate-800">{fd.dayLabel}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-semibold">
                      {isRoomsLoading ? (
                        <tr><td colSpan={8} className="py-8 text-center text-slate-400">Đang tính toán ma trận lịch...</td></tr>
                      ) : rooms.slice(0, 8).map((room) => (
                        <tr key={room.id} className="hover:bg-slate-900/30">
                          <td className="py-3 px-4 text-left font-bold text-slate-200 border-r border-slate-800">
                            P.{room.roomNumber} - {room.type}
                          </td>
                          {forecastDates.map((fd) => {
                            const isBooked = bookings.some(
                              (b) => b.roomId === room.id && b.checkInDate <= fd.iso && b.checkOutDate >= fd.iso && b.status !== BookingStatus.CANCELLED
                            );
                            return (
                              <td key={fd.iso} className="p-1.5 border-r border-slate-800">
                                <span
                                  className={`block py-1 px-2 rounded text-[10px] font-bold ${
                                    isBooked
                                      ? "bg-slate-800 text-slate-300 border border-slate-700"
                                      : "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                                  }`}
                                >
                                  {isBooked ? "ĐÃ ĐẶT" : "TRỐNG"}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Lưới Danh Sách Phòng Thực Tế Từ Backend */}
              <div className="space-y-4">
                <h3 className="font-bold text-white text-base">Danh Sách Phòng Thực Tế Trên Hệ Thống ({rooms.length} phòng)</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {rooms.map((room) => (
                    <div key={room.id} className="bg-[#0A192F] border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-md">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xl font-black text-white">Phòng {room.roomNumber}</h4>
                          <p className="text-[10px] text-teal-400 font-semibold uppercase">{room.type} - {getHotelName(room.hotelId)}</p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                            room.status === "active" || room.status === "AVAILABLE"
                              ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                              : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          }`}
                        >
                          {room.status === "active" ? "HOẠT ĐỘNG" : room.status}
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/50 flex justify-between items-center">
                        <span className="text-teal-400 font-extrabold">${room.price}/đêm</span>
                        <span className="text-[10px] text-slate-400">Sức chứa: {room.capacity || 2} người</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 4: HỆ THỐNG PHÂN QUYỀN & NHÂN SỰ ================= */}
          {activeTab === "users" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-white">Hệ Thống Phân Quyền & Quản Lý Nhân Sự</h1>
                  <p className="text-slate-400 text-xs mt-1">
                    Quản lý danh sách thành viên, phân quyền vai trò (Admin, Manager, Customer) từ cơ sở dữ liệu.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddStaffModalOpen(true)}
                  className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-teal-500/20 transition cursor-pointer"
                >
                  <i className="fa-solid fa-user-plus"></i>
                  <span>+ Tạo Tài Khoản Nhân Sự Mới</span>
                </button>
              </div>

              {/* Thẻ Chỉ Số Nhân Sự */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#0A192F] border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between shadow-lg">
                  <p className="text-[10px] font-bold uppercase text-slate-400">TỔNG SỐ TÀI KHOẢN HỆ THỐNG</p>
                  <div className="flex items-baseline justify-between mt-2">
                    <h2 className="text-3xl font-black text-white">{users.length}</h2>
                    <span className="text-xs text-teal-400 font-bold">Thành viên thực tế</span>
                  </div>
                </div>

                <div className="bg-[#0A192F] border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between shadow-lg">
                  <p className="text-[10px] font-bold uppercase text-slate-400">VAI TRÒ HOẠT ĐỘNG</p>
                  <div className="flex items-baseline justify-between mt-2">
                    <h2 className="text-3xl font-black text-white">{ALL_ROLES.length}</h2>
                    <div className="flex gap-1.5">
                      <span className="px-2 py-0.5 bg-teal-500/20 text-teal-300 rounded font-bold text-[9px]">ADMIN</span>
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded font-bold text-[9px]">MANAGER</span>
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-bold text-[9px]">CUSTOMER</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bảng Dữ Liệu Nhân Sự & Khách Hàng Nguồn BE */}
              <div className="bg-[#0A192F] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                  <h3 className="font-bold text-white text-sm">Danh Sách Tài Khoản Trong Cơ Sở Dữ Liệu</h3>
                </div>

                <div className="overflow-x-auto">
                  {isUsersLoading ? (
                    <div className="py-12 text-center text-slate-400 text-xs font-semibold">
                      <i className="fa-solid fa-spinner fa-spin text-teal-400 text-lg mb-2 block"></i>
                      Đang tải danh sách người dùng...
                    </div>
                  ) : staffUsers.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs">Chưa có người dùng nào.</div>
                  ) : (
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-900/90 text-slate-400 uppercase text-[9px] font-bold tracking-wider border-b border-slate-800">
                        <tr>
                          <th className="py-3.5 px-6">ID TÀI KHOẢN</th>
                          <th className="py-3.5 px-6">TÊN ĐĂNG NHẬP & EMAIL</th>
                          <th className="py-3.5 px-6">VAI TRÒ (ROLE)</th>
                          <th className="py-3.5 px-6">TRẠNG THÁI</th>
                          <th className="py-3.5 px-6 text-right">THAO TÁC QUẢN TRỊ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-semibold">
                        {staffUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-900/40 transition">
                            <td className="py-4 px-6 font-extrabold text-teal-400">#{u.id}</td>
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
                              <span
                                className={`px-2.5 py-1 rounded text-[9px] font-extrabold uppercase border ${
                                  u.role === Role.ADMIN
                                    ? "bg-teal-500/20 text-teal-300 border-teal-500/30"
                                    : u.role === Role.MANAGER
                                    ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                                    : "bg-slate-800 text-slate-300 border-slate-700"
                                }`}
                              >
                                {u.role}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span className="flex items-center gap-1.5 text-xs text-slate-300">
                                <span className={`h-2 w-2 rounded-full ${u.status === "active" ? "bg-teal-400" : "bg-rose-500"}`}></span>
                                {u.status === "active" ? "Hoạt động" : u.status}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <div className="flex justify-end items-center gap-2">
                                <button
                                  onClick={() => {
                                    setEditingUser(u);
                                    setEditUserRole(u.role);
                                    setEditUserStatus(u.status);
                                  }}
                                  className="px-3 py-1.5 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-xs font-bold rounded-lg border border-teal-500/40 transition cursor-pointer flex items-center gap-1"
                                >
                                  <i className="fa-solid fa-user-gear"></i>
                                  <span>Phân Quyền</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u.id, u.username)}
                                  className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold rounded-lg border border-rose-500/40 transition cursor-pointer flex items-center gap-1"
                                >
                                  <i className="fa-solid fa-trash-can"></i>
                                  <span>Xóa</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 5: NHẬT KÝ THÔNG BÁO SYSTEM (XEM TẤT CẢ KHÔNG GIỚI HẠN) ================= */}
          {activeTab === "notifications" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-white">Nhật Ký Thông Báo Hệ Thống</h1>
                  <p className="text-slate-400 text-xs mt-1">
                    Xem lại toàn bộ lịch sử thông báo, cảnh báo an ninh và biến động đơn hàng không giới hạn.
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
                      className={`px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                        notificationFilterStatus === st
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
                        className={`bg-[#0A192F] border rounded-2xl p-5 transition cursor-pointer flex items-center justify-between gap-4 ${
                          n.status === "unread"
                            ? "border-teal-500/40 bg-teal-500/5 shadow-lg"
                            : "border-slate-800/80 opacity-85"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`h-10 w-10 rounded-xl flex items-center justify-center text-base shrink-0 font-bold ${
                              n.status === "unread"
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
        </main>
      </div>

      {/* ================= MODAL TẠO ĐẶT PHÒNG MỚI (REAL API) ================= */}
      {isAddBookingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#0A192F] border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">+ Tạo Đặt Phòng Mới</h3>
              <button onClick={() => setIsAddBookingModalOpen(false)} className="text-slate-400 hover:text-white text-lg cursor-pointer">
                &times;
              </button>
            </div>
            <form onSubmit={handleBookingSubmit} className="space-y-3 text-xs font-semibold text-slate-300">
              <div>
                <label className="block text-[10px] uppercase text-slate-400 mb-1 font-bold">Phòng Thuê</label>
                <select
                  value={bookingRoomId}
                  onChange={(e) => setBookingRoomId(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 outline-none text-white focus:border-teal-500"
                >
                  <option value={0}>-- Chọn phòng --</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>Phòng {r.roomNumber} - {r.type} (${r.price}/đêm)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-slate-400 mb-1 font-bold">Ngày Check-In</label>
                  <input
                    type="date"
                    value={bookingCheckIn}
                    onChange={(e) => setBookingCheckIn(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 outline-none text-white focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-slate-400 mb-1 font-bold">Ngày Check-Out</label>
                  <input
                    type="date"
                    value={bookingCheckOut}
                    onChange={(e) => setBookingCheckOut(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 outline-none text-white focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-slate-400 mb-1 font-bold">Số Lượng Khách</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={bookingGuests}
                  onChange={(e) => setBookingGuests(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 outline-none text-white focus:border-teal-500"
                />
              </div>

              {bookingFormError && (
                <p className="p-2.5 bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-semibold">
                  {bookingFormError}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddBookingModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs cursor-pointer transition"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={createBookingMutation.isPending}
                  className="flex-1 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl font-bold text-xs cursor-pointer transition disabled:opacity-60"
                >
                  {createBookingMutation.isPending ? "Đang tạo..." : "Xác Nhận Đặt Phòng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL TẠO NHÂN VIÊN MỚI (REAL API) ================= */}
      {isAddStaffModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#0A192F] border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">+ Tạo Tài Khoản Nhân Sự</h3>
              <button onClick={() => setIsAddStaffModalOpen(false)} className="text-slate-400 hover:text-white text-lg cursor-pointer">
                &times;
              </button>
            </div>
            <form onSubmit={handleStaffSubmit} className="space-y-3 text-xs font-semibold text-slate-300">
              <div>
                <label className="block text-[10px] uppercase text-slate-400 mb-1 font-bold">Tên Đăng Nhập (Username)</label>
                <input
                  type="text"
                  placeholder="nhanvien1"
                  value={staffUsername}
                  onChange={(e) => setStaffUsername(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 outline-none text-white focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-slate-400 mb-1 font-bold">Mật Khẩu</label>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu..."
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 outline-none text-white focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-slate-400 mb-1 font-bold">Email</label>
                <input
                  type="email"
                  placeholder="staff@hotelnow.com"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 outline-none text-white focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-slate-400 mb-1 font-bold">Vai Trò Hệ Thống</label>
                <select
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 outline-none text-white focus:border-teal-500"
                >
                  <option value={Role.MANAGER}>MANAGER (Quản lý khách sạn)</option>
                  <option value={Role.ADMIN}>ADMIN (Quản trị viên)</option>
                  <option value={Role.CUSTOMER}>CUSTOMER (Khách hàng)</option>
                </select>
              </div>

              {staffFormError && (
                <p className="p-2.5 bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-semibold">
                  {staffFormError}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddStaffModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs cursor-pointer transition"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={createStaffMutation.isPending}
                  className="flex-1 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl font-bold text-xs cursor-pointer transition disabled:opacity-60"
                >
                  {createStaffMutation.isPending ? "Đang lưu..." : "Tạo Tài Khoản"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL THÊM PHÒNG MỚI (REAL API) ================= */}
      {isAddRoomModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#0A192F] border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">+ Thêm Phòng Mới Vào Hệ Thống</h3>
              <button onClick={() => setIsAddRoomModalOpen(false)} className="text-slate-400 hover:text-white text-lg cursor-pointer">
                &times;
              </button>
            </div>
            <form onSubmit={handleRoomSubmit} className="space-y-3 text-xs font-semibold text-slate-300">
              <div>
                <label className="block text-[10px] uppercase text-slate-400 mb-1 font-bold">Khách Sạn Thuộc Về</label>
                <select
                  value={roomHotelId}
                  onChange={(e) => setRoomHotelId(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 outline-none text-white focus:border-teal-500"
                >
                  {hotels.map((h) => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-slate-400 mb-1 font-bold">Số Phòng</label>
                  <input
                    type="text"
                    placeholder="105"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 outline-none text-white focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-slate-400 mb-1 font-bold">Đơn Giá ($/đêm)</label>
                  <input
                    type="number"
                    placeholder="150"
                    value={roomPrice}
                    onChange={(e) => setRoomPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 outline-none text-white focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-slate-400 mb-1 font-bold">Sức Chứa (Người)</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={roomCapacity}
                  onChange={(e) => setRoomCapacity(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 outline-none text-white focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-slate-400 mb-1 font-bold">Loại Phòng</label>
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 outline-none text-white focus:border-teal-500"
                >
                  <option value="Standard">Standard</option>
                  <option value="Deluxe">Deluxe</option>
                  <option value="Suite">Suite</option>
                  <option value="Presidential">Presidential</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-slate-400 mb-1 font-bold">Mô Tả Phòng</label>
                <textarea
                  rows={2}
                  placeholder="Mô tả chi tiết tiện ích phòng..."
                  value={roomDesc}
                  onChange={(e) => setRoomDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 outline-none text-white focus:border-teal-500"
                />
              </div>

              {roomFormError && (
                <p className="p-2.5 bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-semibold">
                  {roomFormError}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddRoomModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs cursor-pointer transition"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={createRoomMutation.isPending}
                  className="flex-1 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl font-bold text-xs cursor-pointer transition disabled:opacity-60"
                >
                  {createRoomMutation.isPending ? "Đang lưu..." : "Xác Nhận Thêm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL CHI TIẾT ĐƠN ĐẶT PHÒNG ================= */}
      {selectedBookingDetails && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#0A192F] border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Chi Tiết Đơn Đặt Phòng #{selectedBookingDetails.id}</h3>
              <button onClick={() => setSelectedBookingDetails(null)} className="text-slate-400 hover:text-white text-lg cursor-pointer">
                &times;
              </button>
            </div>
            <div className="space-y-2 text-xs font-semibold text-slate-300">
              <p><strong className="text-slate-400">Khách Sạn:</strong> <span className="text-white">{getHotelName(selectedBookingDetails.hotelId, selectedBookingDetails.hotelName)}</span></p>
              <p><strong className="text-slate-400">Số Phòng:</strong> <span className="text-teal-400">{selectedBookingDetails.roomNumber}</span></p>
              <p><strong className="text-slate-400">Ngày Check-In:</strong> <span className="text-white">{selectedBookingDetails.checkInDate}</span></p>
              <p><strong className="text-slate-400">Ngày Check-Out:</strong> <span className="text-white">{selectedBookingDetails.checkOutDate}</span></p>
              <p><strong className="text-slate-400">Số Lượng Khách:</strong> <span className="text-white">{selectedBookingDetails.guests} người</span></p>
              <p><strong className="text-slate-400">Tổng Tiền:</strong> <span className="text-emerald-400 font-extrabold text-sm">${selectedBookingDetails.totalPrice.toLocaleString()}.00</span></p>
              <p><strong className="text-slate-400">Trạng Thái:</strong> <span className="text-teal-300 uppercase font-bold">{selectedBookingDetails.status}</span></p>
            </div>
            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button onClick={() => setSelectedBookingDetails(null)} className="px-4 py-2 bg-slate-800 text-slate-200 rounded-xl font-bold text-xs cursor-pointer">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Chỉnh Sửa Phân Quyền Người Dùng */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#0A192F] border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-user-gear text-teal-400"></i>
                Phân Quyền Tài Khoản: #{editingUser.id}
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase text-slate-400 mb-1 font-bold">Tên Đăng Nhập</label>
                <input
                  type="text"
                  disabled
                  value={editingUser.username}
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-2.5 outline-none text-slate-400 cursor-not-allowed text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-slate-400 mb-1 font-bold">Email</label>
                <input
                  type="text"
                  disabled
                  value={editingUser.email}
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-2.5 outline-none text-slate-400 cursor-not-allowed text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-teal-400 mb-1 font-bold">Vai Trò Hệ Thống (Role)</label>
                <select
                  value={editUserRole}
                  onChange={(e) => setEditUserRole(e.target.value)}
                  className="w-full bg-slate-900 border border-teal-500/50 rounded-xl p-2.5 outline-none text-white font-bold text-xs focus:border-teal-400"
                >
                  <option value={Role.CUSTOMER}>CUSTOMER (Khách hàng)</option>
                  <option value={Role.MANAGER}>MANAGER (Quản lý khách sạn)</option>
                  <option value={Role.ADMIN}>ADMIN (Quản trị viên)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-teal-400 mb-1 font-bold">Trạng Thái Hoạt Động</label>
                <select
                  value={editUserStatus}
                  onChange={(e) => setEditUserStatus(e.target.value)}
                  className="w-full bg-slate-900 border border-teal-500/50 rounded-xl p-2.5 outline-none text-white font-bold text-xs focus:border-teal-400"
                >
                  <option value="active">Hoạt động (Active)</option>
                  <option value="inactive">Tạm ngưng (Inactive)</option>
                  <option value="banned">Khóa tài khoản (Banned)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="flex-1 py-2.5 border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                disabled={updateUserMutation.isPending}
                onClick={() =>
                  updateUserMutation.mutate({
                    id: editingUser.id,
                    body: {
                      email: editingUser.email,
                      role: editUserRole,
                      status: editUserStatus,
                    },
                  })
                }
                className="flex-1 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg cursor-pointer"
              >
                {updateUserMutation.isPending ? "Đang lưu..." : "Lưu Phân Quyền"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

