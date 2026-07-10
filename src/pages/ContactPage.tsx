import { useState } from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export function ContactPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("Hỗ trợ đặt phòng");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      alert("Gửi tin nhắn liên hệ thành công! Đội ngũ chăm sóc khách hàng sẽ phản hồi bạn sớm nhất.");
      setFullName("");
      setEmail("");
      setMessage("");
      setIsSubmitting(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      {/* Banner Header Image */}
      <section className="relative h-80 flex items-center justify-center text-center bg-cover bg-center overflow-hidden" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1920')" }}>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-white">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2 drop-shadow-md">
            Kết nối với HotelBooking
          </h1>
          <p className="text-sm sm:text-base text-slate-200 drop-shadow-sm font-light max-w-xl mx-auto leading-relaxed">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn trong mọi hành trình trải nghiệm dịch vụ lưu trú cao cấp.
          </p>
        </div>
      </section>

      {/* Main Content Layout Grid */}
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 w-full flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Contact Cards */}
          <div className="lg:col-span-6 flex flex-col gap-6 text-slate-700">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800">Thông tin liên hệ</h2>
              <p className="text-slate-400 text-sm mt-2 max-w-md leading-relaxed">
                Đội ngũ chăm sóc khách hàng của HotelBooking hoạt động 24/7 để đảm bảo kỳ nghỉ của bạn luôn hoàn hảo.
              </p>
            </div>

            <div className="flex flex-col gap-4 mt-2">
              {/* Card 1 - Phone */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4 hover:shadow-md transition">
                <div className="h-10 w-10 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center flex-shrink-0 text-sm">
                  📞
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hotline hỗ trợ</h4>
                  <p className="text-base font-extrabold text-slate-800 mt-0.5">1900 6789</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Phục vụ 24/7 cho các yêu cầu khẩn cấp</p>
                </div>
              </div>

              {/* Card 2 - Mail */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4 hover:shadow-md transition">
                <div className="h-10 w-10 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center flex-shrink-0 text-sm">
                  ✉️
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email liên hệ</h4>
                  <p className="text-base font-extrabold text-slate-800 mt-0.5">care@hotelbooking.premium</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Phản hồi trong vòng 24 giờ làm việc</p>
                </div>
              </div>

              {/* Card 3 - Address */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4 hover:shadow-md transition">
                <div className="h-10 w-10 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center flex-shrink-0 text-sm">
                  📍
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trụ sở chính</h4>
                  <p className="text-sm font-extrabold text-slate-800 mt-0.5">Tòa nhà Diamond Plaza</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">34 Lê Duẩn, Phường Bến Nghé, Quận 1, TP. HCM</p>
                </div>
              </div>
            </div>

            {/* Follow Us */}
            <div className="mt-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Theo dõi chúng tôi</span>
              <div className="flex gap-3 mt-3">
                <button className="h-9 w-9 bg-white hover:bg-brand-600 border border-slate-200 text-slate-600 hover:text-white rounded-xl shadow-sm transition flex items-center justify-center text-sm cursor-pointer">
                  📘
                </button>
                <button className="h-9 w-9 bg-white hover:bg-brand-600 border border-slate-200 text-slate-600 hover:text-white rounded-xl shadow-sm transition flex items-center justify-center text-sm cursor-pointer">
                  📸
                </button>
                <button className="h-9 w-9 bg-white hover:bg-brand-600 border border-slate-200 text-slate-600 hover:text-white rounded-xl shadow-sm transition flex items-center justify-center text-sm cursor-pointer">
                  🐦
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Message Form */}
          <div className="lg:col-span-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl">
              <h3 className="text-lg font-bold text-slate-800">Gửi lời nhắn cho chúng tôi</h3>
              <p className="text-xs text-slate-400 mt-1 mb-6">Chúng tôi sẽ liên lạc lại trong thời gian sớm nhất</p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Họ và tên
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
                      placeholder="example@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:border-brand-500 focus:bg-white focus:outline-none transition text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Chủ đề
                  </label>
                  <select 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:border-brand-500 focus:bg-white focus:outline-none transition text-slate-850 cursor-pointer"
                  >
                    <option value="Hỗ trợ đặt phòng">Hỗ trợ đặt phòng</option>
                    <option value="Góp ý dịch vụ">Góp ý dịch vụ</option>
                    <option value="Hợp tác phát triển">Hợp tác kinh doanh</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Nội dung tin nhắn
                  </label>
                  <textarea 
                    rows={4}
                    required
                    placeholder="Bạn cần hỗ trợ gì?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs focus:border-brand-500 focus:bg-white focus:outline-none transition text-slate-800"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl text-xs transition duration-200 cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  ) : (
                    <>Gửi yêu cầu ngay</>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Map visual section */}
        <section className="mt-20 relative rounded-3xl overflow-hidden shadow-lg border border-slate-100 h-96">
          <img 
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200" // map aesthetic look
            alt="Office Location Map" 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-[#0b1528]/10"></div>
          
          <div className="absolute bottom-6 left-6 max-w-sm bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
            <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">Văn phòng tại TP. HCM</span>
            <p className="text-xs font-semibold text-slate-800 mt-1">34 Lê Duẩn, Quận 1. Đón tiếp khách hàng từ 8:00 - 18:00 mỗi ngày.</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
