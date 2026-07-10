import { useParams, useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ROUTES } from "../constants/routes";

interface OfferDetails {
  id: number;
  discount: string;
  location: string;
  title: string;
  description: string;
  details: string;
  image: string;
  inclusions: string[];
  terms: string[];
}

export function OfferDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const offers: Record<string, OfferDetails> = {
    "1": {
      id: 1,
      discount: "-20%",
      location: "Đà Nẵng & Hội An",
      title: "Kỳ nghỉ Thu lãng mạn tại Phố Cổ",
      description: "Tận hưởng kỳ nghỉ lãng mạn bên sông Hoài cổ kính. Tặng kèm bữa tối ánh nến bên sông và liệu trình Spa 60 phút cho cặp đôi.",
      details: "Mùa thu là khoảng thời gian đẹp nhất để ghé thăm Hội An. Trải nghiệm dịch vụ nghỉ dưỡng cao cấp tại các biệt thự hướng sông, dạo bước trên những con đường ngập tràn sắc đèn lồng lấp lánh và tận hưởng đặc quyền chỉ có trong mùa thu này.",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200",
      inclusions: [
        "Nghỉ dưỡng tại phòng Deluxe River View hướng sông",
        "Miễn phí bữa ăn tối lãng mạn dưới ánh nến tại nhà hàng ven sông Hoài",
        "Tặng 01 liệu trình Spa phục hồi cơ thể 60 phút dành cho 2 người",
        "Buffet sáng cao cấp hàng ngày",
        "Miễn phí trà, cà phê và nước suối đặt phòng",
        "Xe đưa đón phố cổ theo lịch trình cố định của khách sạn"
      ],
      terms: [
        "Thời hạn áp dụng đến hết ngày 31/12/2024",
        "Áp dụng cho các booking từ 2 đêm trở lên",
        "Không áp dụng đồng thời với các chương trình khuyến mãi khác",
        "Yêu cầu đặt trước tối thiểu 3 ngày trước khi nhận phòng",
        "Đơn đặt phòng không được hoàn hủy nhưng được đổi ngày 1 lần miễn phí"
      ]
    },
    "2": {
      id: 2,
      discount: "Đặt 3 Tặng 1",
      location: "Sapa & Hà Giang",
      title: "Săn mây đại ngàn - Ưu đãi nhóm",
      description: "Cùng nhóm bạn chinh phục những đỉnh núi ngập tràn sương mây. Đặt 3 phòng tặng ngay 1 phòng miễn phí cùng nâng hạng phòng Suite hướng thung lũng.",
      details: "Chuyến đi trốn xa phố thị cùng những người thân yêu sẽ trọn vẹn hơn bao giờ hết với chương trình Săn mây đại ngàn. Chiêm ngưỡng vẻ đẹp ngoạn mục của thung lũng Mường Hoa, hòa mình vào không khí se lạnh vùng cao và thưởng thức bữa tối đầm ấm cùng nhau.",
      image: "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?q=80&w=1200",
      inclusions: [
        "Đặt combo 3 phòng tặng thêm 1 phòng Deluxe miễn phí",
        "Miễn phí nâng hạng phòng Suite hướng thung lũng (tùy thuộc tình trạng phòng)",
        "Tặng kèm 01 đĩa hoa quả tươi và nước uống thảo mộc lúc nhận phòng",
        "Buffet sáng cao cấp hàng ngày",
        "Giảm 15% cho tất cả dịch vụ ẩm thực tại nhà hàng khách sạn",
        "Miễn phí vé tham gia chương trình giao lưu văn nghệ bản sắc tối thứ Bảy"
      ],
      terms: [
        "Thời hạn áp dụng đến hết ngày 15/11/2024",
        "Chỉ áp dụng khi đặt tối thiểu từ 3 phòng trở lên cùng thời điểm",
        "Không áp dụng trong các ngày Lễ, Tết quốc gia",
        "Yêu cầu thanh toán trước 100% giá trị đơn đặt phòng",
        "Không hỗ trợ hoàn tiền khi hủy phòng, hỗ trợ đổi ngày trước 7 ngày"
      ]
    },
    "3": {
      id: 3,
      discount: "-15%",
      location: "Phú Quốc & Quy Nhơn",
      title: "Early Bird: Đặt sớm nhận ưu đãi",
      description: "Lên kế hoạch nghỉ dưỡng sớm tối thiểu 30 ngày để nhận ngay mức giá ưu đãi đặc quyền 15% cùng buffet sáng cao cấp hàng ngày.",
      details: "Du lịch thông minh bằng cách chuẩn bị sớm cho kỳ nghỉ của bạn. Hãy để HotelBooking đem đến cho bạn và gia đình một chuyến đi trọn vẹn tại các bãi biển thiên đường hoang sơ, xanh mát ở Phú Quốc hay Quy Nhơn với chi phí tối ưu nhất.",
      image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1200",
      inclusions: [
        "Giảm trực tiếp 15% trên giá phòng công bố công khai",
        "Buffet sáng cao cấp đa dạng ẩm thực hàng ngày",
        "Miễn phí đưa đón sân bay bằng xe bus của khách sạn (yêu cầu đăng ký trước)",
        "Tặng kèm 02 ly cocktail đặc biệt tại quầy bar sát biển lúc hoàng hôn",
        "Tự do sử dụng bể bơi vô cực và phòng tập gym hiện đại",
        "Nhận phòng sớm từ 12:00 (tùy thuộc tình trạng phòng trống)"
      ],
      terms: [
        "Chỉ áp dụng cho các booking đặt trước ngày nhận phòng tối thiểu 30 ngày",
        "Áp dụng cho mọi thời điểm đặt phòng trong năm (trừ Lễ Tết đặc biệt)",
        "Chỉ áp dụng cho các booking lưu trú từ 2 đêm trở lên",
        "Cho phép thay đổi lịch trình hoặc dời ngày lưu trú miễn phí trước 7 ngày",
        "Hỗ trợ hoàn hủy miễn phí nếu thông báo trước 14 ngày nhận phòng"
      ]
    }
  };

  const offer = offers[id || "1"] || offers["1"];

  const handleApplyOffer = () => {
    // Redirect to hotel search with city preset
    const city = offer.location.split("&")[0].trim();
    navigate(`${ROUTES.HOTELS}?city=${encodeURIComponent(city)}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 w-full flex-grow">
        {/* Back Link */}
        <button
          onClick={() => navigate(ROUTES.OFFERS)}
          className="text-slate-500 hover:text-brand-600 font-semibold text-xs mb-6 flex items-center gap-1 cursor-pointer transition"
        >
          ➔ Quay lại danh sách ưu đãi
        </button>

        {/* Offer Layout Card */}
        <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xl">
          {/* Banner Image */}
          <div className="h-64 sm:h-[380px] overflow-hidden relative">
            <img src={offer.image} alt={offer.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <span className="absolute bottom-6 left-6 bg-rose-500 text-white text-xs font-bold py-1 px-3 rounded-lg shadow-md">
              Ưu đãi {offer.discount}
            </span>
          </div>

          {/* Offer Content */}
          <div className="p-8 sm:p-12 flex flex-col gap-8">
            <div>
              <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">
                📍 {offer.location}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-2 mb-4 leading-tight">
                {offer.title}
              </h1>
              <p className="text-slate-500 text-sm leading-relaxed font-light">
                {offer.description}
              </p>
            </div>

            {/* Detailed Description */}
            <div className="border-t border-slate-100 pt-6">
              <h3 className="font-bold text-slate-800 text-sm mb-3">Chi tiết chương trình</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                {offer.details}
              </p>
            </div>

            {/* Inclusions list */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
              <h3 className="font-bold text-brand-600 text-sm mb-4 flex items-center gap-2">
                <span>🎁</span> Đặc quyền bao gồm
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-slate-650">
                {offer.inclusions.map((inc, index) => (
                  <li key={index} className="flex items-start gap-2.5 leading-relaxed">
                    <span className="text-emerald-500 text-sm shrink-0">✓</span>
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Terms and conditions list */}
            <div>
              <h3 className="font-bold text-slate-800 text-sm mb-3">Điều khoản & Điều kiện áp dụng</h3>
              <ul className="flex flex-col gap-2.5 text-xs text-slate-400">
                {offer.terms.map((term, index) => (
                  <li key={index} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-slate-300 font-bold shrink-0">•</span>
                    <span>{term}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Button */}
            <div className="border-t border-slate-100 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-center sm:text-left">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mức giảm giá</p>
                <p className="text-xl font-extrabold text-rose-500">{offer.discount} GIÁ CÔNG BỐ</p>
              </div>
              <button
                onClick={handleApplyOffer}
                className="bg-brand-600 hover:bg-brand-700 text-white font-extrabold px-8 py-3.5 rounded-xl shadow-lg transition duration-200 cursor-pointer text-xs w-full sm:w-auto"
              >
                Áp dụng ưu đãi & Đặt phòng ngay ➔
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
