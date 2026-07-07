import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "../components/Header";
import { hotelApi } from "../services/hotelApi";
import { useAuthStore } from "../store/authStore";
import { getErrorMessage } from "../services/apiClient";
import { Role } from "../types/auth";
import type { HotelResponseDTO, HotelCreateDTO } from "../types/hotel";

export function ManagerHotelsPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === Role.ADMIN;

  const [page, setPage] = useState(0);
  const size = 10;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<HotelResponseDTO | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stars, setStars] = useState(5);
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [formError, setFormError] = useState<string | null>(null);

  // Image Upload state
  const [uploadingId, setUploadingId] = useState<number | null>(null);

  // Query hotels
  const { data, isLoading, error } = useQuery({
    queryKey: ["managerHotels", page],
    queryFn: () =>
      hotelApi.getAll({
        page,
        size,
        sort: "createdAt,desc",
      }),
  });

  const hotels = data?.data?.content || [];
  const totalPages = data?.data?.totalPages || 0;

  // Mutations
  const createMutation = useMutation({
    mutationFn: (body: HotelCreateDTO) => hotelApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["managerHotels"] });
      closeModal();
      alert("Tạo khách sạn mới thành công!");
    },
    onError: (err) => {
      setFormError(getErrorMessage(err, "Không thể tạo khách sạn."));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: HotelCreateDTO }) =>
      hotelApi.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["managerHotels"] });
      closeModal();
      alert("Cập nhật thông tin khách sạn thành công!");
    },
    onError: (err) => {
      setFormError(getErrorMessage(err, "Không thể cập nhật khách sạn."));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => hotelApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["managerHotels"] });
      alert("Xóa khách sạn thành công!");
    },
    onError: (err) => {
      alert(getErrorMessage(err, "Xóa khách sạn thất bại."));
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      hotelApi.uploadImage(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["managerHotels"] });
      setUploadingId(null);
      alert("Tải ảnh lên thành công!");
    },
    onError: (err) => {
      alert(getErrorMessage(err, "Tải ảnh thất bại."));
      setUploadingId(null);
    },
  });

  const openModal = (hotel: HotelResponseDTO | null = null) => {
    setFormError(null);
    if (hotel) {
      setEditingHotel(hotel);
      setName(hotel.name);
      setAddress(hotel.address);
      setCity(hotel.city);
      setStars(hotel.stars);
      setDescription(hotel.description);
      setStatus(hotel.status);
    } else {
      setEditingHotel(null);
      setName("");
      setAddress("");
      setCity("");
      setStars(5);
      setDescription("");
      setStatus("active");
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingHotel(null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address || !city) {
      setFormError("Vui lòng nhập tên, địa chỉ và thành phố.");
      return;
    }

    const payload: HotelCreateDTO = {
      name,
      address,
      city,
      stars,
      description,
      status,
    };

    if (editingHotel) {
      updateMutation.mutate({ id: editingHotel.id, body: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDeleteClick = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa khách sạn này không? Thao tác này không thể hoàn tác.")) {
      deleteMutation.mutate(id);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, hotelId: number) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploadingId(hotelId);
      uploadImageMutation.mutate({ id: hotelId, file });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 w-full flex-grow">
        {/* Title and Action Button */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">Quản lý khách sạn</h1>
            <p className="text-slate-400 text-sm mt-1">Danh sách hệ thống khách sạn trực thuộc HotelNow</p>
          </div>
          <button
            onClick={() => openModal(null)}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs shadow-md transition hover:scale-[1.01] cursor-pointer"
          >
            + Thêm khách sạn
          </button>
        </div>

        {/* Hotels Table List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
            <p className="text-slate-400 text-sm font-medium mt-4">Đang tải danh sách khách sạn...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-red-50 text-red-700 rounded-2xl border border-red-100 shadow-sm">
            <p className="font-semibold">Lỗi tải danh sách</p>
            <p className="text-sm mt-1">{getErrorMessage(error)}</p>
          </div>
        ) : hotels.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center px-4">
            <p className="text-slate-500 font-semibold">Chưa có khách sạn nào được tạo</p>
            <p className="text-slate-400 text-sm mt-1">Bấm nút "Thêm khách sạn" phía trên để tạo.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase text-[9px] tracking-wider">
                  <tr>
                    <th className="py-4 px-6">ID</th>
                    <th className="py-4 px-6">Tên khách sạn</th>
                    <th className="py-4 px-6">Địa chỉ</th>
                    <th className="py-4 px-6">Thành phố</th>
                    <th className="py-4 px-6">Xếp hạng</th>
                    <th className="py-4 px-6">Trạng thái</th>
                    <th className="py-4 px-6 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700">
                  {hotels.map((hotel) => (
                    <tr key={hotel.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-4.5 px-6 font-extrabold text-slate-800">#{hotel.id}</td>
                      <td className="py-4.5 px-6 font-bold text-slate-800">{hotel.name}</td>
                      <td className="py-4.5 px-6 font-medium text-slate-500">{hotel.address}</td>
                      <td className="py-4.5 px-6 font-semibold">{hotel.city}</td>
                      <td className="py-4.5 px-6 text-amber-500 font-bold">{hotel.stars} ★</td>
                      <td className="py-4.5 px-6">
                        <span className={`px-2.5 py-0.5 border rounded-full text-[9px] uppercase font-bold ${
                          hotel.status === "active"
                            ? "bg-green-50 text-green-700 border-green-100"
                            : "bg-slate-50 text-slate-700 border-slate-100"
                        }`}>
                          {hotel.status === "active" ? "Hoạt động" : "Ngừng"}
                        </span>
                      </td>
                      <td className="py-4.5 px-6 text-right flex justify-end gap-1.5 items-center">
                        {/* Image upload label */}
                        <label className="px-2 py-1 border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 rounded-lg cursor-pointer transition text-[11px] font-semibold flex items-center gap-1">
                          {uploadingId === hotel.id ? "Đang tải..." : "Tải ảnh"}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, hotel.id)}
                            className="hidden"
                            disabled={uploadingId === hotel.id}
                          />
                        </label>

                        <button
                          onClick={() => openModal(hotel)}
                          className="px-2 py-1 border border-brand-100 text-brand-600 bg-brand-50/30 hover:bg-brand-50 rounded-lg transition text-[11px] font-semibold cursor-pointer"
                        >
                          Sửa
                        </button>

                        {/* Delete button only visible to Admin */}
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteClick(hotel.id)}
                            className="px-2 py-1 border border-red-100 text-red-600 bg-red-50/30 hover:bg-red-50 rounded-lg transition text-[11px] font-semibold cursor-pointer"
                          >
                            Xóa
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-1.5 p-5 border-t border-slate-50 text-sm font-semibold">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0}
                  className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  &larr;
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`w-9 h-9 rounded-lg border transition cursor-pointer ${
                      page === i
                        ? "bg-brand-600 border-brand-600 text-white"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages - 1}
                  className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  &rarr;
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <h3 className="font-bold text-base">
                {editingHotel ? "Cập nhật khách sạn" : "Thêm khách sạn mới"}
              </h3>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-white transition text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-5 flex flex-col gap-4">
              {/* Hotel Name */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tên khách sạn</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Khách sạn Grand Palace"
                  className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-xs outline-none focus:border-brand-500 text-slate-700"
                />
              </div>

              {/* Address & City */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Địa chỉ</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Luxury Road"
                    className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-xs outline-none focus:border-brand-500 text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Thành phố</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ha Noi"
                    className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-xs outline-none focus:border-brand-500 text-slate-700"
                  />
                </div>
              </div>

              {/* Stars & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Xếp hạng sao</label>
                  <select
                    value={stars}
                    onChange={(e) => setStars(parseInt(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none text-slate-700"
                  >
                    {[5, 4, 3, 2, 1].map((s) => (
                      <option key={s} value={s}>{s} sao</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Trạng thái hoạt động</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as "active" | "inactive")}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none text-slate-700"
                  >
                    <option value="active">Hoạt động (Active)</option>
                    <option value="inactive">Tạm ngưng (Inactive)</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Mô tả khách sạn</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Nhập thông tin mô tả chi tiết của khách sạn..."
                  className="w-full border border-slate-200 rounded-lg p-3.5 text-xs outline-none focus:border-brand-500 text-slate-700"
                />
              </div>

              {formError && (
                <p className="bg-red-50 text-red-700 border border-red-100 rounded-lg px-3 py-2 text-xs">
                  {formError}
                </p>
              )}

              {/* Modal Buttons */}
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-xs shadow-md transition cursor-pointer disabled:opacity-60"
                >
                  {createMutation.isPending || updateMutation.isPending ? "Đang lưu..." : "Xác nhận lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
