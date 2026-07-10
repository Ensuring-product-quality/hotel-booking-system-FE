import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "../components/Header";
import { hotelApi } from "../services/hotelApi";
import { getErrorMessage } from "../services/apiClient";
import { ROUTES } from "../constants/routes";

export function HotelsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Parse query parameters
  const cityParam = searchParams.get("city") || "";
  const starsParam = searchParams.get("stars") ? parseInt(searchParams.get("stars")!) : undefined;
  const keywordParam = searchParams.get("keyword") || "";
  const pageParam = searchParams.get("page") ? parseInt(searchParams.get("page")!) : 0;
  const sizeParam = searchParams.get("size") ? parseInt(searchParams.get("size")!) : 6;
  const sortParam = searchParams.get("sort") || "id,asc";

  // Local filter states
  const [cityInput, setCityInput] = useState(cityParam);
  const [selectedStars, setSelectedStars] = useState<number | undefined>(starsParam);
  const [priceRange, setPriceRange] = useState<number>(10000000); // Max 10M VND
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  // Synchronize local states when URL changes
  useEffect(() => {
    setCityInput(cityParam);
    setSelectedStars(starsParam);
  }, [cityParam, starsParam]);

  // Fetch hotels using search endpoint
  const { data, isLoading, error } = useQuery({
    queryKey: ["hotels", cityParam, selectedStars, keywordParam, pageParam, sizeParam, sortParam],
    queryFn: () =>
      hotelApi.search({
        city: cityParam || undefined,
        stars: selectedStars,
        keyword: keywordParam || undefined,
        status: "active",
        page: pageParam,
        size: sizeParam,
        sort: sortParam,
      }),
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (cityInput) newParams.set("city", cityInput);
    else newParams.delete("city");

    if (selectedStars !== undefined) newParams.set("stars", selectedStars.toString());
    else newParams.delete("stars");

    newParams.set("page", "0"); // Reset to first page
    setSearchParams(newParams);
  };

  const handleSortChange = (sortVal: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("sort", sortVal);
    newParams.set("page", "0");
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", newPage.toString());
    setSearchParams(newParams);
  };

  const handleStarsCheckboxChange = (stars: number) => {
    if (selectedStars === stars) {
      setSelectedStars(undefined);
    } else {
      setSelectedStars(stars);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const hotels = data?.data?.content || [];
  const totalPages = data?.data?.totalPages || 0;
  const totalElements = data?.data?.totalElements || 0;

  // Render mock images since the backend seed doesn't have image list fields in list endpoint.
  const getMockHotelImage = (id: number) => {
    const images = [
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=800",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=800",
    ];
    return images[(id - 1) % images.length];
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 w-full flex-grow">
        {/* Breadcrumbs */}
        <div className="text-xs text-slate-400 mb-2">
          <span>Việt Nam</span> &gt; <span className="text-slate-600 font-medium">{cityParam || "Tất cả điểm đến"}</span>
        </div>

        {/* Title and Result Count */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            Khách sạn tại {cityParam || "Việt Nam"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Tìm thấy {totalElements} chỗ nghỉ phù hợp với tiêu chí của bạn
          </p>
        </div>

        {/* Sorting and Map View Toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 mb-8 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-slate-400 font-medium mr-2">Sắp xếp theo:</span>
            <button
              onClick={() => handleSortChange("price,asc")}
              className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition ${
                sortParam.includes("price") && sortParam.includes("asc")
                  ? "bg-brand-50 text-brand-600"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Giá thấp nhất
            </button>
            <button
              onClick={() => handleSortChange("stars,desc")}
              className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition ${
                sortParam.includes("stars") && sortParam.includes("desc")
                  ? "bg-brand-50 text-brand-600"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Đánh giá cao nhất
            </button>
            <button
              onClick={() => handleSortChange("id,desc")}
              className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition ${
                sortParam.includes("id") && sortParam.includes("desc")
                  ? "bg-brand-50 text-brand-600"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Mới nhất
            </button>
          </div>

          <button className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 bg-brand-50 border border-brand-100 hover:bg-brand-100 px-3 py-2 rounded-lg transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span>Xem bản đồ</span>
          </button>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="flex flex-col gap-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit">
            <form onSubmit={handleSearchSubmit} className="flex flex-col gap-4">
              <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3 mb-2">
                Bộ lọc tìm kiếm
              </h3>

              {/* City Input Search */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Thành phố</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nhập thành phố..."
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500 text-slate-700"
                  />
                  <button
                    type="submit"
                    className="bg-brand-600 hover:bg-brand-700 text-white rounded-lg p-2 transition cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </form>

            {/* Price Range Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-3">Khoảng giá</label>
              <input
                type="range"
                min="0"
                max="20000000"
                step="500000"
                value={priceRange}
                onChange={(e) => setPriceRange(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
              <div className="flex justify-between text-xs font-semibold text-slate-500 mt-2">
                <span>0đ</span>
                <span className="text-brand-600">{priceRange.toLocaleString("vi-VN")}đ+</span>
              </div>
            </div>

            {/* Stars Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-3">Xếp hạng sao</label>
              <div className="flex flex-col gap-2.5">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <label key={stars} className="flex items-center gap-2.5 text-sm text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedStars === stars}
                      onChange={() => handleStarsCheckboxChange(stars)}
                      className="h-4.5 w-4.5 rounded border-slate-200 text-brand-600 focus:ring-brand-500 cursor-pointer"
                    />
                    <span className="flex items-center gap-0.5 text-amber-500">
                      {Array.from({ length: stars }).map((_, i) => (
                        <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Amenities Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-3">Tiện nghi</label>
              <div className="flex flex-col gap-2.5">
                {["Bể bơi vô cực", "Wifi miễn phí", "Phòng Gym", "Bữa sáng miễn phí"].map((amenity) => (
                  <label key={amenity} className="flex items-center gap-2.5 text-sm text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedAmenities.includes(amenity)}
                      onChange={() => toggleAmenity(amenity)}
                      className="h-4.5 w-4.5 rounded border-slate-200 text-brand-600 focus:ring-brand-500 cursor-pointer"
                    />
                    <span>{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Accommodation Type */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-3">Loại chỗ ở</label>
              <div className="flex flex-col gap-2.5">
                {["Khách sạn", "Resort & Spa", "Căn hộ dịch vụ"].map((type) => (
                  <label key={type} className="flex items-center gap-2.5 text-sm text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(type)}
                      onChange={() => toggleType(type)}
                      className="h-4.5 w-4.5 rounded border-slate-200 text-brand-600 focus:ring-brand-500 cursor-pointer"
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Hotels Grid */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
                <p className="text-slate-400 text-sm font-medium mt-4">Đang tải danh sách khách sạn...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center bg-red-50 text-red-700 rounded-2xl border border-red-100">
                <p className="font-semibold">Lỗi tải dữ liệu</p>
                <p className="text-sm mt-1">{getErrorMessage(error)}</p>
              </div>
            ) : hotels.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center px-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p className="text-slate-500 font-semibold mt-4">Không tìm thấy khách sạn nào</p>
                <p className="text-slate-400 text-sm mt-1">Hãy thử thay đổi từ khóa hoặc bộ lọc tìm kiếm.</p>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-6">
                  {hotels.map((hotel) => (
                    <div
                      key={hotel.id}
                      className="flex flex-col md:flex-row bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group"
                    >
                      {/* Image Container */}
                      <div className="relative w-full md:w-80 h-56 md:h-auto overflow-hidden">
                        <img
                          src={getMockHotelImage(hotel.id)}
                          alt={hotel.name}
                          className="h-full w-full object-cover group-hover:scale-103 transition-all duration-500"
                        />
                        <button className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white text-slate-600 hover:text-red-500 rounded-full transition shadow-sm cursor-pointer">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                        <span className="absolute top-4 left-4 bg-brand-600 text-white text-[10px] uppercase font-bold py-1 px-2.5 rounded shadow-sm">
                          Phổ biến nhất
                        </span>
                      </div>

                      {/* Info Container */}
                      <div className="flex-1 p-6 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-0.5 text-amber-400 mb-1.5">
                            {Array.from({ length: hotel.stars }).map((_, i) => (
                              <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>

                          <h3 className="text-xl font-bold text-slate-800 hover:text-brand-600 transition">
                            {hotel.name}
                          </h3>

                          <p className="text-xs text-slate-400 font-medium mt-1 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            {hotel.address}, {hotel.city}
                          </p>

                          <p className="text-slate-500 text-sm mt-3.5 line-clamp-2 leading-relaxed">
                            {hotel.description}
                          </p>

                          {/* Quick Badges */}
                          <div className="flex gap-2 mt-4.5 flex-wrap">
                            <span className="bg-slate-50 text-slate-500 border border-slate-100 text-[10px] font-semibold px-2 py-0.5 rounded-full">Bể bơi</span>
                            <span className="bg-slate-50 text-slate-500 border border-slate-100 text-[10px] font-semibold px-2 py-0.5 rounded-full">Wifi</span>
                            <span className="bg-slate-50 text-slate-500 border border-slate-100 text-[10px] font-semibold px-2 py-0.5 rounded-full">Spa</span>
                          </div>
                        </div>

                        {/* Booking CTA Row */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-t border-slate-50 pt-5 mt-6">
                          <div className="flex items-center gap-2">
                            <span className="bg-emerald-50 text-emerald-600 font-bold text-xs px-2.5 py-1 rounded-lg">9.8</span>
                            <div>
                              <p className="text-xs font-bold text-slate-700">Tuyệt hảo</p>
                              <p className="text-[10px] text-slate-400">1.2k đánh giá</p>
                            </div>
                          </div>

                          <div className="flex items-end gap-4 w-full sm:w-auto justify-between sm:justify-end">
                            <div className="text-right">
                              {hotel.price && hotel.price > 0 ? (
                                <>
                                  <p className="text-[10px] text-slate-400 line-through">
                                    {(Math.round(hotel.price * 1.25)).toLocaleString("vi-VN")}đ
                                  </p>
                                  <p className="text-lg font-extrabold text-brand-600">
                                    {hotel.price.toLocaleString("vi-VN")}đ <span className="text-xs font-normal text-slate-400">/ đêm</span>
                                  </p>
                                </>
                              ) : (
                                <p className="text-sm font-semibold text-slate-500">Liên hệ đặt phòng</p>
                              )}
                            </div>

                            <button
                              onClick={() => navigate(ROUTES.HOTEL_DETAIL.replace(":id", hotel.id.toString()))}
                              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition cursor-pointer"
                            >
                              Xem chi tiết
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-1.5 mt-8 text-sm font-semibold">
                    <button
                      onClick={() => handlePageChange(pageParam - 1)}
                      disabled={pageParam === 0}
                      className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      &larr;
                    </button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => handlePageChange(i)}
                        className={`w-9 h-9 rounded-lg border transition cursor-pointer ${
                          pageParam === i
                            ? "bg-brand-600 border-brand-600 text-white shadow-sm shadow-brand-600/10"
                            : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(pageParam + 1)}
                      disabled={pageParam === totalPages - 1}
                      className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      &rarr;
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
