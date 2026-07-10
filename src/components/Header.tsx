import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useAuth } from "../hooks/useAuth";
import { ROUTES } from "../constants/routes";
import { Role } from "../types/auth";
import { apiClient } from "../services/apiClient";
import type { StandardResponse, PageResponse } from "../types/common";
import type { NotificationResponseDTO } from "../types/notification";

// --- Custom Data Structures for Navigation ---
interface Destination {
  name: string;
  desc: string;
  icon: string;
}

const NORTH_DESTINATIONS: Destination[] = [
  { name: "Hà Nội", desc: "Thủ đô cổ kính, nghìn năm văn hiến", icon: "🏛️" },
  { name: "Hạ Long", desc: "Kỳ quan thiên nhiên hùng vĩ", icon: "⛵" },
  { name: "Sa Pa", desc: "Thị trấn sương mờ trên đỉnh núi", icon: "🏔️" },
  { name: "Ninh Bình", desc: "Tràng An cổ kính, non nước hữu tình", icon: "🛶" }
];

const CENTRAL_DESTINATIONS: Destination[] = [
  { name: "Đà Nẵng", desc: "Thành phố đáng sống, cầu Vàng rực rỡ", icon: "Bridge" },
  { name: "Hội An", desc: "Phố cổ đèn lồng lung linh cổ kính", icon: "🏮" },
  { name: "Nha Trang", desc: "Vịnh biển đầy nắng, cát trắng trải dài", icon: "🏖️" },
  { name: "Đà Lạt", desc: "Thành phố ngàn hoa trong sương lạnh", icon: "🌲" }
];

const SOUTH_DESTINATIONS: Destination[] = [
  { name: "Hồ Chí Minh", desc: "Đô thị sầm uất, nhịp sống năng động", icon: "🌆" },
  { name: "Phú Quốc", desc: "Đảo ngọc thiên đường, hoàng hôn rực rỡ", icon: "🏝️" },
  { name: "Vũng Tàu", desc: "Biển xanh rì rào, nghỉ dưỡng lý tưởng", icon: "🌅" },
  { name: "Cần Thơ", desc: "Sông nước miền Tây, chợ nổi độc đáo", icon: "🚣" }
];



