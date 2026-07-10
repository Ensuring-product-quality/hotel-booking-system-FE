import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ROUTES } from "../constants/routes";

interface ContentBlock {
  heading: string;
  text: string;
}

interface NoticeCard {
  title: string;
  items: string[];
}

interface ArticleDetail {
  id: number;
  category: string;
  date: string;
  author: string;
  readTime: string;
  title: string;
  description: string;
  image: string;
  quotes: string;
  blocks: ContentBlock[];
  notice?: NoticeCard;
}

export function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [emailInput, setEmailInput] = useState("");

  const articlesData: Record<string, ArticleDetail> = {
    "0": {
      id: 0,
      category: "Trải nghiệm",
      date: "14 Tháng 10, 2024",
      author: "Minh Anh Vũ",
      readTime: "6 phút đọc",
      title: "Sa Pa: Hành trình tìm về bản sắc trong sương mờ đại ngàn",
      description: "Khám phá vẻ đẹp hùng vĩ của dãy Hoàng Liên Sơn và trải nghiệm kỳ nghỉ sang trọng tại những khu nghỉ dưỡng hàng đầu ẩn mình cao phía Bắc. Nơi hội tụ tinh hoa văn hóa bản địa độc sắc.",
      image: "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?q=80&w=1200",
      quotes: "Giữa trùng điệp mây ngàn vùng cao Tây Bắc, Sa Pa không chỉ hiện lên như một bức tranh thiên nhiên hùng vĩ mà còn là nơi lưu giữ những giá trị văn hóa độc đáo. Hãy cùng HotelBooking bắt đầu chuyến hành trình khám phá những góc khuất đầy mê hoặc của vùng đất sương mờ này.",
      blocks: [
        {
          heading: "Khi sương mù trở thành đặc sản",
          text: "Khác với cái nắng gay gắt của miền xuôi, Sa Pa đón khách bằng những làn sương bồng bềnh, len lỏi qua từng kẽ lá, từng mái hiên nhà gỗ của người Mông, người Dao. Tiết trời se lạnh quanh năm tạo nên một không gian nghỉ dưỡng lý tưởng cho những ai muốn chạy trốn khỏi sự ồn ào của phố thị."
        },
        {
          heading: "Hành trình chinh phục những nấc thang lên thiên đường",
          text: "Ruộng bậc thang Sa Pa đã được vinh danh là một trong những kỳ quan nhân tạo đẹp nhất thế giới. Mỗi mùa, những \"nấc thang\" này lại khoác lên mình một màu áo mới: mùa nước đổ lấp lánh như gương, mùa lúa xanh mướt tràn đầy nhựa sống, và mùa vàng óng ả lúc thu về.\n\nĐể thực sự cảm nhận được vẻ đẹp này, du khách nên thử sức với những cung đường trekking xuyên qua các bản làng như Lao Chải, Tả Van. Đây là cơ hội để bạn tận mắt chứng kiến cuộc sống bình dị và sự hiếu khách của người dân bản địa."
        },
        {
          heading: "Nghi dưỡng thượng lưu giữa lòng đại ngàn",
          text: "Sa Pa ngày nay không thiếu những khách sạn và khu nghỉ dưỡng 5 sao đẳng cấp quốc tế. Với thiết kế lấy cảm hứng từ văn hóa bản địa kết hợp với tiện nghi hiện đại, bạn có thể tận hưởng cảm giác thức dậy giữa mây ngàn từ chính ban công phòng mình."
        }
      ],
      notice: {
        title: "Lưu ý cho hành trình của bạn",
        items: [
          "Thời điểm lý tưởng nhất để ngắm lúa chín là từ cuối tháng 8 đến giữa tháng 9.",
          "Hãy mang theo giày đi bộ thoải mái và áo khoác nhẹ vì nhiệt độ có thể giảm sâu vào ban đêm.",
          "Đừng quên thưởng thức các món ăn đặc sản như thắng cố, cá hồi Sapa và rượu ngô Thanh Kim."
        ]
      }
    },
    "1": {
      id: 1,
      category: "Ẩm thực",
      date: "20 Tháng 5, 2024",
      author: "Lê Hoàng Nam",
      readTime: "6 phút đọc",
      title: "Top 5 nhà hàng Fine Dining không thể bỏ qua tại Hà Nội",
      description: "Trải nghiệm tinh hoa ẩm thực Việt Nam và quốc tế qua bàn tay của các đầu bếp đạt sao Michelin danh giá tại thủ đô.",
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200",
      quotes: "Không chỉ nổi tiếng với những món ăn đường phố bình dị, ẩm thực Hà Nội ngày nay đã vươn tầm thế giới với những nhà hàng Fine Dining đẳng cấp, nơi mỗi món ăn là một câu chuyện nghệ thuật tinh tế.",
      blocks: [
        {
          heading: "Tinh hoa giao thoa Á - Âu",
          text: "Tại những nhà hàng cao cấp này, các nguyên liệu quen thuộc như thịt bò, gan ngỗng hay hải sản được chế biến tài tình dưới bàn tay các đầu bếp Michelin. Sự kết hợp tinh tế giữa nguyên liệu địa phương thuần Việt và phương pháp nấu phương Tây hiện đại tạo nên những dư vị khó quên."
        },
        {
          heading: "Không gian ẩm thực đậm chất nghệ thuật",
          text: "Không chỉ dừng lại ở đĩa ăn ngon, Fine Dining tại Hà Nội còn mang tới trải nghiệm đa giác quan qua những không gian thiết kế độc bản: từ căn biệt thự Pháp cổ kính lãng mạn tới tầm nhìn bao trọn hồ Gươm lung linh trong đêm."
        }
      ]
    },
    "2": {
      id: 2,
      category: "Mẹo du lịch",
      date: "18 Tháng 5, 2024",
      author: "Nguyễn Thùy Linh",
      readTime: "4 phút đọc",
      title: "Bí quyết sắp xếp hành lý gọn nhẹ cho chuyến công tác 3 ngày",
      description: "Làm thế nào để vẫn thời thượng và chuyên nghiệp mà chỉ cần một chiếc vali xách tay duy nhất? Khám phá cẩm nang tối giản.",
      image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1200",
      quotes: "Một chuyến công tác hiệu quả luôn bắt đầu từ một chiếc vali gọn gàng. Sắp xếp hành lý thông minh giúp bạn tiết kiệm thời gian ký gửi và tự tin di chuyển nhanh chóng.",
      blocks: [
        {
          heading: "Nguyên tắc chọn trang phục đa năng",
          text: "Hãy chọn các trang phục có cùng tông màu cơ bản để dễ dàng phối hợp qua lại. Ưu tiên chất liệu vải chống nhăn và có thể diện được cho cả cuộc họp ban ngày lẫn tiệc tối xã giao."
        },
        {
          heading: "Tối ưu hóa không gian vali",
          text: "Sử dụng phương pháp cuộn quần áo thay vì gấp phẳng truyền thống. Tận dụng tối đa các túi chia ngăn (packing cubes) để phân loại đồ dùng cá nhân và tài liệu công việc một cách khoa học."
        }
      ]
    },
    "3": {
      id: 3,
      category: "Điểm đến",
      date: "15 Tháng 5, 2024",
      author: "Trần Bảo Ngọc",
      readTime: "8 phút đọc",
      title: "Phú Quốc - Thiên đường nghỉ dưỡng mùa hè này",
      description: "Tại sao đảo Ngọc luôn là lựa chọn hàng đầu cho các gia đình và cặp đôi tìm kiếm sự riêng tư, sang trọng bên biển xanh cát trắng.",
      image: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=1200",
      quotes: "Bãi cát trắng mịn màng như kem, làn nước biển xanh trong vắt màu ngọc bích và hoàng hôn đỏ rực rỡ đã biến Phú Quốc thành điểm đến nghỉ dưỡng thiên đường bậc nhất Việt Nam.",
      blocks: [
        {
          heading: "Khám phá bãi biển thiên đường hoang sơ",
          text: "Bãi Sao, Bãi Khem hay các hòn đảo nhỏ phía Nam như hòn Thơm, hòn Mây Rút sở hữu vẻ đẹp hoang sơ tựa tranh vẽ. Đây là những địa điểm lý tưởng để lặn ngắm san hô, tắm nắng và tận hưởng không khí đại dương thanh bình."
        },
        {
          heading: "Các khu nghỉ dưỡng sang trọng bậc nhất",
          text: "Phú Quốc quy tụ những thương hiệu resort 5 sao danh tiếng thế giới. Với hồ bơi vô cực sát biển, các liệu pháp Spa cao cấp và dịch vụ ẩm thực chuẩn quốc tế, chuyến đi của bạn sẽ trọn vẹn hơn bao giờ hết."
        }
      ]
    },
    "4": {
      id: 4,
      category: "Trải nghiệm",
      date: "12 Tháng 5, 2024",
      author: "Phạm Minh Thư",
      readTime: "5 phút đọc",
      title: "Nghệ thuật thư giãn: Top các Spa đẳng cấp tại HotelBooking",
      description: "Đánh thức mọi giác quan với những liệu trình chăm sóc sức khỏe độc bản sử dụng thảo mộc tự nhiên tại chuỗi khách sạn của chúng tôi.",
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200",
      quotes: "Chăm sóc sức khỏe toàn diện không chỉ là xu hướng mà đã trở thành triết lý sống. Hãy dành thời gian tái tạo cơ thể qua các liệu trình Spa độc bản nâng tầm trải nghiệm lưu trú.",
      blocks: [
        {
          heading: "Liệu pháp thảo mộc tự nhiên cổ truyền",
          text: "Kế thừa tinh hoa y học cổ truyền kết hợp tinh dầu organic cao cấp, các bài massage trị liệu đá nóng hay xông hơi thảo dược giúp giải tỏa căng thẳng sâu, tăng tuần hoàn máu và khôi phục năng lượng tích cực."
        },
        {
          heading: "Không gian tĩnh lặng biệt lập",
          text: "Các phòng Spa tại HotelBooking được thiết kế với hương thơm dịu nhẹ, âm nhạc thư thái và ánh sáng ấm áp, mang lại sự thư giãn tuyệt đối cho cả thể chất lẫn tinh thần của bạn."
        }
      ]
    },
    "5": {
      id: 5,
      category: "Điểm đến",
      date: "10 Tháng 5, 2024",
      author: "Hoàng Anh Tuấn",
      readTime: "10 phút đọc",
      title: "Hội An: Nơi thời gian ngừng lại bên những mái ngói rêu phong",
      description: "Hướng dẫn chi tiết lịch trình 48 giờ khám phá phố cổ tuyệt đẹp dành cho những tâm hồn lãng mạn yêu phong vị hoài cổ.",
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1200",
      quotes: "Hội An mang vẻ đẹp lắng đọng đầy chất thơ với những bức tường vàng phủ rêu xanh, dãy đèn lồng lung linh sắc màu phản chiếu dòng sông Hoài thơ mộng.",
      blocks: [
        {
          heading: "Hành trình 48 giờ hoài niệm",
          text: "Bắt đầu ngày mới bằng ly cà phê phin đậm đà ngắm phố cổ thanh bình buổi sớm. Dạo quanh các hội quán cổ, chùa Cầu và tự thưởng bữa trưa với món bánh mì Phượng nổi tiếng thế giới."
        },
        {
          heading: "Đêm hội đèn lồng sông nước",
          text: "Khi hoàng hôn buông xuống, cả phố cổ lên đèn rực rỡ. Trải nghiệm thả hoa đăng trên sông Hoài và đi thuyền gỗ mộc mạc ngắm phố cổ từ một góc nhìn thật lãng mạn và yên bình."
        }
      ]
    },
    "6": {
      id: 6,
      category: "Ẩm thực",
      date: "08 Tháng 5, 2024",
      author: "Vũ Tuấn Đạt",
      readTime: "7 phút đọc",
      title: "Văn hóa cà phê Việt: Từ vỉa hè đến những không gian sang trọng",
      description: "Khám phá cách người Việt thưởng thức cà phê và những quán cà phê có thiết kế kiến trúc độc đáo bậc nhất làm say lòng du khách.",
      image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200",
      quotes: "Cà phê ở Việt Nam không chỉ đơn thuần là thức uống tỉnh táo buổi sáng, mà từ lâu đã nâng tầm thành một nét văn hóa, một phong cách sống giao lưu đặc trưng.",
      blocks: [
        {
          heading: "Văn hóa cà phê phin truyền thống",
          text: "Ngồi vỉa hè thong thả ngắm từng giọt cà phê đen hay nâu đá tí tách rơi qua chiếc phin nhôm đã trở thành thói quen gắn bó với bao thế hệ người Việt. Sự chậm rãi này mang đậm nét bình dị, kết nối bạn bè."
        },
        {
          heading: "Sự bùng nổ của các không gian cà phê độc bản",
          text: "Ngày nay, những không gian cà phê sang trọng, thiết kế kiến trúc hiện đại xen lẫn nét cổ điển mọc lên ở khắp các đô thị lớn, thu hút đông đảo bạn trẻ và du khách quốc tế ghé thăm trải nghiệm."
        }
      ]
    }
  };

  const article = articlesData[id || "0"] || articlesData["0"];

  const popularArticles = [
    {
      id: 5,
      title: "Hội An: Nơi thời gian ngừng lại bên những mái ngói rêu phong",
      date: "10 Tháng 5, 2024",
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=150"
    },
    {
      id: 3,
      title: "Phú Quốc - Thiên đường nghỉ dưỡng mùa hè này",
      date: "15 Tháng 5, 2024",
      image: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=150"
    }
  ];

  const relatedArticles = [
    {
      id: 3,
      category: "CẨM NANG",
      title: "Phú Quốc: Thiên đường nghỉ dưỡng mùa nắng đẹp",
      description: "Khám phá những bãi biển hoang sơ và các khu resort đẳng cấp nhất tại đảo ngọc...",
      date: "15 Tháng 5, 2024",
      image: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=600"
    },
    {
      id: 1,
      category: "ẨM THỰC",
      title: "Hà Nội: Hành trình ẩm thực 24 giờ",
      description: "Từ phở gánh bình dân đến các nhà hàng Fine Dining đạt sao tinh tế...",
      date: "20 Tháng 5, 2024",
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600"
    },
    {
      id: 5,
      category: "LỊCH SỬ",
      title: "Cố đô Huế: Tìm lại dấu ấn vương triều",
      description: "Lắng đọng cùng vẻ đẹp trầm mặc của Đại Nội và những lăng tẩm uy nghi bên dòng Hương...",
      date: "10 Tháng 5, 2024",
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=600"
    }
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    alert(`Cảm ơn bạn đã đăng ký! Bản tin du lịch sẽ gửi tới ${emailInput} hàng tuần.`);
    setEmailInput("");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Đã sao chép liên kết vào bộ nhớ tạm!");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 w-full flex-grow">
        {/* Breadcrumbs */}
        <div className="text-xs text-slate-400 mb-6 flex items-center gap-1.5 font-medium">
          <Link to={ROUTES.HOME} className="hover:text-brand-600 transition">Trang chủ</Link>
          <span>&gt;</span>
          <Link to={ROUTES.TRAVEL_GUIDE} className="hover:text-brand-600 transition">Cẩm nang du lịch</Link>
          <span>&gt;</span>
          <span className="text-slate-650 truncate max-w-xs sm:max-w-md font-semibold">{article.title}</span>
        </div>

        {/* Large Banner Image */}
        <section className="relative h-64 sm:h-[400px] rounded-3xl overflow-hidden flex items-end p-6 sm:p-12 text-white bg-cover bg-center mb-10" style={{ backgroundImage: `url('${article.image}')` }}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent"></div>
          
          <div className="relative z-10 max-w-3xl">
            <span className="bg-emerald-500/85 text-white text-[9px] font-bold uppercase tracking-wider py-0.5 px-2 rounded-md">
              {article.category}
            </span>
            <h1 className="text-xl sm:text-3xl font-extrabold mt-3 mb-4 leading-tight drop-shadow-md">
              {article.title}
            </h1>
            
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1">👤 {article.author}</span>
              <span className="flex items-center gap-1">📅 {article.date}</span>
              <span className="flex items-center gap-1">⏱️ {article.readTime}</span>
            </div>
          </div>
        </section>

        {/* Article Body Section: 2 columns layout on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Share buttons + Content */}
          <div className="lg:col-span-8 flex gap-4 sm:gap-6 items-start">
            {/* Sticky Social Share Buttons on Desktop */}
            <div className="hidden sm:flex flex-col gap-3 sticky top-24 pt-2">
              <button onClick={() => alert("Đã chia sẻ lên Facebook!")} className="h-9 w-9 bg-white border border-slate-200 hover:border-brand-500 hover:text-brand-600 rounded-full flex items-center justify-center text-slate-500 shadow-sm transition duration-200 cursor-pointer text-xs" title="Chia sẻ Facebook">
                f
              </button>
              <button onClick={() => alert("Đã chia sẻ lên Twitter!")} className="h-9 w-9 bg-white border border-slate-200 hover:border-brand-500 hover:text-brand-600 rounded-full flex items-center justify-center text-slate-500 shadow-sm transition duration-200 cursor-pointer text-xs" title="Chia sẻ Twitter">
                t
              </button>
              <button onClick={handleCopyLink} className="h-9 w-9 bg-white border border-slate-200 hover:border-brand-500 hover:text-brand-600 rounded-full flex items-center justify-center text-slate-500 shadow-sm transition duration-200 cursor-pointer text-xs" title="Sao chép liên kết">
                🔗
              </button>
            </div>

            {/* Main Article Content */}
            <div className="flex-1 bg-white border border-slate-100 rounded-3xl p-6 sm:p-10 shadow-sm flex flex-col gap-8 text-slate-700">
              {/* Quote Block */}
              <blockquote className="border-l-4 border-emerald-500 bg-slate-50 p-6 rounded-r-2xl italic text-slate-600 text-sm leading-relaxed font-light">
                "{article.quotes}"
              </blockquote>

              {/* Dynamic Content Blocks */}
              {article.blocks.map((block, idx) => (
                <div key={idx} className="flex flex-col gap-3.5">
                  {idx === 1 && article.id === 0 && (
                    <div className="my-6 flex flex-col gap-2.5">
                      <img 
                        src="https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=800" 
                        alt="Ngôi nhà truyền thống của người H'Mông" 
                        className="rounded-2xl w-full h-auto object-cover max-h-[450px] shadow-sm" 
                      />
                      <span className="text-[10px] text-slate-400 italic text-center leading-normal">
                        Ngôi nhà truyền thống của người H'Mông giữa ruộng bậc thang sương sớm.
                      </span>
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                    {block.heading}
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-500 font-light whitespace-pre-line">
                    {block.text}
                  </p>
                </div>
              ))}

              {/* Notice Card if exists */}
              {article.notice && (
                <div className="bg-[#0b1528] text-white p-6 sm:p-8 rounded-2xl flex flex-col gap-4 shadow-md">
                  <h4 className="font-bold text-sm flex items-center gap-2 text-[#64dfdf]">
                    <span>💡</span> {article.notice.title}
                  </h4>
                  <ul className="flex flex-col gap-3 text-xs font-light text-slate-350">
                    {article.notice.items.map((item, index) => (
                      <li key={index} className="flex items-start gap-2.5 leading-relaxed">
                        <span className="text-emerald-400 text-sm shrink-0">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-8 sticky top-24">
            {/* Promo Booking Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden flex flex-col gap-4">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl"></div>
              <h4 className="text-sm font-extrabold tracking-tight uppercase text-[#64dfdf]">Lên kế hoạch ngay</h4>
              <p className="text-xs font-light text-slate-400 leading-relaxed">
                Khám phá bộ sưu tập khách sạn cao cấp tại các điểm đến hàng đầu Việt Nam với ưu đãi độc quyền dành riêng cho thành viên.
              </p>
              <button
                onClick={() => navigate(`${ROUTES.HOTELS}?city=${encodeURIComponent(article.id === 0 ? "Sa Pa" : "Hà Nội")}`)}
                className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition duration-200 cursor-pointer shadow-md text-xs mt-2"
              >
                Đặt phòng ngay ➔
              </button>
            </div>

            {/* Popular Articles Widget */}
            <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
              <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider mb-5 pb-2 border-b border-slate-100">
                Phổ biến nhất
              </h4>
              <div className="flex flex-col gap-4">
                {popularArticles.map((pop) => (
                  <div 
                    key={pop.id} 
                    onClick={() => navigate(`/travel-guide/${pop.id}`)}
                    className="flex gap-3.5 group cursor-pointer"
                  >
                    <div className="h-14 w-14 overflow-hidden rounded-xl bg-slate-100 shrink-0">
                      <img src={pop.image} alt={pop.title} className="w-full h-full object-cover group-hover:scale-102 transition duration-500" />
                    </div>
                    <div className="min-w-0 flex flex-col justify-center">
                      <h5 className="font-bold text-xs text-slate-800 group-hover:text-brand-600 transition leading-snug line-clamp-2">
                        {pop.title}
                      </h5>
                      <span className="text-[10px] text-slate-400 mt-1">{pop.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Signup Banner Section */}
        <section className="bg-slate-100 border border-slate-200/50 rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 mt-16">
          <div className="text-center md:text-left">
            <h3 className="font-extrabold text-slate-800 text-lg">Nhận cảm hứng du lịch mỗi tuần</h3>
            <p className="text-slate-500 text-xs mt-1 font-light">Đăng ký bản tin của HotelBooking để nhận những hướng dẫn du lịch độc quyền và ưu đãi khách sạn mới nhất.</p>
          </div>
          <form onSubmit={handleSubscribe} className="flex gap-2 w-full md:w-auto shrink-0 max-w-md">
            <input 
              type="email" 
              required
              placeholder="Email của bạn"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="bg-white border border-slate-250 rounded-xl px-4 py-3 text-xs w-full focus:outline-none focus:border-brand-500 text-slate-800 shadow-sm"
            />
            <button 
              type="submit"
              className="bg-[#0b1528] hover:bg-brand-600 text-white font-extrabold px-6 py-3 rounded-xl transition duration-200 text-xs shadow-md whitespace-nowrap cursor-pointer"
            >
              Đăng ký ngay
            </button>
          </form>
        </section>

        {/* Related Articles Row Grid */}
        <section className="mt-16">
          <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-800">Bài viết liên quan</h3>
            <Link to={ROUTES.TRAVEL_GUIDE} className="text-brand-600 hover:text-brand-700 text-xs font-bold transition">Xem tất cả ➔</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedArticles.map((rel) => (
              <div 
                key={rel.id} 
                onClick={() => navigate(`/travel-guide/${rel.id}`)}
                className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition duration-300 flex flex-col group cursor-pointer"
              >
                <div className="h-44 overflow-hidden relative">
                  <img src={rel.image} alt={rel.title} className="w-full h-full object-cover group-hover:scale-102 transition duration-500" />
                  <span className="absolute top-3 left-3 bg-[#0b1528] text-white text-[9px] font-semibold py-0.5 px-2 rounded-md uppercase tracking-wider">
                    {rel.category}
                  </span>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <span className="text-[10px] text-slate-400 font-semibold mb-1.5">{rel.date}</span>
                  <h4 className="text-xs font-bold text-slate-800 leading-snug mb-2 group-hover:text-brand-600 transition line-clamp-2">
                    {rel.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-light mb-4 line-clamp-2">
                    {rel.description}
                  </p>
                  <span className="text-xs font-bold text-brand-600 mt-auto flex items-center gap-1 group-hover:translate-x-1 transition duration-200 w-fit">
                    Đọc tiếp ➔
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
