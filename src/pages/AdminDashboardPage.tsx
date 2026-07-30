import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { ROUTES } from "../constants/routes";

type ActiveTab = "dashboard" | "bookings" | "inventory" | "users";

export function AdminDashboardPage() {
  const currentUser = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [globalSearch, setGlobalSearch] = useState("");

  // Modal states
  const [isAddBookingModalOpen, setIsAddBookingModalOpen] = useState(false);
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);

  // --- Mock/Extended Data for Rich Mockups display ---
  const mockRecentBookings = [
    { id: 92031, guest: "Eleanor Jones", avatar: "EJ", bg: "bg-teal-100 text-teal-800", room: "Deluxe Suite 402", sub: "King Size Bed", dates: "Oct 26 - Oct 29", amount: 1240, status: "CONFIRMED" },
    { id: 92045, guest: "Marcus Aurelius", avatar: "MA", bg: "bg-slate-700 text-white", room: "Superior Twin 208", sub: "City View", dates: "Oct 27 - Oct 31", amount: 890, status: "PENDING" },
    { id: 91988, guest: "Sarah Wilson", avatar: "SW", bg: "bg-rose-100 text-rose-800", room: "Penthouse 1001", sub: "Ocean Front", dates: "Nov 02 - Nov 05", amount: 3500, status: "CANCELLED" },
    { id: 92050, guest: "David Tan", avatar: "DT", bg: "bg-emerald-100 text-emerald-800", room: "Standard Room 112", sub: "Garden Side", dates: "Oct 28 - Oct 29", amount: 450, status: "CONFIRMED" },
  ];

  const mockInventoryRooms = [
    { id: 502, category: "Luxury Suites", type: "Presidential Suite", roomNumber: "502", guestName: "Mr. Robert Downey", status: "OCCUPIED" },
    { id: 503, category: "Luxury Suites", type: "Presidential Suite", roomNumber: "503", guestName: "Ready for Guest", status: "AVAILABLE" },
    { id: 504, category: "Luxury Suites", type: "King Garden View", roomNumber: "504", guestName: "Housekeeping Assigned", status: "DIRTY" },
    { id: 505, category: "Luxury Suites", type: "Penthouse Suite", roomNumber: "505", guestName: "AC Repair in Progress (ETA 12:00 PM)", status: "BLOCKED" },
    { id: 301, category: "Deluxe Rooms", type: "Deluxe Ocean View", roomNumber: "301", guestName: "Mrs. Clara Oswald", status: "OCCUPIED" },
    { id: 302, category: "Deluxe Rooms", type: "Deluxe Garden", roomNumber: "302", guestName: "Cleaned & Ready", status: "AVAILABLE" },
    { id: 303, category: "Deluxe Rooms", type: "Deluxe Twin", roomNumber: "303", guestName: "Ready for Check-in", status: "AVAILABLE" },
  ];

  const mockForecastMatrix = [
    { room: "101 - Classic", dates: ["AVAIL", "M. Chen", "M. Chen", "M. Chen", "AVAIL", "D. Lopez", "D. Lopez"] },
    { room: "204 - Deluxe", dates: ["MAINTENANCE", "MAINTENANCE", "AVAIL", "AVAIL", "VIP: J. Smith", "VIP: J. Smith", "VIP: J. Smith"] },
    { room: "501 - Suite", dates: ["Corp: Tesla Inc.", "Corp: Tesla Inc.", "Corp: Tesla Inc.", "Corp: Tesla Inc.", "Corp: Tesla Inc.", "AVAIL", "AVAIL"] },
  ];

  const mockStaffList = [
    { id: 1, name: "Sophia Chen", email: "s.chen@hotelnow.com", avatar: "SC", bg: "bg-cyan-100 text-cyan-800", role: "ADMIN", branch: "Paris HQ - Opera", status: "Online" },
    { id: 2, name: "Marcus Wright", email: "m.wright@hotelnow.com", avatar: "MW", bg: "bg-rose-100 text-rose-800", role: "RECEPTIONIST", branch: "London - Mayfair", status: "Offline" },
    { id: 3, name: "Elena Lopez", email: "e.lopez@hotelnow.com", avatar: "EL", bg: "bg-amber-100 text-amber-800", role: "MANAGER", branch: "Madrid - Retiro", status: "Online" },
    { id: 4, name: "Julian Banks", email: "j.banks@hotelnow.com", avatar: "JB", bg: "bg-teal-100 text-teal-800", role: "SPA STAFF", branch: "Bali - Ubud Resort", status: "Online" },
  ];

  const [bookingFilterStatus, setBookingFilterStatus] = useState("ALL");
  const [bookingFilterBranch, setBookingFilterBranch] = useState("ALL");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased">
      {/* ================= SIDEBAR NAVIGATION ================= */}
      <aside className="w-64 bg-[#0B132B] border-r border-slate-800 flex flex-col shrink-0 justify-between">
        <div>
          {/* Brand Header */}
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
                  Admin Management
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 flex flex-col gap-1.5 text-sm font-medium text-slate-400">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-teal-600/20 text-teal-300 font-semibold border border-teal-500/30"
                  : "hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <i className="fa-solid fa-chart-line text-base"></i>
              <span>Dashboard Quản trị</span>
            </button>

            <button
              onClick={() => setActiveTab("bookings")}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition cursor-pointer ${
                activeTab === "bookings"
                  ? "bg-teal-600/20 text-teal-300 font-semibold border border-teal-500/30"
                  : "hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <i className="fa-regular fa-calendar-check text-base"></i>
              <span>Quản lý đặt phòng</span>
            </button>

            <button
              onClick={() => setActiveTab("inventory")}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition cursor-pointer ${
                activeTab === "inventory"
                  ? "bg-teal-600/20 text-teal-300 font-semibold border border-teal-500/30"
                  : "hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <i className="fa-solid fa-bed text-base"></i>
              <span>Quản lý phòng & Dịch vụ</span>
            </button>

            <button
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition cursor-pointer ${
                activeTab === "users"
                  ? "bg-teal-600/20 text-teal-300 font-semibold border border-teal-500/30"
                  : "hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <i className="fa-solid fa-user-shield text-base"></i>
              <span>Hệ thống phân quyền</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Buttons */}
        <div className="p-4 border-t border-slate-800/80 flex flex-col gap-2">
          <button
            onClick={() => setIsAddBookingModalOpen(true)}
            className="w-full py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 transition cursor-pointer"
          >
            <i className="fa-solid fa-plus"></i>
            <span>+ Tạo đặt phòng mới</span>
          </button>

          <Link
            to={ROUTES.HOME}
            className="w-full py-2 text-slate-400 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <i className="fa-solid fa-house text-xs"></i>
            <span>Trở về Trang chủ</span>
          </Link>
        </div>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950 text-slate-100 overflow-y-auto">
        {/* TOP BAR */}
        <header className="h-16 border-b border-slate-800/80 bg-[#0F172A]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
          {/* Global Search */}
          <div className="relative w-80">
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
            <input
              type="text"
              placeholder="Search bookings, guests, rooms..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 outline-none focus:border-teal-500/50"
            />
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-4 text-slate-400">
            <button className="relative p-2 hover:text-white transition cursor-pointer">
              <i className="fa-regular fa-bell text-base"></i>
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-teal-400"></span>
            </button>
            <button className="p-2 hover:text-white transition cursor-pointer">
              <i className="fa-regular fa-envelope text-base"></i>
            </button>
            <button className="p-2 hover:text-white transition cursor-pointer">
              <i className="fa-solid fa-gear text-base"></i>
            </button>

            <div className="h-6 w-px bg-slate-800 mx-1"></div>

            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center font-bold text-xs uppercase">
                {currentUser?.username?.[0] || "A"}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-100">{currentUser?.username || "Alex Rivera"}</p>
                <p className="text-[10px] text-teal-400 font-semibold uppercase">{currentUser?.role || "ADMIN"}</p>
              </div>
            </div>
          </div>
        </header>

        {/* TAB CONTENTS */}
        <main className="p-8 max-w-7xl mx-auto w-full flex-1">
          {/* ================= TAB 1: DASHBOARD QUẢN TRỊ ================= */}
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Title & Date Range */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-white">Executive Dashboard</h1>
                  <p className="text-slate-400 text-xs mt-1">
                    Welcome back, {currentUser?.username || "Alex"}. Here's what's happening at HotelNow today.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-300 flex items-center gap-2">
                    <i className="fa-regular fa-calendar text-teal-400"></i>
                    <span>Oct 24, 2023 - Oct 30, 2023</span>
                  </div>
                  <button className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition cursor-pointer shadow-md shadow-teal-500/10">
                    <i className="fa-solid fa-download"></i>
                    <span>Export Report</span>
                  </button>
                </div>
              </div>

              {/* Row 1: Charts & Occupancy */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Total Revenue Card */}
                <div className="lg:col-span-2 bg-[#0F172A] border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">TOTAL REVENUE</p>
                      <h2 className="text-3xl font-black text-white mt-1">$124,592.00</h2>
                      <p className="text-xs text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                        <i className="fa-solid fa-arrow-trend-up"></i>
                        <span>+12.4% from last month</span>
                      </p>
                    </div>
                    <select className="bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 px-3 py-1.5 outline-none">
                      <option>Last 7 Days</option>
                      <option>Last 30 Days</option>
                    </select>
                  </div>

                  {/* Visual Bar Chart */}
                  <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2 border-t border-slate-800/60">
                    {[
                      { day: "MON", val: 35, label: "$12k" },
                      { day: "TUE", val: 55, label: "$18k" },
                      { day: "WED", val: 42, label: "$14k" },
                      { day: "THU", val: 90, label: "$26k", highlight: true },
                      { day: "FRI", val: 60, label: "$20k" },
                      { day: "SAT", val: 80, label: "$24k" },
                      { day: "SUN", val: 50, label: "$16k" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                        {item.highlight && (
                          <span className="text-[10px] font-bold text-slate-950 bg-teal-400 px-2 py-0.5 rounded-full shadow">
                            {item.label}
                          </span>
                        )}
                        <div className="w-full bg-slate-800/80 rounded-t-lg h-32 flex items-end overflow-hidden">
                          <div
                            style={{ height: `${item.val}%` }}
                            className={`w-full rounded-t-lg transition-all duration-500 ${
                              item.highlight
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

                {/* Occupancy Rate Gauge */}
                <div className="bg-[#0B132B] border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between items-center text-center">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider w-full text-left">
                    OCCUPANCY RATE
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
                        strokeDashoffset={440 - (440 * 78) / 100}
                        strokeLinecap="round"
                        fill="transparent"
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-4xl font-black text-white">78%</span>
                      <span className="text-[11px] text-slate-400 font-semibold">156/200 Rooms</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                    Strong seasonal performance. You are trending <span className="text-teal-400 font-bold">5% higher</span> than last year.
                  </p>
                </div>
              </div>

              {/* Row 2: Operational Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Today's Arrivals */}
                <div className="bg-[#0F172A] border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center text-xl shrink-0">
                    <i className="fa-solid fa-arrow-right-to-bracket"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Today's Arrivals</p>
                    <h3 className="text-2xl font-black text-white">24</h3>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-teal-400 h-full w-[75%]"></div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">18 Check-ins completed (75%)</p>
                  </div>
                </div>

                {/* Today's Departures */}
                <div className="bg-[#0F172A] border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-xl shrink-0">
                    <i className="fa-solid fa-arrow-right-from-bracket"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Today's Departures</p>
                    <h3 className="text-2xl font-black text-white">12</h3>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-rose-400 h-full w-[83%]"></div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">10 Check-outs completed (83%)</p>
                  </div>
                </div>

                {/* Quick Actions Grid */}
                <div className="bg-[#0F172A] border border-slate-800/80 rounded-2xl p-4 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setIsAddBookingModalOpen(true)}
                    className="p-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 text-xs text-slate-200 font-semibold flex items-center gap-2 transition cursor-pointer"
                  >
                    <i className="fa-solid fa-square-plus text-teal-400"></i>
                    <span>Add Booking</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("inventory")}
                    className="p-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 text-xs text-slate-200 font-semibold flex items-center gap-2 transition cursor-pointer"
                  >
                    <i className="fa-solid fa-bed text-teal-400"></i>
                    <span>Update Room</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("users")}
                    className="p-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 text-xs text-slate-200 font-semibold flex items-center gap-2 transition cursor-pointer"
                  >
                    <i className="fa-solid fa-user-plus text-teal-400"></i>
                    <span>New Staff</span>
                  </button>
                  <button className="p-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 text-xs text-slate-200 font-semibold flex items-center gap-2 transition cursor-pointer">
                    <i className="fa-solid fa-clipboard text-teal-400"></i>
                    <span>Shift Notes</span>
                  </button>
                </div>
              </div>

              {/* Recent Bookings Table */}
              <div className="bg-[#0F172A] border border-slate-800/80 rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-slate-800/80 flex justify-between items-center">
                  <h3 className="font-bold text-white text-base">Recent Bookings</h3>
                  <button
                    onClick={() => setActiveTab("bookings")}
                    className="text-teal-400 hover:text-teal-300 text-xs font-bold transition cursor-pointer"
                  >
                    View All Bookings &rarr;
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900/80 text-slate-400 uppercase text-[9px] font-bold tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="py-3.5 px-6">GUEST NAME</th>
                        <th className="py-3.5 px-6">ROOM</th>
                        <th className="py-3.5 px-6">DATE RANGE</th>
                        <th className="py-3.5 px-6">AMOUNT</th>
                        <th className="py-3.5 px-6">STATUS</th>
                        <th className="py-3.5 px-6 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-semibold">
                      {mockRecentBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-900/40 transition">
                          <td className="py-4 px-6 flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-full ${b.bg} flex items-center justify-center font-bold text-xs`}>
                              {b.avatar}
                            </div>
                            <div>
                              <p className="font-bold text-white text-xs">{b.guest}</p>
                              <p className="text-[10px] text-slate-500">#LS-{b.id}</p>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-white">{b.room}</p>
                            <p className="text-[10px] text-slate-500">{b.sub}</p>
                          </td>
                          <td className="py-4 px-6 text-slate-300">{b.dates}</td>
                          <td className="py-4 px-6 font-extrabold text-white">${b.amount.toLocaleString()}.00</td>
                          <td className="py-4 px-6">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase ${
                                b.status === "CONFIRMED"
                                  ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                                  : b.status === "PENDING"
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                  : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              }`}
                            >
                              {b.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button className="text-slate-400 hover:text-white p-1 transition cursor-pointer">
                              <i className="fa-solid fa-ellipsis-vertical"></i>
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

          {/* ================= TAB 2: QUẢN LÝ ĐẶT PHÒNG ================= */}
          {activeTab === "bookings" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-white">Booking Management</h1>
                  <p className="text-slate-400 text-xs mt-1">
                    Efficiently monitor and manage guest reservations across all branches.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddBookingModalOpen(true)}
                  className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-teal-500/20 transition cursor-pointer"
                >
                  <i className="fa-solid fa-plus"></i>
                  <span>Add New Booking</span>
                </button>
              </div>

              {/* Filters Bar */}
              <div className="bg-[#0F172A] border border-slate-800/80 rounded-2xl p-4 flex flex-wrap items-center gap-4 text-xs font-semibold">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">DATE RANGE</label>
                  <select className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none">
                    <option>Next 7 Days</option>
                    <option>This Month</option>
                    <option>All Time</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">BRANCH</label>
                  <select
                    value={bookingFilterBranch}
                    onChange={(e) => setBookingFilterBranch(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none"
                  >
                    <option value="ALL">All Locations</option>
                    <option value="Saigon">Grand Luxe Saigon</option>
                    <option value="Da Nang">Seaside Da Nang</option>
                    <option value="Hanoi">Classic Hanoi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">STATUS</label>
                  <select
                    value={bookingFilterStatus}
                    onChange={(e) => setBookingFilterStatus(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PENDING">Pending</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div className="ml-auto flex items-end">
                  <button className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs transition cursor-pointer">
                    Apply Filters
                  </button>
                </div>
              </div>

              {/* Bookings Table */}
              <div className="bg-[#0F172A] border border-slate-800/80 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900/80 text-slate-400 uppercase text-[9px] font-bold tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="py-3.5 px-6">BOOKING ID</th>
                        <th className="py-3.5 px-6">GUEST NAME</th>
                        <th className="py-3.5 px-6">HOTEL/BRANCH</th>
                        <th className="py-3.5 px-6">ROOM TYPE</th>
                        <th className="py-3.5 px-6">CHECK IN/OUT</th>
                        <th className="py-3.5 px-6">AMOUNT</th>
                        <th className="py-3.5 px-6">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-semibold">
                      {[
                        { id: "BK-9421", guest: "Julianna Dubois", avatar: "JD", hotel: "Grand Luxe Saigon", room: "Deluxe Suite", dates: "Oct 12 - Oct 15 (3 NIGHTS)", amount: 1240, status: "CONFIRMED" },
                        { id: "BK-9425", guest: "Marcus Wright", avatar: "MW", hotel: "Seaside Da Nang", room: "Presidential", dates: "Oct 14 - Oct 18 (4 NIGHTS)", amount: 4500, status: "PENDING" },
                        { id: "BK-9428", guest: "Sarah Lindholm", avatar: "SL", hotel: "Classic Hanoi", room: "Standard King", dates: "Oct 15 - Oct 16 (1 NIGHT)", amount: 195, status: "CHECKED IN" },
                        { id: "BK-9430", guest: "Takahashi Kenji", avatar: "TK", hotel: "Grand Luxe Saigon", room: "Deluxe Suite", dates: "Oct 20 - Oct 25 (5 NIGHTS)", amount: 2100, status: "CANCELLED" },
                      ].map((row) => (
                        <tr key={row.id} className="hover:bg-slate-900/40 transition">
                          <td className="py-4 px-6 font-extrabold text-teal-400">#{row.id}</td>
                          <td className="py-4 px-6 font-bold text-white flex items-center gap-2.5">
                            <span className="h-7 w-7 rounded-full bg-slate-800 text-teal-300 font-bold flex items-center justify-center text-[10px]">
                              {row.avatar}
                            </span>
                            <span>{row.guest}</span>
                          </td>
                          <td className="py-4 px-6 text-slate-300">{row.hotel}</td>
                          <td className="py-4 px-6">
                            <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-bold text-[10px]">
                              {row.room}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-slate-300">{row.dates}</td>
                          <td className="py-4 px-6 font-extrabold text-white">${row.amount.toLocaleString()}.00</td>
                          <td className="py-4 px-6">
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                row.status === "CONFIRMED"
                                  ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                                  : row.status === "CHECKED IN"
                                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                  : row.status === "PENDING"
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                  : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: QUẢN LÝ PHÒNG & DỊCH VỤ ================= */}
          {activeTab === "inventory" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-white">Inventory Management</h1>
                  <p className="text-slate-400 text-xs mt-1">
                    Live overview of room statuses and upcoming availability forecast.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl transition cursor-pointer">
                    <i className="fa-solid fa-filter mr-2"></i>Filter
                  </button>
                  <button className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer shadow-md shadow-teal-500/10">
                    <i className="fa-solid fa-bolt mr-1.5"></i>Quick Status Update
                  </button>
                </div>
              </div>

              {/* Status Summary KPI Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#0F172A] border-l-4 border-l-teal-500 border border-slate-800/80 rounded-2xl p-5">
                  <p className="text-[10px] font-bold uppercase text-slate-400">AVAILABLE</p>
                  <div className="flex items-baseline justify-between mt-2">
                    <h3 className="text-3xl font-black text-white">24</h3>
                    <span className="text-xs font-semibold text-teal-400">+2 from yesterday</span>
                  </div>
                </div>

                <div className="bg-[#0F172A] border-l-4 border-l-blue-500 border border-slate-800/80 rounded-2xl p-5">
                  <p className="text-[10px] font-bold uppercase text-slate-400">OCCUPIED</p>
                  <div className="flex items-baseline justify-between mt-2">
                    <h3 className="text-3xl font-black text-white">58</h3>
                    <span className="text-xs font-semibold text-slate-400">72% Occupancy</span>
                  </div>
                </div>

                <div className="bg-[#0F172A] border-l-4 border-l-rose-500 border border-slate-800/80 rounded-2xl p-5">
                  <p className="text-[10px] font-bold uppercase text-slate-400">DIRTY / IN-REVIEW</p>
                  <div className="flex items-baseline justify-between mt-2">
                    <h3 className="text-3xl font-black text-white">12</h3>
                    <span className="text-xs font-semibold text-rose-400">Needs cleaning</span>
                  </div>
                </div>

                <div className="bg-[#0F172A] border-l-4 border-l-amber-500 border border-slate-800/80 rounded-2xl p-5">
                  <p className="text-[10px] font-bold uppercase text-slate-400">MAINTENANCE</p>
                  <div className="flex items-baseline justify-between mt-2">
                    <h3 className="text-3xl font-black text-white">04</h3>
                    <span className="text-xs font-semibold text-amber-400">Out of order</span>
                  </div>
                </div>
              </div>

              {/* 7-Day Availability Forecast Grid */}
              <div className="bg-[#0F172A] border border-slate-800/80 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <i className="fa-regular fa-calendar-days text-teal-400"></i>
                    7-Day Availability Forecast
                  </h3>
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <span className="h-2.5 w-2.5 rounded-full bg-teal-400"></span>Available
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <span className="h-2.5 w-2.5 rounded-full bg-slate-700"></span>Booked
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>Blocked
                    </span>
                  </div>
                </div>

                {/* Matrix Table */}
                <div className="overflow-x-auto border border-slate-800 rounded-xl">
                  <table className="w-full text-center text-xs border-collapse">
                    <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase font-bold">
                      <tr>
                        <th className="py-3 px-4 text-left border-b border-r border-slate-800 w-40">ROOM TYPE / ID</th>
                        {["Oct 24 Mon", "Oct 25 Tue", "Oct 26 Wed", "Oct 27 Thu", "Oct 28 Fri", "Oct 29 Sat", "Oct 30 Sun"].map((d) => (
                          <th key={d} className="py-3 px-2 border-b border-r border-slate-800">{d}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-semibold">
                      {mockForecastMatrix.map((r, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/30">
                          <td className="py-3 px-4 text-left font-bold text-slate-200 border-r border-slate-800">
                            {r.room}
                          </td>
                          {r.dates.map((st, i) => (
                            <td key={i} className="p-1.5 border-r border-slate-800">
                              <span
                                className={`block py-1 px-2 rounded text-[10px] font-bold ${
                                  st === "AVAIL"
                                    ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                                    : st === "MAINTENANCE"
                                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                    : "bg-slate-800 text-slate-200 border border-slate-700"
                                }`}
                              >
                                {st}
                              </span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Room Cards Grouped by Category */}
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-white text-base">Luxury Suites <span className="text-xs text-slate-400 font-normal ml-2">(8 Units Total)</span></h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {mockInventoryRooms
                      .filter((r) => r.category === "Luxury Suites")
                      .map((room) => (
                        <div key={room.id} className="bg-[#0F172A] border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-xl font-black text-white">{room.roomNumber}</h4>
                              <p className="text-[10px] text-slate-400 font-semibold">{room.type}</p>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                                room.status === "OCCUPIED"
                                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                  : room.status === "AVAILABLE"
                                  ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                                  : room.status === "DIRTY"
                                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              }`}
                            >
                              {room.status}
                            </span>
                          </div>

                          <div className="text-xs font-semibold text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/50">
                            <p className="truncate">{room.guestName}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 4: HỆ THỐNG PHÂN QUYỀN ================= */}
          {activeTab === "users" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-white">Staff & Permissions</h1>
                  <p className="text-slate-400 text-xs mt-1">
                    Manage your team members, roles, and granular access control.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddStaffModalOpen(true)}
                  className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-teal-500/20 transition cursor-pointer"
                >
                  <i className="fa-solid fa-user-plus"></i>
                  <span>+ Add New Staff</span>
                </button>
              </div>

              {/* Security & Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#0B132B] border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center text-lg">
                      <i className="fa-solid fa-shield-halved"></i>
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">System Security</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Encrypted access control</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 mt-4 leading-relaxed">
                    All administrative actions are logged and encrypted. Last security audit: <span className="text-teal-400 font-semibold">2 hours ago</span>.
                  </p>
                </div>

                <div className="bg-[#0F172A] border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between">
                  <p className="text-[10px] font-bold uppercase text-slate-400">TOTAL STAFF</p>
                  <div className="flex items-baseline justify-between mt-2">
                    <h2 className="text-3xl font-black text-white">128</h2>
                    <div className="flex -space-x-2">
                      <span className="inline-block h-7 w-7 rounded-full bg-slate-700 ring-2 ring-slate-900 text-[10px] font-bold flex items-center justify-center text-teal-300">SC</span>
                      <span className="inline-block h-7 w-7 rounded-full bg-slate-800 ring-2 ring-slate-900 text-[10px] font-bold flex items-center justify-center text-rose-300">MW</span>
                      <span className="inline-block h-7 w-7 rounded-full bg-teal-500/30 text-teal-300 ring-2 ring-slate-900 text-[9px] font-bold flex items-center justify-center">+125</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0F172A] border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between">
                  <p className="text-[10px] font-bold uppercase text-slate-400">ACTIVE ROLES</p>
                  <div className="flex items-baseline justify-between mt-2">
                    <h2 className="text-3xl font-black text-white">8</h2>
                    <div className="flex gap-1.5">
                      <span className="px-2 py-0.5 bg-teal-500/20 text-teal-300 rounded font-bold text-[9px]">ADMIN</span>
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded font-bold text-[9px]">MANAGER</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Staff Table */}
              <div className="bg-[#0F172A] border border-slate-800/80 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                  <div className="flex gap-2 text-xs font-semibold">
                    <button className="px-3 py-1.5 bg-teal-500/20 text-teal-300 rounded-lg border border-teal-500/30">All Staff</button>
                    <button className="px-3 py-1.5 hover:bg-slate-800 text-slate-400 rounded-lg">By Branch</button>
                    <button className="px-3 py-1.5 hover:bg-slate-800 text-slate-400 rounded-lg">Active Sessions</button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900/80 text-slate-400 uppercase text-[9px] font-bold tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="py-3.5 px-6">NAME & EMAIL</th>
                        <th className="py-3.5 px-6">ROLE</th>
                        <th className="py-3.5 px-6">BRANCH</th>
                        <th className="py-3.5 px-6">STATUS</th>
                        <th className="py-3.5 px-6 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-semibold">
                      {mockStaffList.map((st) => (
                        <tr key={st.id} className="hover:bg-slate-900/40 transition">
                          <td className="py-4 px-6 flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-full ${st.bg} flex items-center justify-center font-bold text-xs`}>
                              {st.avatar}
                            </div>
                            <div>
                              <p className="font-bold text-white text-xs">{st.name}</p>
                              <p className="text-[10px] text-slate-400">{st.email}</p>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="px-2.5 py-1 rounded text-[9px] font-extrabold bg-slate-800 text-teal-300 border border-slate-700 uppercase">
                              {st.role}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-slate-300">{st.branch}</td>
                          <td className="py-4 px-6">
                            <span className="flex items-center gap-1.5 text-xs text-slate-300">
                              <span className={`h-2 w-2 rounded-full ${st.status === "Online" ? "bg-teal-400" : "bg-slate-600"}`}></span>
                              {st.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button className="text-slate-400 hover:text-white p-1 transition cursor-pointer">
                              <i className="fa-solid fa-ellipsis-vertical"></i>
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
        </main>
      </div>

      {/* Quick Add Booking Modal */}
      {isAddBookingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">+ Quick Add Booking</h3>
              <button onClick={() => setIsAddBookingModalOpen(false)} className="text-slate-400 hover:text-white text-lg cursor-pointer">
                &times;
              </button>
            </div>
            <div className="space-y-3 text-xs font-semibold text-slate-300">
              <div>
                <label className="block text-[10px] uppercase text-slate-400 mb-1 font-bold">Guest Name</label>
                <input type="text" placeholder="John Doe" className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 outline-none text-white" />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-slate-400 mb-1 font-bold">Room Category</label>
                <select className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 outline-none text-white">
                  <option>Deluxe Suite</option>
                  <option>Presidential Suite</option>
                  <option>Standard King</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setIsAddBookingModalOpen(false)} className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs cursor-pointer">
                Cancel
              </button>
              <button onClick={() => { setIsAddBookingModalOpen(false); alert("Booking created successfully!"); }} className="flex-1 py-2 bg-teal-500 text-slate-950 rounded-xl font-bold text-xs cursor-pointer">
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Staff Modal */}
      {isAddStaffModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">+ Add New Staff Member</h3>
              <button onClick={() => setIsAddStaffModalOpen(false)} className="text-slate-400 hover:text-white text-lg cursor-pointer">
                &times;
              </button>
            </div>
            <div className="space-y-3 text-xs font-semibold text-slate-300">
              <div>
                <label className="block text-[10px] uppercase text-slate-400 mb-1 font-bold">Full Name</label>
                <input type="text" placeholder="Sophia Chen" className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 outline-none text-white" />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-slate-400 mb-1 font-bold">Email Address</label>
                <input type="email" placeholder="s.chen@hotelnow.com" className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 outline-none text-white" />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-slate-400 mb-1 font-bold">System Role</label>
                <select className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 outline-none text-white">
                  <option>ADMIN</option>
                  <option>MANAGER</option>
                  <option>RECEPTIONIST</option>
                  <option>SPA STAFF</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setIsAddStaffModalOpen(false)} className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs cursor-pointer">
                Cancel
              </button>
              <button onClick={() => { setIsAddStaffModalOpen(false); alert("Staff member added successfully!"); }} className="flex-1 py-2 bg-teal-500 text-slate-950 rounded-xl font-bold text-xs cursor-pointer">
                Save Staff
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