export function Header() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  // Responsive / Menu States
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileDestinationsOpen, setIsMobileDestinationsOpen] = useState(false);

  // Manage Booking Modal States
  const [searchBookingModalOpen, setSearchBookingModalOpen] = useState(false);
  const [bookingCodeInput, setBookingCodeInput] = useState("");
  const [bookingSearchError, setBookingSearchError] = useState("");

  // Poll for notifications unread count every 30 seconds if authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchUnreadCount = async () => {
      try {
        const res = await apiClient.get<StandardResponse<PageResponse<NotificationResponseDTO>>>(
          "/notifications",
          { params: { status: "unread", size: 100 } }
        );
        if (res.data.success && res.data.data) {
          setUnreadCount(res.data.data.totalElements);
        }
      } catch {
        // Silent error
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await logout();
  };

  const isLinkActive = (path: string) => {
    return location.pathname === path;
  };

  const handleBookingSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingCodeInput.trim()) {
      setBookingSearchError("Vui lòng nhập mã đặt phòng.");
      return;
    }
    const bookingId = bookingCodeInput.trim();
    setBookingSearchError("");
    setSearchBookingModalOpen(false);
    setBookingCodeInput("");

    if (isAuthenticated) {
      navigate(`/bookings/${bookingId}`);
    } else {
      navigate(`${ROUTES.LOGIN}?redirect=/bookings/${bookingId}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
        {/* Logo */}
        <Link to={ROUTES.HOME} className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight text-brand-600 transition hover:text-brand-700">
            HotelBooking
          </span>
        </Link>

        {/* Navigation Desktop */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-6 xl:gap-8 text-sm font-medium text-slate-600">
          <Link
            to={ROUTES.HOME}
            className={`transition hover:text-brand-600 ${
              isLinkActive(ROUTES.HOME) ? "text-brand-600 font-semibold" : ""
            }`}
          >
            Trang chủ
          </Link>

          {/* Tìm phòng - Có badge Hot */}
          <Link
            to={ROUTES.HOTELS}
            className={`flex items-center gap-1 transition hover:text-brand-600 ${
              isLinkActive(ROUTES.HOTELS) ? "text-brand-600 font-semibold" : ""
            }`}
          >
            <span>Tìm phòng</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          </Link>

          {/* Điểm đến - Mega Dropdown */}
          <div className="group relative">
            <button className="flex items-center gap-1 transition hover:text-brand-600 py-2 cursor-pointer">
              <span>Điểm đến</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-slate-400 group-hover:text-brand-600 transition-transform group-hover:rotate-180"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Mega Dropdown Panel */}
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[720px] rounded-2xl border border-slate-100 bg-white p-6 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="grid grid-cols-3 gap-6">
                {/* Miền Bắc */}
                <div>
                  <h4 className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-3 pb-1 border-b border-slate-100">
                    Miền Bắc
                  </h4>
                  <ul className="space-y-1">
                    {NORTH_DESTINATIONS.map((d) => (
                      <li key={d.name}>
                        <Link
                          to={`${ROUTES.HOTELS}?city=${encodeURIComponent(d.name)}`}
                          className="group/item flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-50 transition"
                        >
                          <span className="text-lg shrink-0">{d.icon}</span>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-700 group-hover/item:text-brand-600 truncate">
                              {d.name}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate leading-tight">{d.desc}</p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Miền Trung */}
                <div>
                  <h4 className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-3 pb-1 border-b border-slate-100">
                    Miền Trung
                  </h4>
                  <ul className="space-y-1">
                    {CENTRAL_DESTINATIONS.map((d) => (
                      <li key={d.name}>
                        <Link
                          to={`${ROUTES.HOTELS}?city=${encodeURIComponent(d.name)}`}
                          className="group/item flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-50 transition"
                        >
                          <span className="text-lg shrink-0">{d.icon === "Bridge" ? "🌉" : d.icon}</span>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-700 group-hover/item:text-brand-600 truncate">
                              {d.name}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate leading-tight">{d.desc}</p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Miền Nam */}
                <div>
                  <h4 className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-3 pb-1 border-b border-slate-100">
                    Miền Nam
                  </h4>
                  <ul className="space-y-1">
                    {SOUTH_DESTINATIONS.map((d) => (
                      <li key={d.name}>
                        <Link
                          to={`${ROUTES.HOTELS}?city=${encodeURIComponent(d.name)}`}
                          className="group/item flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-50 transition"
                        >
                          <span className="text-lg shrink-0">{d.icon}</span>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-700 group-hover/item:text-brand-600 truncate">
                              {d.name}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate leading-tight">{d.desc}</p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Ưu đãi - Highlight màu đỏ */}
          <Link
            to={ROUTES.OFFERS}
            className={`flex items-center gap-1 transition hover:text-brand-600 text-rose-600 font-semibold ${
              isLinkActive(ROUTES.OFFERS) ? "text-brand-600 font-semibold" : ""
            }`}
          >
            <span>Ưu đãi</span>
            <span className="px-1.5 py-0.5 text-[9px] font-bold text-white bg-rose-500 rounded-full uppercase tracking-wider leading-none">
              Sale
            </span>
          </Link>



          {/* Cẩm nang du lịch */}
          <Link
            to={ROUTES.TRAVEL_GUIDE}
            className={`transition hover:text-brand-600 ${
              isLinkActive(ROUTES.TRAVEL_GUIDE) ? "text-brand-600 font-semibold" : ""
            }`}
          >
            Cẩm nang
          </Link>

          {/* Tra cứu đặt phòng */}
          <Link
            to={ROUTES.BOOKING_LOOKUP}
            className={`transition hover:text-brand-600 ${
              isLinkActive(ROUTES.BOOKING_LOOKUP) ? "text-brand-600 font-semibold" : ""
            }`}
          >
            Tra cứu đặt phòng
          </Link>

          {/* Liên hệ */}
          <Link
            to={ROUTES.CONTACT}
            className={`transition hover:text-brand-600 ${
              isLinkActive(ROUTES.CONTACT) ? "text-brand-600 font-semibold" : ""
            }`}
          >
            Liên hệ
          </Link>
        </nav>

        {/* User / Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-3 md:gap-5">
              {/* Notifications bell */}
              <Link
                to={ROUTES.NOTIFICATIONS}
                className="relative p-1.5 text-slate-500 hover:text-brand-600 rounded-full hover:bg-slate-50 transition"
                title="Thông báo"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </Link>

              {/* User Dropdown/Display */}
              <div className="relative group">
                <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-50 transition text-sm cursor-pointer">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.username}
                      className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-100"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-sm">
                      {user?.username ? user.username[0].toUpperCase() : "U"}
                    </div>
                  )}
                  <span className="hidden sm:inline-block font-medium text-slate-700 max-w-[100px] truncate">
                    {user?.username}
                  </span>
                </button>

                {/* Dropdown menu */}
                <div className="absolute right-0 mt-1 w-52 rounded-xl border border-slate-100 bg-white p-1.5 shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50">
                  <div className="px-3 py-2 border-b border-slate-50 mb-1">
                    <p className="text-xs text-slate-400">Tài khoản</p>
                    <p className="text-sm font-semibold text-slate-700 truncate">{user?.email}</p>
                    <p className="text-[10px] inline-flex mt-1 px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase font-semibold">
                      {user?.role?.replace("ROLE_", "")}
                    </p>
                  </div>

                  {/* Customer specific links */}
                  {user?.role === Role.CUSTOMER && (
                    <Link
                      to={ROUTES.MY_BOOKINGS}
                      className="flex w-full items-center px-3 py-2 text-sm text-slate-600 rounded-lg hover:bg-slate-50 transition"
                    >
                      Đơn đặt phòng của tôi
                    </Link>
                  )}

                  {/* Staff specific links */}
                  {(user?.role === Role.STAFF ||
                    user?.role === Role.MANAGER ||
                    user?.role === Role.ADMIN) && (
                    <Link
                      to={ROUTES.STAFF_BOOKINGS}
                      className="flex w-full items-center px-3 py-2 text-sm text-slate-600 rounded-lg hover:bg-slate-50 transition font-medium text-brand-700 bg-brand-50/50"
                    >
                      Quản lý đặt phòng
                    </Link>
                  )}

                  {/* Manager / Admin specific links */}
                  {(user?.role === Role.MANAGER || user?.role === Role.ADMIN) && (
                    <>
                      <Link
                        to={ROUTES.MANAGER_HOTELS}
                        className="flex w-full items-center px-3 py-2 text-sm text-slate-600 rounded-lg hover:bg-slate-50 transition"
                      >
                        Quản lý khách sạn
                      </Link>
                      <Link
                        to={ROUTES.MANAGER_ROOMS}
                        className="flex w-full items-center px-3 py-2 text-sm text-slate-600 rounded-lg hover:bg-slate-50 transition"
                      >
                        Quản lý phòng
                      </Link>
                      <Link
                        to={ROUTES.MANAGER_USERS}
                        className="flex w-full items-center px-3 py-2 text-sm text-slate-600 rounded-lg hover:bg-slate-50 transition"
                      >
                        Quản lý người dùng
                      </Link>
                    </>
                  )}

                  <hr className="my-1 border-slate-50" />
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3 text-sm">
              <Link
                to={ROUTES.LOGIN}
                className="px-3 py-1.5 font-medium text-slate-600 hover:text-brand-600 rounded-lg hover:bg-slate-50 transition"
              >
                Đăng nhập
              </Link>
              <Link
                to={ROUTES.REGISTER}
                className="px-3.5 py-1.5 font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition hover:shadow-brand-100 hover:scale-[1.01]"
              >
                Đăng ký
              </Link>
            </div>
          )}

          {/* Hamburger Menu Button (Mobile Only) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1.5 text-slate-500 hover:text-brand-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* --- Mobile Drawer Sidebar --- */}
      <div
        className={`fixed inset-0 z-50 bg-black/45 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div
          className={`absolute right-0 top-0 h-full w-4/5 max-w-sm bg-white p-6 shadow-2xl transition-transform duration-300 flex flex-col ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <span className="text-xl font-bold text-brand-600">HotelBooking Menu</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Drawer Links */}
          <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-1">
            {/* Trang chủ */}
            <Link
              to={ROUTES.HOME}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center px-3 py-2.5 text-sm font-semibold rounded-lg hover:bg-slate-50 transition ${
                isLinkActive(ROUTES.HOME) ? "text-brand-600 bg-brand-50/30" : "text-slate-700"
              }`}
            >
              Trang chủ
            </Link>

            {/* Tìm phòng */}
            <Link
              to={ROUTES.HOTELS}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 text-sm font-semibold rounded-lg hover:bg-slate-50 transition ${
                isLinkActive(ROUTES.HOTELS) ? "text-brand-600 bg-brand-50/30" : "text-slate-700"
              }`}
            >
              <span>Tìm phòng</span>
              <span className="px-1.5 py-0.5 text-[9px] font-bold text-white bg-red-500 rounded uppercase tracking-wider leading-none">
                Hot
              </span>
            </Link>

            {/* Điểm đến Accordion */}
            <div>
              <button
                onClick={() => setIsMobileDestinationsOpen(!isMobileDestinationsOpen)}
                className="flex w-full items-center justify-between px-3 py-2.5 text-sm font-semibold text-slate-700 rounded-lg hover:bg-slate-50 transition text-left cursor-pointer"
              >
                <span>Điểm đến</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 text-slate-400 transition-transform ${isMobileDestinationsOpen ? "rotate-180" : ""}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </button>
              
              {isMobileDestinationsOpen && (
                <div className="pl-3 pr-1 py-1 flex flex-col gap-2.5 bg-slate-50/50 rounded-lg mt-1 border-l-2 border-slate-100">
                  <div>
                    <p className="text-[10px] font-bold text-brand-600 uppercase tracking-wider px-2 py-0.5">Miền Bắc</p>
                    <div className="grid grid-cols-2 gap-1 mt-0.5">
                      {NORTH_DESTINATIONS.map((d) => (
                        <Link
                          key={d.name}
                          to={`${ROUTES.HOTELS}?city=${encodeURIComponent(d.name)}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-1 px-2 py-1.5 text-xs text-slate-600 rounded hover:bg-slate-100 transition"
                        >
                          <span>{d.icon}</span>
                          <span className="truncate">{d.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-[10px] font-bold text-brand-600 uppercase tracking-wider px-2 py-0.5">Miền Trung</p>
                    <div className="grid grid-cols-2 gap-1 mt-0.5">
                      {CENTRAL_DESTINATIONS.map((d) => (
                        <Link
                          key={d.name}
                          to={`${ROUTES.HOTELS}?city=${encodeURIComponent(d.name)}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-1 px-2 py-1.5 text-xs text-slate-600 rounded hover:bg-slate-100 transition"
                        >
                          <span>{d.icon === "Bridge" ? "🌉" : d.icon}</span>
                          <span className="truncate">{d.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-brand-600 uppercase tracking-wider px-2 py-0.5">Miền Nam</p>
                    <div className="grid grid-cols-2 gap-1 mt-0.5">
                      {SOUTH_DESTINATIONS.map((d) => (
                        <Link
                          key={d.name}
                          to={`${ROUTES.HOTELS}?city=${encodeURIComponent(d.name)}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-1 px-2 py-1.5 text-xs text-slate-600 rounded hover:bg-slate-100 transition"
                        >
                          <span>{d.icon}</span>
                          <span className="truncate">{d.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Cẩm nang du lịch */}
            <Link
              to={ROUTES.TRAVEL_GUIDE}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center px-3 py-2.5 text-sm font-semibold rounded-lg hover:bg-slate-50 transition ${
                isLinkActive(ROUTES.TRAVEL_GUIDE) ? "text-brand-600 bg-brand-50/30" : "text-slate-700"
              }`}
            >
              Cẩm nang du lịch
            </Link>

            {/* Tra cứu đặt phòng */}
            <Link
              to={ROUTES.BOOKING_LOOKUP}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center px-3 py-2.5 text-sm font-semibold rounded-lg hover:bg-slate-50 transition ${
                isLinkActive(ROUTES.BOOKING_LOOKUP) ? "text-brand-600 bg-brand-50/30" : "text-slate-700"
              }`}
            >
              Tra cứu đặt phòng
            </Link>

            {/* Liên hệ */}
            <Link
              to={ROUTES.CONTACT}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center px-3 py-2.5 text-sm font-semibold rounded-lg hover:bg-slate-50 transition ${
                isLinkActive(ROUTES.CONTACT) ? "text-brand-600 bg-brand-50/30" : "text-slate-700"
              }`}
            >
              Liên hệ
            </Link>
          </nav>
          
          {/* Drawer Footer if not authenticated */}
          {!isAuthenticated && (
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to={ROUTES.LOGIN}
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition"
              >
                Đăng nhập
              </Link>
              <Link
                to={ROUTES.REGISTER}
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition shadow-md"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>



      {/* --- Manage Booking Modal --- */}
      {searchBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Tra cứu đặt phòng
              </h3>
              <button
                onClick={() => {
                  setSearchBookingModalOpen(false);
                  setBookingCodeInput("");
                  setBookingSearchError("");
                }}
                className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleBookingSearch} className="mt-4 flex flex-col gap-4">
              <div>
                <label htmlFor="bookingCode" className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">
                  Nhập Mã đặt phòng (Booking ID)
                </label>
                <input
                  id="bookingCode"
                  type="number"
                  placeholder="Ví dụ: 12, 15, 102..."
                  value={bookingCodeInput}
                  onChange={(e) => setBookingCodeInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none transition text-slate-800"
                />
                {bookingSearchError && (
                  <p className="mt-1.5 text-xs text-red-500 font-medium">
                    {bookingSearchError}
                  </p>
                )}
              </div>

              <div className="rounded-xl bg-amber-50 border border-amber-100 p-3 text-xs text-amber-800 leading-relaxed">
                <span className="font-semibold">Lưu ý bảo mật:</span> Để bảo mật thông tin đặt phòng, hệ thống yêu cầu bạn đăng nhập. Sau khi đăng nhập thành công, bạn sẽ được tự động chuyển hướng thẳng tới trang chi tiết của đặt phòng đó.
              </div>

              <div className="flex gap-3 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSearchBookingModalOpen(false);
                    setBookingCodeInput("");
                    setBookingSearchError("");
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition shadow-md cursor-pointer"
                >
                  Tra cứu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
