import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { roomApi } from "../services/roomApi";
import { hotelApi } from "../services/hotelApi";
import { useAuthStore } from "../store/authStore";
import { getErrorMessage } from "../services/apiClient";
import { Role } from "../types/auth";
import type { RoomResponseDTO, RoomCreateDTO } from "../types/room";

export function ManagerRoomsPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === Role.ADMIN;

  const [page, setPage] = useState(0);
  const size = 10;

  // Search/Filter states
  const [selectedHotelId, setSelectedHotelId] = useState<number | undefined>(undefined);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomResponseDTO | null>(null);

  // Form states
  const [hotelId, setHotelId] = useState<number>(0);
  const [roomNumber, setRoomNumber] = useState("");
  const [type, setType] = useState("Standard");
  const [price, setPrice] = useState(50);
  const [capacity, setCapacity] = useState(1);
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [formError, setFormError] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);

  // Query all hotels to populate dropdown list
  const { data: hotelsData } = useQuery({
    queryKey: ["managerHotelsList"],
    queryFn: () => hotelApi.getAll({ size: 100 }),
  });
  const hotelsList = hotelsData?.data?.content || [];

  // Query rooms
  const { data, isLoading, error } = useQuery({
    queryKey: ["managerRooms", selectedHotelId, page],
    queryFn: () =>
      roomApi.getAll({
        hotelId: selectedHotelId,
        page,
        size,
        sort: "createdAt,desc",
      }),
  });

  const rooms = data?.data?.content || [];
  const totalPages = data?.data?.totalPages || 0;

  // Mutations
  const createMutation = useMutation({
    mutationFn: (body: RoomCreateDTO) => roomApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["managerRooms"] });
      queryClient.invalidateQueries({ queryKey: ["staffRoomsReal"] });
      queryClient.invalidateQueries({ queryKey: ["hotel"] });
      closeModal();
      alert("Tạo phòng mới thành công!");
    },
    onError: (err) => {
      setFormError(getErrorMessage(err, "Không thể tạo phòng."));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Omit<RoomCreateDTO, "hotelId"> }) =>
      roomApi.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["managerRooms"] });
      queryClient.invalidateQueries({ queryKey: ["staffRoomsReal"] });
      queryClient.invalidateQueries({ queryKey: ["hotel"] });
      closeModal();
      alert("Cập nhật phòng thành công!");
    },
    onError: (err) => {
      setFormError(getErrorMessage(err, "Không thể cập nhật phòng."));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => roomApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["managerRooms"] });
      queryClient.invalidateQueries({ queryKey: ["staffRoomsReal"] });
      queryClient.invalidateQueries({ queryKey: ["hotel"] });
      alert("Xóa phòng thành công!");
    },
    onError: (err) => {
      alert(getErrorMessage(err, "Xóa phòng thất bại."));
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      roomApi.uploadImage(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["managerRooms"] });
      queryClient.invalidateQueries({ queryKey: ["staffRoomsReal"] });
      queryClient.invalidateQueries({ queryKey: ["hotel"] });
      setUploadingId(null);
      alert("Tải ảnh phòng lên thành công!");
    },
    onError: (err) => {
      alert(getErrorMessage(err, "Tải ảnh phòng thất bại."));
      setUploadingId(null);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, roomId: number) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingId(roomId);
      uploadImageMutation.mutate({ id: roomId, file });
    }
  };

  const openModal = (room: RoomResponseDTO | null = null) => {
    setFormError(null);
    if (room) {
      setEditingRoom(room);
      setHotelId(room.hotelId);
      setRoomNumber(room.roomNumber);
      setType(room.type);
      setPrice(room.price);
      setCapacity(room.capacity);
      setDescription(room.description);
      setStatus(room.status);
    } else {
      setEditingRoom(null);
      setHotelId(hotelsList[0]?.id || 0);
      setRoomNumber("");
      setType("Standard");
      setPrice(50);
      setCapacity(1);
      setDescription("");
      setStatus("active");
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRoom(null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotelId || !roomNumber || price <= 0 || capacity < 1 || capacity > 20) {
      setFormError("Vui lòng chọn khách sạn, nhập số phòng và đơn giá.");
      return;
    }

    const payload: RoomCreateDTO = {
      hotelId,
      roomNumber,
      type,
      price,
      capacity,
      description,
      status,
    };

    if (editingRoom) {
      updateMutation.mutate({ id: editingRoom.id, body: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDeleteClick = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa phòng này không?")) {
      deleteMutation.mutate(id);
    }
  };

  const getHotelName = (id: number) => {
    const matched = hotelsList.find((h) => h.id === id);
    return matched ? matched.name : `Khách sạn #${id}`;
  };

  return (
    <div className="flex flex-col flex-1">

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 w-full flex-grow">
        {/* Title and Action */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">Quản lý phòng</h1>
            <p className="text-slate-400 text-sm mt-1">Danh sách quản lý phòng các khách sạn</p>
          </div>
          <button
            onClick={() => openModal(null)}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs shadow-md transition hover:scale-[1.01] cursor-pointer"
          >
            + Thêm phòng mới
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-8">
          <div className="flex items-center gap-3 w-full sm:w-auto text-xs font-semibold">
            <span className="text-slate-400">Lọc theo khách sạn:</span>
            <select
              value={selectedHotelId || ""}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedHotelId(val ? parseInt(val) : undefined);
                setPage(0);
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 outline-none text-slate-700 font-semibold"
            >
              <option value="">Tất cả khách sạn</option>
              {hotelsList.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Rooms Table */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
            <p className="text-slate-400 text-sm font-medium mt-4">Đang tải danh sách phòng...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-red-50 text-red-700 rounded-2xl border border-red-100">
            <p className="font-semibold">Lỗi tải dữ liệu</p>
            <p className="text-sm mt-1">{getErrorMessage(error)}</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center px-4">
            <p className="text-slate-500 font-semibold">Chưa có phòng nào được tạo</p>
            <p className="text-slate-400 text-sm mt-1">Chọn nút "Thêm phòng mới" ở trên để tạo.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase text-[9px] tracking-wider">
                  <tr>
                    <th className="py-4 px-6">ID</th>
                    <th className="py-4 px-6">Khách sạn</th>
                    <th className="py-4 px-6">Số phòng</th>
                    <th className="py-4 px-6">Loại phòng</th>
                    <th className="py-4 px-6">Đơn giá (VND / đêm)</th>
                    <th className="py-4 px-6">Trạng thái</th>
                    <th className="py-4 px-6 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700">
                  {rooms.map((room) => (
                    <tr key={room.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-4.5 px-6 font-extrabold text-slate-800">#{room.id}</td>
                      <td className="py-4.5 px-6 font-bold text-slate-800">{getHotelName(room.hotelId)}</td>
                      <td className="py-4.5 px-6 font-bold text-slate-600">Phòng {room.roomNumber}</td>
                      <td className="py-4.5 px-6 font-semibold">{room.type}</td>
                      <td className="py-4.5 px-6 font-semibold">{room.capacity} khách</td>
                      <td className="py-4.5 px-6 text-brand-600 font-bold">{room.price.toLocaleString("vi-VN")} VND</td>
                      <td className="py-4.5 px-6">
                        <span className={`px-2.5 py-0.5 border rounded-full text-[9px] uppercase font-bold ${
                          room.status === "active" || room.status === "available"
                            ? "bg-green-50 text-green-700 border-green-100"
                            : room.status === "occupied"
                            ? "bg-blue-50 text-blue-700 border-blue-100"
                            : room.status === "cleaning"
                            ? "bg-amber-50 text-amber-700 border-amber-100"
                            : room.status === "maintenance"
                            ? "bg-red-50 text-red-700 border-red-100"
                            : "bg-slate-50 text-slate-700 border-slate-100"
                        }`}>
                          {room.status === "active" || room.status === "available"
                            ? "Sẵn sàng"
                            : room.status === "occupied"
                            ? "Có khách"
                            : room.status === "cleaning"
                            ? "Dọn dẹp"
                            : room.status === "maintenance"
                            ? "Bảo trì"
                            : "Tạm ngưng"}
                        </span>
                      </td>
                      <td className="py-4.5 px-6 text-right flex justify-end gap-1.5 items-center">
                        <label className="px-2 py-1 border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 rounded-lg cursor-pointer transition text-[11px] font-semibold flex items-center gap-1">
                          {uploadingId === room.id ? "Đang tải..." : "Tải ảnh"}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, room.id)}
                            className="hidden"
                            disabled={uploadingId === room.id}
                          />
                        </label>
                        <button
                          onClick={() => openModal(room)}
                          className="px-2 py-1 border border-brand-100 text-brand-600 bg-brand-50/30 hover:bg-brand-50 rounded-lg transition text-[11px] font-semibold cursor-pointer"
                        >
                          Sửa
                        </button>
                        {(isAdmin || user?.role === Role.MANAGER) && (
                          <button
                            onClick={() => handleDeleteClick(room.id)}
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
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <h3 className="font-bold text-base">
                {editingRoom ? "Cập nhật phòng" : "Thêm phòng mới"}
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
              {/* Hotel Select */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Thuộc khách sạn</label>
                <select
                  value={hotelId}
                  onChange={(e) => setHotelId(parseInt(e.target.value))}
                  disabled={!!editingRoom}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none text-slate-700 disabled:bg-slate-50"
                >
                  {hotelsList.map((h) => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>

              {/* Room Number & Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Số phòng</label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="101"
                    className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-xs outline-none focus:border-brand-500 text-slate-700"
                  />
                </div>
                 <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Đơn giá (VND / đêm)</label>
                   <input
                     type="number"
                     value={price}
                     onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                     placeholder="2000000"
                     className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-xs outline-none focus:border-brand-500 text-slate-700"
                   />
                 </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Sức chứa (khách)</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={capacity}
                  onChange={(e) => setCapacity(parseInt(e.target.value, 10) || 1)}
                  className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-xs outline-none focus:border-brand-500 text-slate-700"
                />
              </div>

              {/* Type & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Loại phòng</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none text-slate-700"
                  >
                    {["Standard", "Deluxe", "Suite"].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Trạng thái</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none text-slate-700"
                  >
                    <option value="active">Hoạt động / Sẵn sàng (Active)</option>
                    <option value="occupied">Có khách (Occupied)</option>
                    <option value="cleaning">Đang dọn dẹp (Cleaning)</option>
                    <option value="maintenance">Bảo trì (Maintenance)</option>
                    <option value="inactive">Tạm ngưng (Inactive)</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Mô tả phòng</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Nhập thông tin mô tả chi tiết phòng..."
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
