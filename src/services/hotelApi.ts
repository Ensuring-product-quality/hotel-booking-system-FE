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
      .get<StandardResponse<PageResponse<HotelResponseDTO>>>("/hotels/search", { params })
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

  uploadImage: (id: number, file: File, replaceIndex?: number) => {
    const formData = new FormData();
    formData.append("file", file);
    const url = replaceIndex !== undefined && replaceIndex !== null
      ? `/hotels/${id}/images?replaceIndex=${replaceIndex}`
      : `/hotels/${id}/images`;
    return apiClient
      .post<StandardResponse<string>>(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => res.data);
  },
};


