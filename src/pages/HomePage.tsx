import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

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
                placeholder="Bạn muốn đi đâu?"
                value={searchState.city}
                onChange={(e) => setSearchState({ ...searchState, city: e.target.value })}
                className="w-full border-b border-slate-200 py-2 focus:border-brand-500 outline-none text-slate-800 font-medium placeholder-slate-400"
              />
            </div>

            {/* Check-in Date */}
            <div className="w-full md:w-36 text-left relative shrink-0">
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1 flex items-center gap-1.5">
                <i className="fa-regular fa-calendar text-brand-600"></i>
                Nhận phòng
              </label>
              <div className="relative border-b border-slate-200 py-2 min-h-[40px] flex items-center">
                <span className={`text-slate-800 font-medium ${!searchState.checkInDate ? "text-slate-400" : ""}`}>
                  {formatDateDisplay(searchState.checkInDate) || "dd/mm/yyyy"}
                </span>
                <input
                  type="date"
                  value={searchState.checkInDate}
                  onChange={(e) => setSearchState({ ...searchState, checkInDate: e.target.value })}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                />
              </div>
            </div>

            {/* Check-out Date */}
            <div className="w-full md:w-36 text-left relative shrink-0">
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1 flex items-center gap-1.5">
                <i className="fa-regular fa-calendar text-brand-600"></i>
                Trả phòng
              </label>
              <div className="relative border-b border-slate-200 py-2 min-h-[40px] flex items-center">
                <span className={`text-slate-800 font-medium ${!searchState.checkOutDate ? "text-slate-400" : ""}`}>
                  {formatDateDisplay(searchState.checkOutDate) || "dd/mm/yyyy"}
                </span>
                <input
                  type="date"
                  value={searchState.checkOutDate}
                  onChange={(e) => setSearchState({ ...searchState, checkOutDate: e.target.value })}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                />
              </div>
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

      {/* Special Offers */}
      <section className="bg-slate-100/50 py-16 w-full">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Ưu đãi đặc biệt</h2>
            <p className="text-slate-500 mt-1">Tiết kiệm nhiều hơn cho chuyến đi tiếp theo của bạn</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Big Promo Card */}
            <div className="lg:col-span-2 relative rounded-2xl overflow-hidden h-[340px] shadow-md group">
              <img
                src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200"
                alt="Promo 1"
                className="absolute inset-0 h-full w-full object-cover group-hover:scale-101 transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent"></div>
              <div className="absolute inset-y-0 left-0 flex flex-col justify-center px-8 sm:px-12 text-white max-w-lg">
                <span className="bg-brand-500 text-white text-xs uppercase font-bold py-1 px-2.5 rounded-md w-fit mb-3">
                  Giảm tới 20%
                </span>
                <h3 className="text-xl sm:text-2xl font-bold mb-2">Đại hội nghỉ dưỡng nội đô HotelBooking</h3>
                <p className="text-slate-300 text-sm mb-6">
                  Tận hưởng kỳ nghỉ ngắn ngày tại các khách sạn 5 sao ngay trong lòng thành phố với đặc quyền check-in sớm.
                </p>
                <button
                  onClick={() => navigate(ROUTES.HOTELS)}
                  className="bg-white text-slate-800 hover:bg-slate-50 transition px-6 py-2.5 rounded-lg text-sm font-semibold w-fit"
                >
                  Khám phá ngay
                </button>
              </div>
            </div>

            {/* Small Promo Cards Stack */}
            <div className="flex flex-col gap-6">
              {/* Small Promo 1 */}
              <div className="relative rounded-2xl overflow-hidden flex-1 min-h-[158px] shadow-sm group">
                <img
                  src="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=600"
                  alt="Promo 2"
                  className="absolute inset-0 h-full w-full object-cover group-hover:scale-101 transition-all duration-300"
                />
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="absolute inset-0 flex flex-col justify-center p-6 text-white">
                  <h4 className="font-bold text-base mb-1">Ưu đãi App mới</h4>
                  <p className="text-xs text-slate-300 max-w-[240px]">Nhận thêm 10% cho đơn hàng đầu tiên qua ứng dụng di động.</p>
                </div>
              </div>

              {/* Small Promo 2 */}
              <div className="relative rounded-2xl overflow-hidden flex-1 min-h-[158px] shadow-sm group">
                <img
                  src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=600"
                  alt="Promo 3"
                  className="absolute inset-0 h-full w-full object-cover group-hover:scale-101 transition-all duration-300"
                />
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="absolute inset-0 flex flex-col justify-center p-6 text-white">
                  <h4 className="font-bold text-base mb-1">Thẻ hội viên thân thiết</h4>
                  <p className="text-xs text-slate-300 max-w-[240px]">Tích điểm đổi đêm nghỉ miễn phí và quà tặng đặc biệt.</p>
                </div>
              </div>
            </div>
          </div>
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

      {/* Newsletter */}
      <section className="bg-brand-800 text-white py-16 w-full">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Sẵn sàng cho chuyến đi tiếp theo?</h2>
          <p className="text-slate-300 text-sm mb-8">Đăng ký để nhận những thông tin khuyến mãi mới nhất và các ưu đãi bí mật dành riêng cho thành viên.</p>

          <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Địa chỉ email của bạn"
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 outline-none focus:border-brand-500"
            />
            <button
              type="submit"
              onClick={(e) => e.preventDefault()}
              className="bg-brand-500 hover:bg-brand-600 transition px-6 py-3 rounded-xl font-bold shadow-lg"
            >
              Đăng ký ngay
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
