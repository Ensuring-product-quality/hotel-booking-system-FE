import { useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ROUTES } from "../constants/routes";

interface OfferCard {
  id: number;
  discount: string;
  tag: string;
  location: string;
  title: string;
  description: string;
  expiryDate: string;
  image: string;
}

export function OffersPage() {
  const navigate = useNavigate();

  const offers: OfferCard[] = [
    {
      id: 1,
      discount: "-20%",
      tag: "Phổ biến",
      location: "Đà Nẵng & Hội An",
      title: "Kỳ nghỉ Thu lãng mạn tại Phố Cổ",
      description: "Tặng kèm bữa tối ánh nến bên sông Hoài và liệu trình Spa 60 phút cho cặp đôi. Trải nghiệm dịch vụ đẳng cấp chuẩn resort 5 sao.",
      expiryDate: "31/12/2024",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600"
    },
    {
      id: 2,
      discount: "Đặc quyền",
      tag: "Mới",
      location: "Sapa & Hà Giang",
      title: "Săn mây đại ngàn - Ưu đãi nhóm",
      description: "Đặt 3 phòng tặng 1 phòng. Miễn phí nâng hạng phòng Suite hướng thung lũng thơ mộng và tặng bữa ăn đặc sản Tây Bắc.",
      expiryDate: "15/11/2024",
      image: "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?q=80&w=600"
    },
    {
      id: 3,
      discount: "-15%",
      tag: "Early Bird",
      location: "Phú Quốc & Quy Nhơn",
      title: "Early Bird: Đặt sớm nhận ưu đãi",
      description: "Lên kế hoạch trước 30 ngày để nhận ưu đãi 15% cùng buffet sáng cao cấp hàng ngày. Tự do thay đổi lịch trình không tính phí.",
      expiryDate: "Dài hạn",
      image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=600"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[480px] flex items-center justify-center text-center bg-cover bg-center overflow-hidden" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1920')" }}>
        <div className="absolute inset-0 bg-black/45"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-white">
          <span className="inline-flex items-center gap-1 bg-brand-500/90 text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full mb-4">
            ⭐ ƯU ĐÃI ĐỘC QUYỀN
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 drop-shadow-md">
            Giảm 30% cho kỳ nghỉ hè mơ ước
          </h1>
          <p className="text-base sm:text-lg text-slate-200 mb-8 max-w-2xl mx-auto drop-shadow-sm font-light leading-relaxed">
            Tận hưởng kỳ nghỉ sang trọng tại các resort ven biển đẳng cấp nhất với mức giá chưa từng có. Áp dụng cho các booking từ 3 đêm trở lên.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate(ROUTES.HOTELS)}
              className="bg-brand-600 hover:bg-brand-700 text-white transition font-bold px-8 py-3 rounded-xl shadow-lg cursor-pointer"
            >
              Đặt Ngay
            </button>
            <a 
              href="#list-offers"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/30 transition font-bold px-8 py-3 rounded-xl backdrop-blur-sm flex items-center justify-center cursor-pointer"
            >
              Chi tiết ưu đãi
            </a>
          </div>
        </div>
      </section>

      {/* Filter / Search Bar Overlay */}
      <div className="max-w-6xl mx-auto w-full px-4 -mt-10 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100 flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full md:flex-grow">
            <div className="flex flex-col gap-1 border-b md:border-b-0 md:border-r border-slate-100 pb-3 md:pb-0 pr-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                🌍 Địa điểm
              </span>
              <span className="text-sm font-semibold text-slate-800">Tất cả điểm đến</span>
            </div>
            
            <div className="flex flex-col gap-1 border-b md:border-b-0 md:border-r border-slate-100 pb-3 md:pb-0 pr-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                📅 Thời hạn
              </span>
              <span className="text-sm font-semibold text-slate-800">Đang diễn ra</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                🏨 Loại hình
              </span>
              <span className="text-sm font-semibold text-slate-800">Resort & Spa</span>
            </div>
          </div>

          <button className="p-3.5 bg-[#0b1528] text-white hover:bg-brand-600 rounded-xl transition duration-200 cursor-pointer shadow-md flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main content */}
      <main id="list-offers" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 w-full flex-grow">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800">Các chương trình hiện có</h2>
            <p className="text-slate-400 text-sm mt-1">Cập nhật những ưu đãi hấp dẫn nhất cho kỳ nghỉ của bạn</p>
          </div>
          <button 
            onClick={() => navigate(ROUTES.HOTELS)}
            className="text-brand-600 hover:text-brand-700 text-sm font-bold flex items-center gap-1 cursor-pointer transition"
          >
            Xem tất cả ➔
          </button>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {offers.map((offer) => (
            <div key={offer.id} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition duration-300 flex flex-col group">
              <div className="h-52 overflow-hidden relative">
                <img 
                  src={offer.image} 
                  alt={offer.title} 
                  className="w-full h-full object-cover group-hover:scale-102 transition duration-500"
                />
                <span className="absolute top-4 left-4 bg-rose-500 text-white text-xs font-bold py-1 px-3 rounded-lg shadow-md">
                  {offer.discount}
                </span>
                <span className="absolute top-4 right-4 bg-slate-900/60 backdrop-blur-sm text-white text-[10px] font-semibold py-0.5 px-2 rounded-full uppercase tracking-wider">
                  {offer.tag}
                </span>
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider flex items-center gap-1 mb-2">
                  📍 {offer.location}
                </span>
                <h3 className="text-lg font-bold text-slate-800 leading-tight mb-2 group-hover:text-brand-600 transition">
                  {offer.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6 flex-grow">
                  {offer.description}
                </p>

                <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs mt-auto">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Thời hạn</span>
                    <span className="font-semibold text-slate-700">{offer.expiryDate}</span>
                  </div>
                  <button 
                    onClick={() => navigate(`/offers/${offer.id}`)}
                    className="bg-brand-50 hover:bg-brand-600 text-brand-600 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition duration-200 cursor-pointer"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Subscription section */}
        <section className="mt-20 bg-gradient-to-br from-[#0b1528] to-[#162744] text-white p-8 sm:p-12 rounded-3xl text-center shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <h3 className="text-xl sm:text-3xl font-extrabold mb-3">Bạn chưa tìm thấy ưu đãi phù hợp?</h3>
            <p className="text-slate-300 text-sm mb-8 leading-relaxed">
              Đăng ký thành viên <span className="font-bold text-brand-400">HotelBooking Club</span> để nhận ngay thông báo về các chương trình bí mật dành riêng cho bạn.
            </p>

            <form onSubmit={(e) => { e.preventDefault(); alert("Đăng ký thành công! Chào mừng bạn đến với HotelBooking Club."); }} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <input 
                type="email" 
                required
                placeholder="Email của bạn"
                className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-brand-500 focus:outline-none placeholder-slate-500 text-white"
              />
              <button 
                type="submit"
                className="bg-brand-600 hover:bg-brand-700 transition px-6 py-3 rounded-xl text-sm font-bold shadow-lg cursor-pointer"
              >
                Tham gia ngay
              </button>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
