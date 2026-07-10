import { useState } from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export function TransfersPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [vehicle, setVehicle] = useState("Sedan");
  const [requests, setRequests] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      alert(`Đăng ký xe đưa đón thành công!\nLoại xe: ${vehicle}\nSố hiệu chuyến bay: ${flightNumber}\nThời gian đón: ${dateTime}\nChúng tôi sẽ điều phối tài xế đón tiễn theo lịch.`);
      setFullName("");
      setEmail("");
      setFlightNumber("");
      setDateTime("");
      setRequests("");
      setIsSubmitting(false);
    }, 1200);
  };

  const fleet = [
    {
      type: "Executive Sedan (4 Chỗ)",
      desc: "Lựa chọn hoàn hảo cho cá nhân hoặc cặp đôi. Nội thất bọc da cao cấp sang trọng, điều hòa tự động và Wi-Fi tốc độ cao miễn phí phục vụ suốt hành trình.",
      passengers: "3 Khách tối đa",
      suitcases: "2 Vali tiêu chuẩn",
      image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=600"
    },
    {
      type: "Premium SUV (7 Chỗ)",
      desc: "Không gian rộng rãi, tiện nghi vượt trội dành cho gia đình hoặc hành lý cồng kềnh. Khả năng vận hành êm ái kết hợp các tính năng an toàn tiên tiến nhất.",
      passengers: "5 Khách tối đa",
      suitcases: "4 Vali tiêu chuẩn",
      image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=600"
    },
    {
      type: "Luxury Van (16 Chỗ)",
      desc: "Giải pháp tối ưu cho đoàn công tác, gia đình lớn hoặc nhóm du khách. Khoang ngồi rộng rãi, ghế da điều chỉnh linh hoạt và trang bị dàn âm thanh cao cấp.",
      passengers: "8-12 Khách",
      suitcases: "10 Vali tiêu chuẩn",
      image: "https://images.unsplash.com/photo-1554223140-896e43e59c6e?q=80&w=600"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 w-full flex-grow flex flex-col gap-12">
          
          {/* Hero Section */}
          <section className="relative h-[420px] rounded-3xl overflow-hidden flex items-center p-8 sm:p-12 text-white bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=1200')" }}>
            <div className="absolute inset-0 bg-black/45"></div>
            
            <div className="relative z-10 max-w-xl">
              <h2 className="text-2xl sm:text-4xl font-extrabold mt-3 mb-4 drop-shadow-md">
                Di Chuyển Đẳng Cấp, Đúng Giờ Tuyệt Đối
              </h2>
              <p className="text-slate-200 text-sm mb-6 font-light leading-relaxed">
                Trải nghiệm tiêu chuẩn vàng trong dịch vụ đưa đón sân bay. Từ nhà ga đến phòng nghỉ, dịch vụ tài xế riêng của chúng tôi đảm bảo hành trình của bạn sang trọng như chính điểm đến.
              </p>
              <div className="flex gap-3">
                <a href="#booking" className="bg-[#007b8a] hover:bg-[#005f6b] text-white transition font-bold px-6 py-2.5 rounded-xl text-xs cursor-pointer">
                  Đặt Tài Xế Ngay
                </a>
                <a href="#fleet" className="border border-white/30 hover:bg-white/10 transition text-white font-bold px-6 py-2.5 rounded-xl text-xs cursor-pointer">
                  Khám Phá Đội Xe
                </a>
              </div>
            </div>

            {/* Float Overlay Box */}
            <div className="hidden sm:flex absolute bottom-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex-col gap-2.5 max-w-xs text-xs text-white">
              <div className="flex items-center gap-2">
                <span className="text-base">🛡️</span>
                <div>
                  <p className="font-bold">Tài Xế Đạt Chuẩn</p>
                  <p className="text-[10px] text-slate-350 font-light">Chuyên nghiệp & được kiểm tra lý lịch</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base">📡</span>
                <div>
                  <p className="font-bold">Theo Dõi Thời Gian Thực</p>
                  <p className="text-[10px] text-slate-350 font-light">Đón tiễn đồng bộ theo giờ bay</p>
                </div>
              </div>
            </div>
          </section>

          {/* A Fleet for Every Occasion */}
          <section id="fleet">
            <div className="text-center mb-10">
              <h3 className="text-xl font-extrabold text-slate-800">Đội Xe Cho Mọi Dịp</h3>
              <p className="text-slate-400 text-xs mt-1">Từ di chuyển cá nhân của doanh nhân đến các chuyến tham quan nhóm, đội xe của chúng tôi đại diện cho đỉnh cao của sự thoải mái và an toàn.</p>
              <div className="h-0.5 w-12 bg-[#007b8a] mx-auto mt-3"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Left: 3 Fleet Cards */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                {fleet.map((f, idx) => (
                  <div key={idx} className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden group flex flex-col sm:flex-row hover:shadow-md transition duration-300">
                    <div className="h-44 sm:h-auto sm:w-48 shrink-0 overflow-hidden">
                      <img src={f.image} alt={f.type} className="w-full h-full object-cover group-hover:scale-102 transition duration-500" />
                    </div>
                    <div className="p-6 flex flex-col justify-center flex-grow">
                      <h4 className="font-bold text-slate-800 text-sm mb-1">{f.type}</h4>
                      <p className="text-slate-500 text-xs leading-relaxed mb-4 font-light">{f.desc}</p>
                      <div className="flex gap-4 text-xs font-semibold text-slate-400">
                        <span className="flex items-center gap-1">👤 {f.passengers}</span>
                        <span className="flex items-center gap-1">💼 {f.suitcases}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right: Driver block */}
              <div className="lg:col-span-4 bg-slate-900 text-white p-8 rounded-2xl flex flex-col justify-center gap-4 relative overflow-hidden shadow-lg border border-slate-800">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl"></div>
                <div className="h-16 w-16 overflow-hidden rounded-full bg-slate-700">
                  <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200" alt="Tài xế chuyên nghiệp" className="w-full h-full object-cover" />
                </div>
                <h4 className="text-base font-bold">Sự Chuyên Nghiệp Vượt Trội</h4>
                <p className="text-slate-400 text-xs leading-relaxed font-light">
                  Đội ngũ tài xế thông thạo nhiều ngoại ngữ, am hiểu sâu sắc các tuyến đường địa phương và được đào tạo bài bản theo tiêu chuẩn dịch vụ concierge cao cấp nhất.
                </p>
                <span className="text-[10px] text-[#64dfdf] font-bold uppercase tracking-wider">Tài Xế Tiêu Chuẩn Concierge</span>
              </div>
            </div>
          </section>

          {/* Features Grid at bottom */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm text-center">
              <div className="h-12 w-12 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center mx-auto mb-4 text-lg">
                ⏱️
              </div>
              <h4 className="font-bold text-slate-800 text-sm mb-2">Đúng Giờ</h4>
              <p className="text-slate-500 text-xs leading-relaxed font-light">
                Chúng tôi theo dõi chuyến bay của bạn theo thời gian thực. Dù chuyến bay đến sớm hay muộn, tài xế luôn có mặt đón tiếp bạn đúng giờ.
              </p>
            </div>

            <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm text-center">
              <div className="h-12 w-12 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center mx-auto mb-4 text-lg">
                👔
              </div>
              <h4 className="font-bold text-slate-800 text-sm mb-2">Tài Xế Chuyên Nghiệp</h4>
              <p className="text-slate-500 text-xs leading-relaxed font-light">
                Chu đáo, kín kẽ và vững tay lái. Đội ngũ tài xế tận tâm luôn ưu tiên sự an toàn và thư thái của quý khách lên hàng đầu.
              </p>
            </div>

            <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm text-center">
              <div className="h-12 w-12 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center mx-auto mb-4 text-lg">
                🎧
              </div>
              <h4 className="font-bold text-slate-800 text-sm mb-2">Phục Vụ 24/7</h4>
              <p className="text-slate-500 text-xs leading-relaxed font-light">
                Dù hạ cánh lúc nửa đêm hay khởi hành vào lúc rạng sáng, đội xe của chúng tôi luôn sẵn sàng hoạt động suốt ngày đêm để phục vụ quý khách.
              </p>
            </div>
          </section>

          {/* Booking Form section */}
          <section id="booking" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Contact info */}
            <div className="lg:col-span-5 flex flex-col gap-6 text-slate-700">
              <h3 className="text-xl font-extrabold text-slate-800">Yêu Cầu Xe Đưa Đón</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm font-light">
                Cung cấp chi tiết hành trình của bạn, và đội ngũ lễ tân của chúng tôi sẽ xác nhận yêu cầu đặt xe đưa đón trong vòng 15 phút.
              </p>

              <div className="flex flex-col gap-4 mt-2">
                <div className="flex gap-3 items-center">
                  <div className="h-10 w-10 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center flex-shrink-0 text-sm">
                    📞
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-800">Đường Dây Nóng</h5>
                    <p className="text-[10px] text-slate-400">+1 (800) LUX-STAY</p>
                  </div>
                </div>

                <div className="flex gap-3 items-center">
                  <div className="h-10 w-10 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center flex-shrink-0 text-sm">
                    ✉️
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-800">Địa chỉ Email</h5>
                    <p className="text-[10px] text-slate-400">concierge@hotelbooking.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Right Card */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xl">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Họ và Tên
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="Nguyễn Văn A"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:border-brand-500 focus:bg-white focus:outline-none transition text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Địa chỉ Email
                    </label>
                    <input 
                      type="email" 
                      required
                      placeholder="nguyenvana@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:border-brand-500 focus:bg-white focus:outline-none transition text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Số Hiệu Chuyến Bay
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ví dụ: VN123"
                      value={flightNumber}
                      onChange={(e) => setFlightNumber(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:border-brand-500 focus:bg-white focus:outline-none transition text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Ngày & Giờ Đến
                    </label>
                    <input 
                      type="datetime-local" 
                      required
                      value={dateTime}
                      onChange={(e) => setDateTime(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:border-brand-500 focus:bg-white focus:outline-none transition text-slate-800 cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Chọn Loại Xe
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {["Sedan", "SUV", "Van"].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setVehicle(v)}
                        className={`p-3 border rounded-xl flex flex-col items-center justify-center gap-1.5 transition text-xs font-semibold cursor-pointer ${
                          vehicle === v 
                            ? "bg-slate-900 border-transparent text-white shadow-md" 
                            : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        <span>{v === "Sedan" ? "🚗" : v === "SUV" ? "🚙" : "🚐"}</span>
                        <span>{v === "Sedan" ? "Sedan 4 chỗ" : v === "SUV" ? "SUV 7 chỗ" : "Van 16 chỗ"}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Yêu Cầu Bổ Sung
                  </label>
                  <textarea 
                    rows={3}
                    placeholder="Ghế trẻ em, nước uống đóng chai thêm, số lượng hành lý lớn..."
                    value={requests}
                    onChange={(e) => setRequests(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs focus:border-brand-500 focus:bg-white focus:outline-none transition text-slate-800"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#007b8a] hover:bg-[#005f6b] text-white font-bold py-3.5 rounded-xl text-xs transition duration-200 cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  ) : (
                    <>Xác Nhận Yêu Cầu Đặt Xe</>
                  )}
                </button>
              </form>
            </div>
          </section>
      </main>

      <Footer />
    </div>
  );
}
