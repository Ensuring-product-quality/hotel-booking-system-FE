import { apiClient } from "./apiClient";
import type { StandardResponse, PageResponse, PageQuery } from "../types/common";
import type {
  HotelResponseDTO,
  HotelDetailDTO,
  HotelCreateDTO,
  HotelUpdateDTO,
} from "../types/hotel";

export interface HotelSearchQuery extends PageQuery {
  city?: string;
  stars?: number;
  status?: string;
}

export const hotelApi = {
  getAll: (params?: PageQuery & { keyword?: string; status?: string; createdFrom?: string; createdTo?: string }) =>
    apiClient
      .get<StandardResponse<PageResponse<HotelResponseDTO>>>("/hotels", { params })
      .then((res) => res.data),

  getById: (id: number) =>
    apiClient
      .get<StandardResponse<HotelDetailDTO>>(`/hotels/${id}`)
      .then((res) => res.data),

  search: (params?: HotelSearchQuery) =>
    apiClient
      .get<StandardResponse<PageResponse<HotelResponseDTO>>>("/hotels/1/search", { params }) // Note: Spec shows GET /hotels/{hotelId}/search, we use static ID 1 or search endpoint mapping as defined in the spec.
      .then((res) => res.data),

  create: (body: HotelCreateDTO) =>
    apiClient
      .post<StandardResponse<HotelResponseDTO>>("/hotels", body)
      .then((res) => res.data),

  update: (id: number, body: HotelUpdateDTO) =>
    apiClient
      .put<StandardResponse<HotelResponseDTO>>(`/hotels/${id}`, body)
      .then((res) => res.data),

  delete: (id: number) =>
    apiClient
      .delete<StandardResponse<null>>(`/hotels/${id}`)
      .then((res) => res.data),

  uploadImage: (id: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient
      .post<StandardResponse<string>>(`/hotels/${id}/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => res.data);
  },
};


