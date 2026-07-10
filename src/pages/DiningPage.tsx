import { useState } from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export function DiningPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [restaurant, setRestaurant] = useState("Nhà Hàng Heritage Kitchen");
  const [guests, setGuests] = useState(2);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      alert(`Đặt bàn thành công!\nNhà hàng: ${restaurant}\nSố lượng khách: ${guests}\nThời gian: ${date} lúc ${time}\nChúng tôi đã gửi email xác nhận đặt bàn.`);
      setFullName("");
      setEmail("");
      setGuests(2);
      setDate("");
      setTime("");
      setIsSubmitting(false);
    }, 1200);
  };

  const restaurants = [
    {
      name: "Nhà Hàng Heritage Kitchen",
      desc: "Những công thức nấu ăn vượt thời gian truyền qua nhiều thế hệ, được nâng tầm bằng sự chính xác và tinh tế của nghệ thuật ẩm thực hiện đại.",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600",
      actionLabel: "XEM THỰC ĐƠN TRUYỀN THỐNG →"
    },
    {
      name: "Nhà Hàng The Global Palette",
      desc: "Hành trình khám phá hương vị Á - Âu xuyên lục địa, sử dụng nguyên liệu hữu cơ bền vững từ địa phương.",
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=600"
    },
    {
      name: "Sapphire Lounge",
      desc: "Các loại cocktail đặc sắc và rượu vang thượng hạng được phục vụ trong không gian sang trọng, ấm cúng. Nơi tuyệt vời cho những câu chuyện ban đêm.",
      tags: ["Lớp Học Pha Chế", "Đêm Nhạc Jazz Thứ Sáu"],
      image: "https://images.unsplash.com/photo-1574096079513-d8259312b785?q=80&w=600"
    }
  ];

  const specials = [
    {
      title: "Món Quà Đại Dương (Ocean's Pearl)",
      price: "$48",
      desc: "Sò điệp tươi nhập khẩu Hokkaido, sốt đậu xanh nghiền mịn và nước cốt cam quýt thanh mát. Kết hợp tuyệt vời với vang trắng Chardonnay.",
      tags: ["Không Chứa Gluten", "Món Đặc Trưng"],
      image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=300"
    },
    {
      title: "Bản Giao Hưởng Wagyu (Wagyu Symphony)",
      price: "$85",
      desc: "Thịt bò Wagyu cấp độ A5 nướng bản đá, khoai tây nghiền hương nấm truffle và rau củ quả sốt bóng. Tác phẩm tâm huyết của Bếp trưởng.",
      tags: ["Thượng Hạng", "Bếp Trưởng Khuyên Dùng"],
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=300"
    },
    {
      title: "Nhung Đêm Huyền Bí (Midnight Velvet)",
      price: "$24",
      desc: "Quả cầu sô-cô-la đen nguyên chất, nhân kem quả mâm xôi chua ngọt và sốt caramel muối vàng ấm nóng rưới trực tiếp.",
      tags: ["Món Chay", "Món Ăn Đạt Giải"],
      image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=300"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 w-full flex-grow flex flex-col gap-12">
          
          {/* Hero Banner Section */}
          <section className="relative h-[420px] rounded-3xl overflow-hidden flex items-center p-8 sm:p-12 text-white bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200')" }}>
            <div className="absolute inset-0 bg-black/50"></div>
            
            <div className="relative z-10 max-w-xl">
              <span className="bg-[#007b8a]/90 text-white text-[10px] font-bold uppercase tracking-wider py-1 px-2.5 rounded-md">
                TINH HOA ẨM THỰC
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold mt-3 mb-4 drop-shadow-md">
                Thưởng Thức Nghệ Thuật Ẩm Thực Hiện Đại
              </h2>
              <p className="text-slate-200 text-sm mb-6 font-light leading-relaxed">
                Từ những hương vị truyền thống tinh tế đến sự kết hợp quốc tế táo bạo, đội ngũ đầu bếp từng đoạt giải thưởng của chúng tôi mang đến những trải nghiệm vượt xa đĩa ăn thông thường.
              </p>
              <div className="flex gap-3">
                <a href="#booking" className="bg-[#0b1528] hover:bg-brand-600 text-white transition font-bold px-6 py-2.5 rounded-xl text-xs cursor-pointer">
                  Đặt Bàn Ngay
                </a>
                <a href="#restaurants" className="border border-white/30 hover:bg-white/10 transition text-white font-bold px-6 py-2.5 rounded-xl text-xs cursor-pointer">
                  Khám Phá Thực Đơn
                </a>
              </div>
            </div>
          </section>

          {/* Our Restaurants */}
          <section id="restaurants">
            <div className="mb-8 border-b border-slate-100 pb-4">
              <h3 className="text-xl font-extrabold text-slate-800">Hệ Thống Nhà Hàng</h3>
              <p className="text-slate-400 text-xs mt-1">Không gian ẩm thực độc đáo phù hợp cho mọi dịp gặp gỡ</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {restaurants.map((r, idx) => (
                <div key={idx} className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden group flex flex-col hover:shadow-md transition duration-300">
                  <div className="h-48 overflow-hidden relative">
                    <img src={r.image} alt={r.name} className="w-full h-full object-cover group-hover:scale-102 transition duration-500" />
                    {r.tags && (
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        {r.tags.map((t, i) => (
                          <span key={i} className="bg-[#0b1528] text-white text-[9px] font-semibold py-0.5 px-2 rounded-md">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h4 className="font-bold text-slate-800 text-sm mb-2">{r.name}</h4>
                    <p className="text-slate-500 text-xs leading-relaxed mb-6 flex-grow font-light">{r.desc}</p>
                    
                    {r.actionLabel ? (
                      <button onClick={() => alert("Menu đang được tải lên.")} className="text-[#007b8a] text-xs font-bold hover:underline w-fit text-left cursor-pointer">
                        {r.actionLabel}
                      </button>
                    ) : (
                      <span className="text-slate-400 text-[10px] uppercase font-semibold">Ẩm Thực Đạt Giải Thưởng</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Chef's Seasonal Specials */}
          <section className="bg-slate-100 p-8 sm:p-10 rounded-3xl border border-slate-200/50">
            <div className="text-center mb-10">
              <h3 className="text-xl font-extrabold text-slate-800">Món Ngon Đặc Biệt Theo Mùa</h3>
              <p className="text-slate-400 text-xs mt-1">Khám phá các sáng tạo ẩm thực giới hạn của chúng tôi, được chế biến tỉ mỉ từ những nguyên liệu tươi ngon nhất theo mùa.</p>
              <div className="h-0.5 w-12 bg-[#007b8a] mx-auto mt-3"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {specials.map((s, idx) => (
                <div key={idx} className="bg-white border border-slate-150 rounded-2xl p-4 flex flex-col gap-4 shadow-sm">
                  <div className="h-44 overflow-hidden rounded-xl bg-slate-100">
                    <img src={s.image} alt={s.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-sm text-slate-800">{s.title}</h4>
                        <span className="text-sm font-extrabold text-[#007b8a]">{s.price}</span>
                      </div>
                      <p className="text-slate-500 text-xs leading-normal line-clamp-3 mb-4 font-light">{s.desc}</p>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-auto">
                      {s.tags.map((tag) => (
                        <span key={tag} className="text-[9px] bg-slate-100 text-slate-650 px-2.5 py-0.5 rounded-md font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Secure Your Culinary Journey Form */}
          <section id="booking" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Contact Info */}
            <div className="lg:col-span-5 flex flex-col gap-6 text-slate-700">
              <h3 className="text-xl font-extrabold text-slate-800">Đặt Bàn Trải Nghiệm</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm font-light">
                Đặt bàn trước tại một trong những nhà hàng sang trọng của chúng tôi để chuẩn bị cho hành trình khám phá ẩm thực. Đối với các yêu cầu đặt tiệc trên 8 người, vui lòng liên hệ bộ phận hỗ trợ.
              </p>

              <div className="flex flex-col gap-4 mt-2">
                <div className="flex gap-3 items-center">
                  <div className="h-10 w-10 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center flex-shrink-0 text-sm">
                    📞
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-800">Hotline Hỗ Trợ Đặt Bàn</h5>
                    <p className="text-[10px] text-slate-400">+1 (800) LUX-STAY</p>
                  </div>
                </div>

                <div className="flex gap-3 items-center">
                  <div className="h-10 w-10 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center flex-shrink-0 text-sm">
                    🕒
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-800">Thời Gian Phục Vụ</h5>
                    <p className="text-[10px] text-slate-400">11:30 - 23:00 Hàng ngày</p>
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
                      placeholder="nguyenvana@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:border-brand-500 focus:bg-white focus:outline-none transition text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Chọn Nhà Hàng
                    </label>
                    <select 
                      value={restaurant}
                      onChange={(e) => setRestaurant(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:border-brand-500 focus:bg-white focus:outline-none transition text-slate-800 cursor-pointer"
                    >
                      <option value="Nhà Hàng Heritage Kitchen">Nhà Hàng Heritage Kitchen</option>
                      <option value="Nhà Hàng The Global Palette">Nhà Hàng The Global Palette</option>
                      <option value="Sapphire Lounge">Sapphire Lounge</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Số Lượng Khách
                    </label>
                    <input 
                      type="number" 
                      required
                      min={1}
                      max={20}
                      value={guests}
                      onChange={(e) => setGuests(parseInt(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:border-brand-500 focus:bg-white focus:outline-none transition text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Ngày đặt bàn
                    </label>
                    <input 
                      type="date" 
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:border-brand-500 focus:bg-white focus:outline-none transition text-slate-800 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Giờ đặt bàn
                    </label>
                    <input 
                      type="time" 
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:border-brand-500 focus:bg-white focus:outline-none transition text-slate-800 cursor-pointer"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#007b8a] hover:bg-[#005f6b] text-white font-bold py-3.5 rounded-xl text-xs transition duration-200 cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  ) : (
                    <>Xác Nhận Đặt Bàn</>
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
