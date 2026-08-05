import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../constants/routes";

interface SearchFormState {
  city: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
}

export function HomePage() {
  const navigate = useNavigate();
  const [searchState, setSearchState] = useState<SearchFormState>({
    city: "",
    checkInDate: "",
    checkOutDate: "",
    guests: 1,
  });

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

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

  const formatDateStr = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const isDateInPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleDayClick = (date: Date) => {
    if (isDateInPast(date)) return;
    const dateStr = formatDateStr(date);

    if (!searchState.checkInDate || (searchState.checkInDate && searchState.checkOutDate)) {
      setSearchState((prev) => ({
        ...prev,
        checkInDate: dateStr,
        checkOutDate: "",
      }));
    } else {
      if (dateStr <= searchState.checkInDate) {
        setSearchState((prev) => ({
          ...prev,
          checkInDate: dateStr,
        }));
      } else {
        setSearchState((prev) => ({
          ...prev,
          checkOutDate: dateStr,
        }));
        setIsDatePickerOpen(false);
      }
    }
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    if (!year || !month || !day) return dateStr;
    return `${day}/${month}/${year}`;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchState.city) params.append("city", searchState.city);
    if (searchState.checkInDate) params.append("checkInDate", searchState.checkInDate);
    if (searchState.checkOutDate) params.append("checkOutDate", searchState.checkOutDate);
    params.append("guests", searchState.guests.toString());
    navigate(`${ROUTES.HOTELS}?${params.toString()}`);
  };

  const handleCitySearch = (city: string) => {
    navigate(`${ROUTES.HOTELS}?city=${encodeURIComponent(city)}`);
  };

  return (
    <div className="flex flex-col">

      {/* Hero Section */}
      <section className="relative h-[560px] flex items-center justify-center text-center bg-cover bg-center overflow-hidden" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1920')" }}>
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40"></div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 text-white">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4 drop-shadow-md">
            Khám phá thế giới, trải nghiệm đẳng cấp
          </h1>
          <p className="text-base sm:text-xl text-slate-200 mb-8 max-w-2xl mx-auto drop-shadow-sm font-light">
            Hàng ngàn khách sạn và biệt thự sang trọng đang chờ đón bạn cho những kỳ nghỉ đáng nhớ
          </p>

          {/* Search Box */}
          <form
            onSubmit={handleSearch}
            className="w-full bg-white text-slate-700 rounded-2xl shadow-2xl p-4 sm:p-6 flex flex-col md:flex-row gap-4 items-end"
          >
            {/* Destination */}
            <div className="w-full md:flex-1 text-left">
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1 flex items-center gap-1.5">
                <i className="fa-solid fa-location-dot text-brand-600"></i>
                Điểm đến
              </label>
              <input
                type="text"
                placeholder="Thành phố, địa điểm hoặc tên khách sạn"
                value={searchState.city}
                onChange={(e) => setSearchState({ ...searchState, city: e.target.value })}
                className="w-full border-b border-slate-200 py-2 focus:border-brand-500 outline-none text-slate-800 font-medium placeholder-slate-400"
              />
            </div>

            {/* Combined Check-in / Check-out Dates */}
            <div className="w-full md:w-80 text-left relative shrink-0">
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1 flex items-center gap-1.5">
                <i className="fa-regular fa-calendar text-brand-600"></i>
                Thời gian lưu trú
              </label>
              <div
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                className="w-full border-b border-slate-200 py-2 flex items-center justify-between text-slate-800 font-medium cursor-pointer min-h-[40px]"
              >
                <div className="flex-1">
                  <span className={!searchState.checkInDate ? "text-slate-400" : ""}>
                    {searchState.checkInDate ? formatDateDisplay(searchState.checkInDate) : "Nhận phòng"}
                  </span>
                </div>
                <span className="text-slate-400 text-xs px-2">&rarr;</span>
                <div className="flex-1 text-right">
                  <span className={!searchState.checkOutDate ? "text-slate-400" : ""}>
                    {searchState.checkOutDate ? formatDateDisplay(searchState.checkOutDate) : "Trả phòng"}
                  </span>
                </div>
              </div>

              {/* Custom Date Picker Dropdown */}
              {isDatePickerOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => setIsDatePickerOpen(false)}
                  />
                  <div className="absolute left-0 md:left-auto md:right-0 top-14 z-50 w-80 bg-white border border-slate-100 rounded-2xl shadow-2xl p-4 flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                      <button
                        type="button"
                        onClick={handlePrevMonth}
                        className="p-1 px-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg transition"
                      >
                        &larr;
                      </button>
                      <span>
                        Tháng {currentMonth + 1} / {currentYear}
                      </span>
                      <button
                        type="button"
                        onClick={handleNextMonth}
                        className="p-1 px-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg transition"
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
                        const isSelectedCheckIn = searchState.checkInDate === dateStr;
                        const isSelectedCheckOut = searchState.checkOutDate === dateStr;
                        const isWithinRange =
                          searchState.checkInDate &&
                          searchState.checkOutDate &&
                          dateStr > searchState.checkInDate &&
                          dateStr < searchState.checkOutDate;

                        let btnClass = "h-8 w-8 text-xs font-semibold rounded-lg flex items-center justify-center transition ";

                        if (isPast) {
                          btnClass += "text-slate-300 bg-transparent cursor-not-allowed";
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
                            disabled={isPast}
                            onClick={() => handleDayClick(date)}
                            className={btnClass}
                            title={isPast ? "Ngày trong quá khứ" : date.getDate().toString()}
                          >
                            {date.getDate()}
                          </button>
                        );
                      })}
                    </div>

                    {/* Summary */}
                    <div className="flex justify-between items-center text-[10px] font-medium text-slate-500 border-t border-slate-100 pt-2.5 mt-1">
                      <div>
                        <span>Nhận: </span>
                        <span className="font-bold text-slate-700">
                          {searchState.checkInDate ? formatDateDisplay(searchState.checkInDate) : "Chưa chọn"}
                        </span>
                      </div>
                      <div>
                        <span>Trả: </span>
                        <span className="font-bold text-slate-700">
                          {searchState.checkOutDate ? formatDateDisplay(searchState.checkOutDate) : "Chưa chọn"}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Guests */}
            <div className="w-full md:w-20 text-left shrink-0">
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1 flex items-center gap-1.5">
                <i className="fa-solid fa-user-group text-brand-600"></i>
                Khách
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={searchState.guests}
                onChange={(e) => setSearchState({ ...searchState, guests: parseInt(e.target.value) || 1 })}
                className="w-full border-b border-slate-200 py-2 focus:border-brand-500 outline-none text-slate-800 font-medium"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full md:w-auto px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition hover:scale-[1.01] shadow-lg shadow-brand-600/10 cursor-pointer shrink-0"
            >
              <i className="fa-solid fa-magnifying-glass"></i>
              <span>Tìm kiếm</span>
            </button>
          </form>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 w-full">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Điểm đến phổ biến</h2>
            <p className="text-slate-500 mt-1">Gợi ý những nơi tuyệt vời nhất cho kỳ nghỉ của bạn</p>
          </div>
          <button
            onClick={() => navigate(ROUTES.HOTELS)}
            className="text-brand-600 hover:text-brand-700 font-semibold text-sm flex items-center gap-1 transition"
          >
            Xem tất cả &rarr;
          </button>
        </div>

        {/* Destination Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: "Hội An", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=600", rating: "4.9", count: "Hơn 1,200 khách sạn" },
            { name: "Vịnh Hạ Long", image: "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=600", rating: "4.8", count: "Hơn 850 khách sạn" },
            { name: "Đà Lạt", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600", rating: "4.7", count: "Hơn 2,000 khách sạn" },
            { name: "Đà Nẵng", image: "https://images.unsplash.com/photo-1559592482-b288b8fc4a2f?q=80&w=600", rating: "4.9", count: "Hơn 1,500 khách sạn" },
          ].map((dest, i) => (
            <div
              key={i}
              onClick={() => handleCitySearch(dest.name)}
              className="group relative h-80 rounded-2xl overflow-hidden shadow-md cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Image */}
              <img
                src={dest.image}
                alt={dest.name}
                className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-all duration-500"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600";
                }}
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent"></div>

              {/* Rating badge */}
              <div className="absolute top-4 left-4 flex items-center gap-1 bg-white/95 text-slate-800 py-1 px-2.5 rounded-full text-xs font-bold shadow-sm">
                <i className="fa-solid fa-star text-amber-500 text-[10px]"></i>
                {dest.rating}
              </div>

              {/* Text */}
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-bold">{dest.name}</h3>
                <p className="text-slate-300 text-xs mt-0.5">{dest.count}</p>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* Why Choose Us */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Images Grid */}
        <div className="grid grid-cols-2 gap-4">
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600"
            alt="Hotel Lobby"
            className="rounded-2xl shadow-md h-60 w-full object-cover mt-8"
          />
          <img
            src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=600"
            alt="Hotel Pool"
            className="rounded-2xl shadow-md h-60 w-full object-cover"
          />
        </div>

        {/* Text */}
        <div className="flex flex-col gap-6 text-slate-700">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Tại sao chọn HotelBooking?</h2>

          <div className="flex gap-4">
            <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <i className="fa-solid fa-shield-halved text-lg"></i>
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">Đảm bảo giá tốt nhất</h3>
              <p className="text-slate-500 text-sm mt-1">Chúng tôi cam kết mang lại mức giá cạnh tranh nhất cho mọi điểm đến bạn chọn.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <i className="fa-solid fa-headset text-lg"></i>
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">Hỗ trợ 24/7 chuyên nghiệp</h3>
              <p className="text-slate-500 text-sm mt-1">Đội ngũ hỗ trợ luôn sẵn sàng giúp đỡ bạn trong suốt hành trình, bất kể thời gian nào.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <i className="fa-solid fa-clipboard-check text-lg"></i>
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">Tuyển chọn nghiêm ngặt</h3>
              <p className="text-slate-500 text-sm mt-1">Tất cả khách sạn trên HotelBooking đều được kiểm tra chất lượng định kỳ để đảm bảo tiêu chuẩn cao nhất.</p>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
}
