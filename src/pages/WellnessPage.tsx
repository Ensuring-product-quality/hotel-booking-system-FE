import { useState } from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export function WellnessPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("Massage Đặc Trưng");
  const [dateTime, setDateTime] = useState("");
  const [requests, setRequests] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      alert(`Đăng ký cuộc hẹn Spa thành công!\nLoại dịch vụ: ${category}\nChúng tôi sẽ liên hệ xác nhận trong vòng 2 giờ.`);
      setFullName("");
      setEmail("");
      setDateTime("");
      setRequests("");
      setIsSubmitting(false);
    }, 1200);
  };

  const journeys = [
    {
      title: "Massage Đặc Trưng",
      desc: "Từ phục hồi mô sâu đến trị liệu Thụy Điển hương thơm, được thiết kế riêng cho nhu cầu cơ thể của bạn.",
      tags: ["Mô Sâu", "Đá Nóng", "Hương Thảo Dược"],
      image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=600"
    },
    {
      title: "Chăm Sóc Da Mặt Chuyên Sâu",
      desc: "Các liệu trình nâng cơ và làm sáng da sử dụng công nghệ khoa học chăm sóc da tiên tiến mang lại vẻ ngoài rạng rỡ.",
      image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=600"
    },
    {
      title: "Trị Liệu Toàn Thân",
      desc: "Ủ thải độc và tẩy tế bào chết bằng muối biển hữu cơ để tái tạo và phục hồi độ ẩm cho làn da.",
      image: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?q=80&w=600"
    },
    {
      title: "Liệu Trình Thủy Trị Liệu",
      desc: "Nghi thức tắm đối chiếu nhiệt, xông hơi thiết kế để tăng cường hệ miễn dịch và giảm căng thẳng cơ bắp.",
      tags: ["Đặc quyền khách lưu trú"],
      image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=600"
    }
  ];

  const experts = [
    {
      name: "Tiến sĩ Elena Vance",
      role: "CHUYÊN GIA NẮN XƯƠNG TRƯỞNG",
      desc: "Chuyên về điều chỉnh cấu trúc xương khớp và giảm đau mãn tính với hơn 15 năm kinh nghiệm làm việc tại London và Bali.",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=300"
    },
    {
      name: "Chuyên gia Julian Mercer",
      role: "TRỊ LIỆU VIÊN TRƯỞNG",
      desc: "Chuyên gia hàng đầu về các phương pháp chữa lành phương Đông, đồng bộ mô sâu và phục hồi sức khỏe toàn diện.",
      image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=300"
    },
    {
      name: "Chuyên gia Sarah Chen",
      role: "CHUYÊN GIA CHĂM SÓC DA",
      desc: "Chuyên viên thẩm mỹ cao cấp chuyên sâu về trẻ hóa da không xâm lấn, sức khỏe tế bào và trị liệu cá nhân hóa.",
      image: "https://images.unsplash.com/photo-1594824813573-246434de83fb?q=80&w=300"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 w-full flex-grow flex flex-col gap-12">
          
          {/* Hero Banner Section */}
          <section className="relative h-[420px] rounded-3xl overflow-hidden flex items-center p-8 sm:p-12 text-white bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519699047748-de8e457a634e?q=80&w=1200')" }}>
            <div className="absolute inset-0 bg-black/45"></div>
            
            <div className="relative z-10 max-w-xl">
              <span className="bg-emerald-500/80 text-white text-[10px] font-bold uppercase tracking-wider py-1 px-2.5 rounded-md">
                NGHỆ THUẬT CỦA SỰ THƯ THÁI
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold mt-3 mb-4 drop-shadow-md">
                Đánh Thức Giác Quan Trong Sự Sang Trọng Tuyệt Đối
              </h2>
              <p className="text-slate-200 text-sm mb-6 font-light leading-relaxed">
                Thoát khỏi nhịp sống hối hả thường nhật. Trải nghiệm hành trình phục hồi sức khỏe đặc trưng của chúng tôi được thiết kế để cân bằng tâm trí, cơ thể và tinh thần thông qua các nghi thức cổ xưa và chuyên môn hiện đại.
              </p>
              <div className="flex gap-3">
                <a href="#booking" className="bg-[#64dfdf] hover:bg-[#48cae4] text-slate-900 transition font-bold px-6 py-2.5 rounded-xl text-xs cursor-pointer">
                  Đặt Lịch Trị Liệu
                </a>
                <a href="#journeys" className="border border-white/30 hover:bg-white/10 transition text-white font-bold px-6 py-2.5 rounded-xl text-xs cursor-pointer">
                  Khám Phá Dịch Vụ
                </a>
              </div>
            </div>
          </section>

          {/* Your Wellness Journey */}
          <section id="journeys">
            <div className="text-center mb-10">
              <h3 className="text-2xl font-extrabold text-slate-800">Hành Trình Chăm Sóc Sức Khỏe</h3>
              <p className="text-slate-400 text-xs mt-1">Các liệu trình được thiết kế tỉ mỉ để phục hồi năng lượng toàn diện</p>
              <div className="h-0.5 w-12 bg-[#007b8a] mx-auto mt-3"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {journeys.map((j, i) => (
                <div key={i} className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden group flex flex-col sm:flex-row">
                  <div className="h-44 sm:h-auto sm:w-44 shrink-0 overflow-hidden relative">
                    <img src={j.image} alt={j.title} className="w-full h-full object-cover group-hover:scale-102 transition duration-500" />
                    {j.tags && j.tags.map((t, idx) => (
                      <span key={idx} className="absolute top-3 left-3 bg-[#0b1528] text-white text-[9px] font-semibold py-0.5 px-2 rounded-md">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="p-6 flex flex-col justify-center">
                    <h4 className="font-bold text-slate-800 text-sm mb-1">{j.title}</h4>
                    <p className="text-slate-500 text-xs leading-normal mb-3">{j.desc}</p>
                    {j.tags && j.title === "Massage Đặc Trưng" ? (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {j.tags.map((tag) => (
                          <span key={tag} className="text-[9px] bg-slate-100 text-slate-650 px-2 py-0.5 rounded-md font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <button onClick={() => alert("Chi tiết dịch vụ đang được cập nhật.")} className="text-[#007b8a] text-xs font-bold hover:underline w-fit text-left cursor-pointer mt-1">
                        XEM CHI TIẾT →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* World-Class Expertise */}
          <section className="bg-[#0b1528] text-white p-8 sm:p-12 rounded-3xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-bold">Đội Ngũ Chuyên Gia Đẳng Cấp</h3>
                  <p className="text-slate-400 text-xs mt-1 font-light">Các chuyên gia trị liệu giàu kinh nghiệm về nắn xương khớp, chăm sóc trị liệu da và sức khỏe toàn diện.</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 border border-slate-700 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer text-xs">
                    ◀
                  </button>
                  <button className="p-2 border border-slate-700 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer text-xs">
                    ▶
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {experts.map((e, idx) => (
                  <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col gap-4">
                    <div className="h-48 overflow-hidden rounded-xl bg-slate-800">
                      <img src={e.image} alt={e.name} className="w-full h-full object-cover grayscale" />
                    </div>
                    <div>
                      <span className="text-[9px] text-[#64dfdf] font-bold tracking-wider uppercase">{e.role}</span>
                      <h4 className="font-bold text-sm text-slate-100 mt-0.5">{e.name}</h4>
                      <p className="text-slate-400 text-xs leading-normal mt-2 font-light">{e.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Reserve Your Moment Form */}
          <section id="booking" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Contact info */}
            <div className="lg:col-span-5 flex flex-col gap-6 text-slate-700">
              <h3 className="text-xl font-extrabold text-slate-800">Đặt Lịch Trải Nghiệm</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm font-light">
                Lên lịch trị liệu và để chúng tôi chuẩn bị lộ trình chăm sóc cá nhân hóa cho bạn. Bộ phận lễ tân của chúng tôi sẽ liên hệ trong vòng 2 giờ để xác nhận thông tin.
              </p>

              <div className="flex flex-col gap-4 mt-2">
                <div className="flex gap-3 items-center">
                  <div className="h-10 w-10 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center flex-shrink-0 text-sm">
                    ⏰
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-800">Giờ Mở Cửa</h5>
                    <p className="text-[10px] text-slate-400">Hàng ngày: 08:00 - 22:00</p>
                  </div>
                </div>

                <div className="flex gap-3 items-center">
                  <div className="h-10 w-10 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center flex-shrink-0 text-sm">
                    📞
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-800">Đường Dây Nóng</h5>
                    <p className="text-[10px] text-slate-400">+1 (800) HB-WELL</p>
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
                      Danh Mục Dịch Vụ
                    </label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:border-brand-500 focus:bg-white focus:outline-none transition text-slate-800 cursor-pointer"
                    >
                      <option value="Massage Đặc Trưng">Massage Đặc Trưng</option>
                      <option value="Chăm Sóc Da Mặt Chuyên Sâu">Chăm Sóc Da Mặt Chuyên Sâu</option>
                      <option value="Trị Liệu Toàn Thân">Trị Liệu Toàn Thân</option>
                      <option value="Liệu Trình Thủy Trị Liệu">Liệu Trình Thủy Trị Liệu</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Thời Gian Mong Muốn
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
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Yêu Cầu Đặc Biệt
                  </label>
                  <textarea 
                    rows={3}
                    placeholder="Vui lòng cho biết nếu bạn có dị ứng thành phần hoặc vùng cơ thể cần tập trung..."
                    value={requests}
                    onChange={(e) => setRequests(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs focus:border-brand-500 focus:bg-white focus:outline-none transition text-slate-800"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#0b1528] hover:bg-brand-650 text-white font-bold py-3.5 rounded-xl text-xs transition duration-200 cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  ) : (
                    <>Gửi Yêu Cầu Đặt Lịch</>
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
