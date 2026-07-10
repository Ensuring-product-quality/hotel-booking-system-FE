import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

interface Article {
  id: number;
  category: string;
  date: string;
  title: string;
  description: string;
  readTime: string;
  image: string;
}

export function TravelGuidePage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["Tất cả", "Điểm đến", "Ẩm thực", "Mẹo du lịch", "Trải nghiệm"];

  const featuredArticle = {
    category: "Tiêu điểm",
    date: "24 Tháng 5, 2024",
    title: "Sa Pa: Hành trình tìm về bản sắc trong sương mờ đại ngàn",
    description: "Khám phá vẻ đẹp hùng vĩ của dãy Hoàng Liên Sơn và trải nghiệm kỳ nghỉ sang trọng tại những khu nghỉ dưỡng hàng đầu ẩn mình cao phía Bắc. Nơi hội tụ tinh hoa văn hóa bản địa độc sắc.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200" // Mountain terraces view
  };

  const articles: Article[] = [
    {
      id: 1,
      category: "Ẩm thực",
      date: "20 Tháng 5, 2024",
      title: "Top 5 nhà hàng Fine Dining không thể bỏ qua tại Hà Nội",
      description: "Trải nghiệm tinh hoa ẩm thực Việt Nam và quốc tế qua bàn tay của các đầu bếp đạt sao Michelin danh giá tại thủ đô.",
      readTime: "6 phút đọc",
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600"
    },
    {
      id: 2,
      category: "Mẹo du lịch",
      date: "18 Tháng 5, 2024",
      title: "Bí quyết sắp xếp hành lý gọn nhẹ cho chuyến công tác 3 ngày",
      description: "Làm thế nào để vẫn thời thượng và chuyên nghiệp mà chỉ cần một chiếc vali xách tay duy nhất? Khám phá cẩm nang tối giản.",
      readTime: "4 phút đọc",
      image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=600"
    },
    {
      id: 3,
      category: "Điểm đến",
      date: "15 Tháng 5, 2024",
      title: "Phú Quốc - Thiên đường nghỉ dưỡng mùa hè này",
      description: "Tại sao đảo Ngọc luôn là lựa chọn hàng đầu cho các gia đình và cặp đôi tìm kiếm sự riêng tư, sang trọng bên biển xanh cát trắng.",
      readTime: "8 phút đọc",
      image: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=600"
    },
    {
      id: 4,
      category: "Trải nghiệm",
      date: "12 Tháng 5, 2024",
      title: "Nghệ thuật thư giãn: Top các Spa đẳng cấp tại HotelBooking",
      description: "Đánh thức mọi giác quan với những liệu trình chăm sóc sức khỏe độc bản sử dụng thảo mộc tự nhiên tại chuỗi khách sạn của chúng tôi.",
      readTime: "5 phút đọc",
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600"
    },
    {
      id: 5,
      category: "Điểm đến",
      date: "10 Tháng 5, 2024",
      title: "Hội An: Nơi thời gian ngừng lại bên những mái ngói rêu phong",
      description: "Hướng dẫn chi tiết lịch trình 48 giờ khám phá phố cổ tuyệt đẹp dành cho những tâm hồn lãng mạn yêu phong vị hoài cổ.",
      readTime: "10 phút đọc",
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=600"
    },
    {
      id: 6,
      category: "Ẩm thực",
      date: "08 Tháng 5, 2024",
      title: "Văn hóa cà phê Việt: Từ vỉa hè đến những không gian sang trọng",
      description: "Khám phá cách người Việt thưởng thức cà phê và những quán cà phê có thiết kế kiến trúc độc đáo bậc nhất làm say lòng du khách.",
      readTime: "7 phút đọc",
      image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600"
    }
  ];

  const filteredArticles = articles.filter((article) => {
    const matchesCategory = selectedCategory === "Tất cả" || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          article.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 w-full flex-grow">
        {/* Header Title section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">Cẩm nang du lịch</h1>
            <p className="text-slate-500 text-sm mt-2 max-w-xl leading-relaxed">
              Khám phá những điểm đến tuyệt vời, tinh hoa ẩm thực và bí quyết du lịch từ các chuyên gia HotelBooking.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              🔍
            </span>
            <input 
              type="text" 
              placeholder="Tìm kiếm bài viết..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:border-brand-500 focus:outline-none shadow-sm text-slate-800"
            />
          </div>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition cursor-pointer border ${
                selectedCategory === category 
                  ? "bg-[#0b1528] text-white border-transparent shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Featured Article Card */}
        {selectedCategory === "Tất cả" && searchQuery === "" && (
          <section className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-lg mb-16 group hover:shadow-xl transition duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="h-64 sm:h-96 overflow-hidden">
                <img 
                  src={featuredArticle.image} 
                  alt={featuredArticle.title} 
                  className="w-full h-full object-cover group-hover:scale-101 transition duration-500"
                />
              </div>
              <div className="p-8 sm:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-3 text-xs font-bold text-brand-600 mb-4">
                  <span className="bg-brand-50 px-2.5 py-1 rounded-md uppercase tracking-wider">{featuredArticle.category}</span>
                  <span className="text-slate-400 font-medium">{featuredArticle.date}</span>
                </div>
                <h2 className="text-xl sm:text-3xl font-extrabold text-slate-800 leading-tight mb-4 group-hover:text-brand-600 transition">
                  {featuredArticle.title}
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed mb-8">
                  {featuredArticle.description}
                </p>
                <button 
                  onClick={() => navigate("/travel-guide/0")}
                  className="bg-[#0b1528] hover:bg-brand-600 text-white font-bold px-6 py-3 rounded-xl w-fit transition duration-200 cursor-pointer shadow-md flex items-center gap-2 text-xs"
                >
                  Đọc bài viết ➔
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Articles List Grid */}
        <section>
          <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-800">Bài viết mới nhất</h3>
            <span className="text-xs text-slate-400 font-semibold">{filteredArticles.length} bài viết</span>
          </div>

          {filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {filteredArticles.map((article) => (
                <div key={article.id} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition duration-300 flex flex-col group cursor-pointer" onClick={() => navigate(`/travel-guide/${article.id}`)}>
                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src={article.image} 
                      alt={article.title} 
                      className="w-full h-full object-cover group-hover:scale-102 transition duration-500"
                    />
                    <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-[#0b1528] text-[10px] font-bold py-1 px-3 rounded-lg shadow-sm">
                      {article.category}
                    </span>
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <span className="text-[10px] text-slate-400 font-semibold mb-2">{article.date}</span>
                    <h4 className="text-sm font-bold text-slate-800 leading-snug mb-2 group-hover:text-brand-600 transition line-clamp-2">
                      {article.title}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed mb-6 line-clamp-3">
                      {article.description}
                    </p>

                    <div className="border-t border-slate-50 pt-4 flex items-center justify-between text-xs mt-auto">
                      <span className="text-slate-400 flex items-center gap-1">
                        ⏱️ {article.readTime}
                      </span>
                      <span className="text-brand-600 font-bold group-hover:translate-x-1 transition duration-200">
                        ➔
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <span className="text-4xl block mb-2">📁</span>
              <p className="text-slate-500 font-medium">Không tìm thấy bài viết nào phù hợp.</p>
            </div>
          )}
        </section>

        {/* Pagination Section */}
        {filteredArticles.length > 0 && (
          <div className="flex justify-center items-center gap-1.5 mt-16">
            <button className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs font-semibold text-slate-500 hover:bg-slate-100 transition cursor-pointer disabled:opacity-50" disabled>
              ‹
            </button>
            <button className="h-8 w-8 rounded-lg bg-[#0b1528] text-white flex items-center justify-center text-xs font-semibold shadow-sm">
              1
            </button>
            <button className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs font-semibold text-slate-500 hover:bg-slate-100 transition cursor-pointer">
              2
            </button>
            <button className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs font-semibold text-slate-500 hover:bg-slate-100 transition cursor-pointer">
              3
            </button>
            <span className="text-slate-400 px-1 text-xs">...</span>
            <button className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs font-semibold text-slate-500 hover:bg-slate-100 transition cursor-pointer">
              12
            </button>
            <button className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs font-semibold text-slate-500 hover:bg-slate-100 transition cursor-pointer">
              ›
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
