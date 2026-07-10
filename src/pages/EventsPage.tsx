import { useState } from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export function EventsPage() {
  const [fullName, setFullName] = useState("");
  const [organization, setOrganization] = useState("");
  const [email, setEmail] = useState("");
  const [eventType, setEventType] = useState("Hội Nghị");
  const [guests, setGuests] = useState("");
  const [date, setDate] = useState("");
  const [requirements, setRequirements] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      alert(`Gửi yêu cầu tổ chức sự kiện thành công!\nLoại sự kiện: ${eventType}\nSố lượng khách ước tính: ${guests}\nNgày tổ chức dự kiến: ${date}\nĐội ngũ sự kiện của chúng tôi sẽ liên hệ trong vòng 24 giờ.`);
      setFullName("");
      setOrganization("");
      setEmail("");
      setEventType("Hội Nghị");
      setGuests("");
      setDate("");
      setRequirements("");
      setIsSubmitting(false);
    }, 1200);
  };

  const venues = [
    {
      name: "Phòng Đại Tiệc Grand Royal Ballroom",
      desc: "Sức chứa lên tới 1.200 khách, không gian sang trọng và lý tưởng cho các buổi tiệc cuối năm, hội nghị lớn và các hội nghị thượng đỉnh quốc tế. Hệ thống âm thanh ánh sáng tiên tiến.",
      tags: ["Sức chứa 1200 khách", "Trần Cao Thoáng"],
      image: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=600"
    },
    {
      name: "Phòng Họp Executive Suites",
      desc: "Thiết kế tối ưu cho các cuộc họp hội đồng quản trị, hội thảo chuyên đề và các buổi tập huấn chiến lược. Tích hợp đầy đủ các công nghệ họp trực tuyến chất lượng cao.",
      tags: ["Công Nghệ Thông Minh", "Cách Âm Tuyệt Đối"],
      image: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?q=80&w=600"
    },
    {
      name: "Sân Thượng Skyline Terrace",
      desc: "Không gian ngoài trời ấn tượng với góc nhìn toàn cảnh thành phố rực rỡ. Phù hợp cho các buổi tiệc cocktail tối lãng mạn, sự kiện ra mắt hoặc các buổi giao lưu thân mật.",
      tags: ["Không Gian Mở", "Tầm Nhìn Toàn Cảnh"],
      image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=600"
    }
  ];

  const expertises = [
    {
      title: "Lập Kế Hoạch Sự Kiện Chuyên Nghiệp",
      desc: "Một đầu mối liên hệ duy nhất hỗ trợ quản lý mọi chi tiết hậu cần từ khi bắt đầu lập kế hoạch đến khi kết thúc sự kiện, đảm bảo sự an tâm tuyệt đối.",
      icon: "📋"
    },
    {
      title: "Dịch Vụ Tiệc Cao Cấp",
      desc: "Thực đơn tiệc có thể tùy chỉnh linh hoạt do các đầu bếp đạt giải thưởng thiết kế để phù hợp với nhiều khẩu vị, chủ đề và chế độ ăn uống của khách.",
      icon: "🍽️"
    },
    {
      title: "Thiết Bị Âm Thanh Ánh Sáng & Kỹ Thuật Tiên Tiến",
      desc: "Hệ thống kết nối cáp quang tốc độ cao, hỗ trợ kỹ thuật trực tiếp suốt thời gian diễn ra sự kiện và sẵn sàng cho các cuộc họp trực tiếp kết hợp trực tuyến.",
      icon: "⚡"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 w-full flex-grow flex flex-col gap-12">
          
          {/* Hero Section */}
          <section className="relative h-[420px] rounded-3xl overflow-hidden flex items-center p-8 sm:p-12 text-white bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200')" }}>
            <div className="absolute inset-0 bg-black/50"></div>
            
            <div className="relative z-10 max-w-xl">
              <h2 className="text-2xl sm:text-4xl font-extrabold mt-3 mb-4 drop-shadow-md">
                Nơi Những Ý Tưởng Lớn Tỏa Sáng
              </h2>
              <p className="text-slate-200 text-sm mb-6 font-light leading-relaxed">
                Tổ chức các hội nghị danh giá và các lễ kỷ niệm khó quên tại những địa điểm nổi bật nhất thành phố. Sự chuyên nghiệp xuất sắc kết hợp sự sang trọng tuyệt đối.
              </p>
              <div className="flex gap-3">
                <a href="#booking" className="bg-[#007b8a] hover:bg-[#005f6b] text-white transition font-bold px-6 py-2.5 rounded-xl text-xs cursor-pointer">
                  Gửi Yêu Cầu Ngay
                </a>
                <a href="#venues" className="border border-white/30 hover:bg-white/10 transition text-white font-bold px-6 py-2.5 rounded-xl text-xs cursor-pointer">
                  Xem Không Gian
                </a>
              </div>
            </div>
          </section>

          {/* Distinguished Spaces */}
          <section id="venues">
            <div className="mb-8 border-b border-slate-100 pb-4">
              <span className="text-[10px] font-bold text-[#007b8a] uppercase tracking-wider">KHÔNG GIAN CỦA CHÚNG TÔI</span>
              <h3 className="text-xl font-extrabold text-slate-800 mt-1">Không Gian Riêng Biệt Cho Mọi Dịp</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {venues.map((v, idx) => (
                <div key={idx} className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden group flex flex-col hover:shadow-md transition duration-300">
                  <div className="h-48 overflow-hidden relative">
                    <img src={v.image} alt={v.name} className="w-full h-full object-cover group-hover:scale-102 transition duration-500" />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      {v.tags.map((t, i) => (
                        <span key={i} className="bg-[#0b1528] text-white text-[9px] font-semibold py-0.5 px-2 rounded-md">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h4 className="font-bold text-slate-800 text-sm mb-2">{v.name}</h4>
                    <p className="text-slate-500 text-xs leading-relaxed mb-6 flex-grow font-light">{v.desc}</p>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold">Địa Điểm Cao Cấp</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Seamless Execution (Our Expertise) */}
          <section className="bg-slate-900 text-white p-8 sm:p-12 rounded-3xl relative overflow-hidden">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-5">
                <span className="text-[9px] text-[#64dfdf] font-bold uppercase tracking-wider">CHUYÊN MÔN CỦA CHÚNG TÔI</span>
                <h3 className="text-2xl font-extrabold text-white mt-1.5 mb-4">Tổ Chức Chuyên Nghiệp Cho Sự Kiện Hoàn Hảo</h3>
                <p className="text-slate-400 text-xs leading-relaxed max-w-sm font-light">
                  Chúng tôi chăm chút từng chi tiết để bạn tập trung vào việc tạo dấu ấn. Hãy tin tưởng các chuyên gia của chúng tôi để mang lại sự kiện vượt trội sự mong đợi.
                </p>
              </div>

              <div className="lg:col-span-7 flex flex-col gap-5">
                {expertises.map((exp, idx) => (
                  <div key={idx} className="bg-slate-800/40 border border-slate-800 rounded-2xl p-4 flex gap-4">
                    <div className="h-10 w-10 bg-slate-800 text-white rounded-xl flex items-center justify-center flex-shrink-0 text-sm">
                      {exp.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-100">{exp.title}</h4>
                      <p className="text-slate-400 text-xs leading-normal mt-1 font-light">{exp.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Booking Inquiry Form section */}
          <section id="booking" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Contact Info */}
            <div className="lg:col-span-5 flex flex-col gap-6 text-slate-700">
              <h3 className="text-xl font-extrabold text-slate-800">Cùng Nhau Tạo Nên Sự Hoàn Hảo</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm font-light">
                Cung cấp thông tin sự kiện của bạn, và đội ngũ sự kiện chuyên nghiệp của chúng tôi sẽ liên hệ trong vòng 24 giờ với đề xuất phù hợp nhất.
              </p>

              <div className="flex flex-col gap-4 mt-2">
                <div className="flex gap-3 items-center">
                  <div className="h-10 w-10 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center flex-shrink-0 text-sm">
                    📞
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-800">Hotline Sự Kiện</h5>
                    <p className="text-[10px] text-slate-400">+1 (800) HB-STAY</p>
                  </div>
                </div>

                <div className="flex gap-3 items-center">
                  <div className="h-10 w-10 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center flex-shrink-0 text-sm">
                    ✉️
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-800">Địa chỉ Email</h5>
                    <p className="text-[10px] text-slate-400">events@hotelbooking.com</p>
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
                      Tên Tổ Chức / Công Ty
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="Công ty TNHH Sự Kiện ABC"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:border-brand-500 focus:bg-white focus:outline-none transition text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Địa chỉ Email
                    </label>
                    <input 
                      type="email" 
                      required
                      placeholder="nguyenvana@congty.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:border-brand-500 focus:bg-white focus:outline-none transition text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Loại Sự Kiện
                    </label>
                    <select 
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:border-brand-500 focus:bg-white focus:outline-none transition text-slate-800 cursor-pointer"
                    >
                      <option value="Hội Nghị">Hội Nghị</option>
                      <option value="Hội Thảo">Hội Thảo</option>
                      <option value="Tiệc Dạ Hội">Tiệc Dạ Hội</option>
                      <option value="Tiệc Cưới">Tiệc Cưới</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Số Lượng Khách Dự Kiến
                    </label>
                    <input 
                      type="number" 
                      required
                      min={10}
                      placeholder="50"
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:border-brand-500 focus:bg-white focus:outline-none transition text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Ngày Tổ Chức Dự Kiến
                    </label>
                    <input 
                      type="date" 
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:border-brand-500 focus:bg-white focus:outline-none transition text-slate-800 cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Yêu Cầu Bổ Sung
                  </label>
                  <textarea 
                    rows={3}
                    placeholder="Hãy cho chúng tôi biết về tầm nhìn hoặc mong muốn của bạn..."
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
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
                    <>Gửi Yêu Cầu Tư Vấn</>
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
