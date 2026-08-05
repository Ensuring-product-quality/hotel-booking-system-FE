import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { hotelApi } from "../services/hotelApi";
import { getErrorMessage } from "../services/apiClient";
import { ROUTES } from "../constants/routes";
import { getMediaUrl, handleImageError, DEFAULT_HOTEL_IMAGE } from "../utils/imageUtils";

export function HotelsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Parse applied query parameters (from URL)
  const cityParam    = searchParams.get("city") || "";
  const starsParam   = searchParams.get("stars") ? parseInt(searchParams.get("stars")!) : undefined;
  const keywordParam = searchParams.get("keyword") || "";
  const minPriceParam = searchParams.get("minPrice") ? parseInt(searchParams.get("minPrice")!) : undefined;
  const maxPriceParam = searchParams.get("maxPrice") ? parseInt(searchParams.get("maxPrice")!) : undefined;
  const pageParam    = searchParams.get("page") ? parseInt(searchParams.get("page")!) : 0;
  const sizeParam    = searchParams.get("size") ? parseInt(searchParams.get("size")!) : 6;
  const sortParam    = searchParams.get("sort") || "id,asc";

  // ── PENDING (UI) states — changed by user but NOT yet applied ──
  const [pendingCity,       setPendingCity]       = useState(cityParam);
  const [pendingStars,      setPendingStars]      = useState<number | undefined>(starsParam);
  const [pendingMinPrice,   setPendingMinPrice]   = useState<number>(minPriceParam ?? 0);
  const [pendingMaxPrice,   setPendingMaxPrice]   = useState<number>(maxPriceParam ?? 20000000);
  const [pendingAmenities,  setPendingAmenities]  = useState<string[]>([]);
  const [pendingTypes,      setPendingTypes]      = useState<string[]>([]);


  // Sync pending states when URL changes (e.g. nav from HomePage)
  useEffect(() => {
    setPendingCity(cityParam);
    setPendingStars(starsParam);
    setPendingMinPrice(minPriceParam ?? 0);
    setPendingMaxPrice(maxPriceParam ?? 20000000);
  }, [cityParam, starsParam, minPriceParam, maxPriceParam]);

  // Fetch hotels — uses APPLIED params from URL only
  const { data, isLoading, error } = useQuery({
    queryKey: ["hotels", cityParam, starsParam, keywordParam, minPriceParam, maxPriceParam, pageParam, sizeParam, sortParam],
    queryFn: () =>
      hotelApi.search({
        city:     cityParam || undefined,
        stars:    starsParam,
        keyword:  keywordParam || undefined,
        status:   "active",
        minPrice: minPriceParam,
        maxPrice: maxPriceParam,
        page:     pageParam,
        size:     sizeParam,
        sort:     sortParam,
      }),
  });

  // Apply all pending filters → update URL → triggers re-fetch
  const handleApplyFilters = () => {
    const newParams = new URLSearchParams(searchParams);
    if (pendingCity)  newParams.set("city",  pendingCity);
    else              newParams.delete("city");

    if (pendingStars !== undefined) newParams.set("stars", pendingStars.toString());
    else                            newParams.delete("stars");

    if (pendingMinPrice > 0) newParams.set("minPrice", pendingMinPrice.toString());
    else                     newParams.delete("minPrice");

    if (pendingMaxPrice < 20000000) newParams.set("maxPrice", pendingMaxPrice.toString());
    else                            newParams.delete("maxPrice");

    newParams.set("page", "0");
    setSearchParams(newParams);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setPendingCity("");
    setPendingStars(undefined);
    setPendingMinPrice(0);
    setPendingMaxPrice(20000000);
    setPendingAmenities([]);
    setPendingTypes([]);
    const newParams = new URLSearchParams();
    newParams.set("page", "0");
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

  const hasActiveFilters =
    !!cityParam || starsParam !== undefined || minPriceParam !== undefined || maxPriceParam !== undefined;

  const hotels       = data?.data?.content || [];
  const totalPages   = data?.data?.totalPages || 0;
  const totalElements = data?.data?.totalElements || 0;


  return (
    <div className="flex flex-col flex-1">

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
              onClick={() => handleSortChange("averageRating,desc")}
              className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition ${
                sortParam.includes("averageRating") && sortParam.includes("desc")
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
            <i className="fa-solid fa-map-location-dot"></i>
            <span>Xem bản đồ</span>
          </button>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="flex flex-col gap-5 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm h-fit sticky top-24">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <i className="fa-solid fa-sliders text-brand-500 text-sm"></i>
                Bộ lọc tìm kiếm
              </h3>
              {hasActiveFilters && (
                <span className="text-[10px] font-bold bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full border border-brand-100">
                  Đang lọc
                </span>
              )}
            </div>

            {/* City Input */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Thành phố</label>
              <input
                type="text"
                placeholder="Nhập thành phố..."
                value={pendingCity}
                onChange={(e) => setPendingCity(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-100 text-slate-700 transition"
              />
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-3">Khoảng giá / đêm</label>
              {/* Min price */}
              <div className="mb-3">
                <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                  <span>Từ</span>
                  <span className="font-semibold text-slate-700">{pendingMinPrice.toLocaleString("vi-VN")}đ</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20000000"
                  step="500000"
                  value={pendingMinPrice}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setPendingMinPrice(Math.min(val, pendingMaxPrice - 500000));
                  }}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-600"
                />
              </div>
              {/* Max price */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                  <span>Đến</span>
                  <span className="font-semibold text-brand-600">
                    {pendingMaxPrice >= 20000000 ? "Không giới hạn" : `${pendingMaxPrice.toLocaleString("vi-VN")}đ`}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20000000"
                  step="500000"
                  value={pendingMaxPrice}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setPendingMaxPrice(Math.max(val, pendingMinPrice + 500000));
                  }}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-600"
                />
              </div>
            </div>

            {/* Stars Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-3">Xếp hạng sao</label>
              <div className="flex flex-col gap-2">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <label key={stars} className="flex items-center gap-2.5 text-sm text-slate-600 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={pendingStars === stars}
                      onChange={() => setPendingStars(pendingStars === stars ? undefined : stars)}
                      className="h-4 w-4 rounded border-slate-200 text-brand-600 focus:ring-brand-500 cursor-pointer"
                    />
                    <span className="flex items-center gap-0.5 text-amber-400">
                      {Array.from({ length: stars }).map((_, i) => (
                        <i key={i} className="fa-solid fa-star text-xs"></i>
                      ))}
                    </span>
                    <span className="text-xs text-slate-500">{stars} sao</span>
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
                      checked={pendingAmenities.includes(amenity)}
                      onChange={() => setPendingAmenities((prev) =>
                        prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
                      )}
                      className="h-4 w-4 rounded border-slate-200 text-brand-600 focus:ring-brand-500 cursor-pointer"
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
                      checked={pendingTypes.includes(type)}
                      onChange={() => setPendingTypes((prev) =>
                        prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
                      )}
                      className="h-4 w-4 rounded border-slate-200 text-brand-600 focus:ring-brand-500 cursor-pointer"
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* ── Apply & Reset Buttons ── */}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={handleApplyFilters}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-sm transition shadow-sm shadow-brand-600/20 cursor-pointer flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-filter text-xs"></i>
                Áp dụng bộ lọc
              </button>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="w-full py-2 text-slate-500 hover:text-red-600 font-semibold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2 hover:bg-red-50"
                >
                  <i className="fa-solid fa-rotate-left text-xs"></i>
                  Xóa bộ lọc
                </button>
              )}
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
                <i className="fa-solid fa-hotel text-4xl text-slate-350 mb-2"></i>
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
                      <div className="relative w-full md:w-80 h-56 md:h-auto overflow-hidden bg-slate-100">
                        <img
                          src={getMediaUrl(hotel.images?.[0], DEFAULT_HOTEL_IMAGE)}
                          onError={(e) => handleImageError(e, DEFAULT_HOTEL_IMAGE)}
                          alt={hotel.name}
                          className="h-full w-full object-cover group-hover:scale-103 transition-all duration-500"
                        />
                        <button className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white text-slate-600 hover:text-red-500 rounded-full transition shadow-sm cursor-pointer flex items-center justify-center w-8 h-8">
                          <i className="fa-regular fa-heart text-sm"></i>
                        </button>
                      </div>

                      {/* Info Container */}
                      <div className="flex-1 p-6 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-0.5 text-amber-400 mb-1.5">
                            {Array.from({ length: hotel.stars }).map((_, i) => (
                              <i key={i} className="fa-solid fa-star text-xs"></i>
                            ))}
                          </div>

                          <h3 className="text-xl font-bold text-slate-800 hover:text-brand-600 transition">
                            {hotel.name}
                          </h3>

                          <p className="text-xs text-slate-400 font-medium mt-1 flex items-center gap-1.5">
                            <i className="fa-solid fa-location-dot text-slate-450"></i>
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
                            <span className="bg-emerald-50 text-emerald-600 font-bold text-xs px-2.5 py-1 rounded-lg">{hotel.averageRating.toFixed(1)}</span>
                            <div>
                              <p className="text-xs font-bold text-slate-700">Điểm đánh giá</p>
                              <p className="text-[10px] text-slate-400">Dữ liệu từ hệ thống</p>
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
