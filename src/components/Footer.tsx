import { Link } from "react-router-dom";
import { ROUTES } from "../constants/routes";

export function Footer() {
  return (
    <footer className="bg-[#0b1528] text-slate-400 pt-16 pb-8 border-t border-slate-800 w-full mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <img
              src="/logo.png"
              alt="HotelBooking Logo"
              className="h-7 w-7 object-contain rounded-lg"
            />
            <h3 className="text-white font-extrabold text-xl tracking-tight">
              HotelBooking
            </h3>
          </div>
          <p className="text-xs leading-relaxed mb-4 text-slate-400">
            Kiến tạo những trải nghiệm lưu trú thượng lưu tại Việt Nam. Nâng tầm trải nghiệm du lịch của bạn với dịch vụ đặt phòng khách sạn và biệt thự sang trọng hàng đầu.
          </p>
          <div className="flex gap-4">
            <a href="#" className="p-2 bg-slate-800/40 hover:bg-brand-600 rounded-lg text-white transition duration-200 flex items-center justify-center w-8 h-8">
              <i className="fa-brands fa-facebook-f text-sm"></i>
            </a>
            <a href="#" className="p-2 bg-slate-800/40 hover:bg-brand-600 rounded-lg text-white transition duration-200 flex items-center justify-center w-8 h-8">
              <i className="fa-brands fa-instagram text-sm"></i>
            </a>
            <a href="#" className="p-2 bg-slate-800/40 hover:bg-brand-600 rounded-lg text-white transition duration-200 flex items-center justify-center w-8 h-8">
              <i className="fa-brands fa-x-twitter text-sm"></i>
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Công ty</h4>
          <ul className="flex flex-col gap-2 text-xs">
            <li><a href="#" className="hover:text-white transition">Giới thiệu</a></li>
            <li><a href="#" className="hover:text-white transition">Tuyển dụng</a></li>
            <li><Link to={ROUTES.TRAVEL_GUIDE} className="hover:text-white transition">Cẩm nang du lịch</Link></li>
            <li><a href="#" className="hover:text-white transition">Đại sứ thương hiệu</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Pháp lý</h4>
          <ul className="flex flex-col gap-2 text-xs">
            <li><a href="#" className="hover:text-white transition">Điều khoản dịch vụ</a></li>
            <li><a href="#" className="hover:text-white transition">Chính sách bảo mật</a></li>
            <li><a href="#" className="hover:text-white transition">Chính sách hoàn tiền</a></li>
            <li><a href="#" className="hover:text-white transition">Quy chế hoạt động</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Hỗ trợ</h4>
          <ul className="flex flex-col gap-2.5 text-xs">
            <li className="flex items-center gap-2">
              <i className="fa-regular fa-envelope text-brand-500"></i>
              <span>care@hotelbooking.premium</span>
            </li>
            <li className="flex items-center gap-2">
              <i className="fa-solid fa-phone text-brand-500"></i>
              <span className="font-semibold">1900 6789</span>
            </li>
            <li className="flex items-start gap-2">
              <i className="fa-solid fa-location-dot text-brand-500 mt-0.5 flex-shrink-0"></i>
              <span className="text-slate-400">Tòa nhà Diamond Plaza, 34 Lê Duẩn, Quận 1, TP. HCM</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 border-t border-slate-800/80 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
        <p>&copy; 2024 HotelBooking Premium Hotels. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:underline">Tiếng Việt (VN)</a>
          <a href="#" className="hover:underline">VNĐ</a>
        </div>
      </div>
    </footer>
  );
}
