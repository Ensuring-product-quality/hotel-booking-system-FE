import { apiClient } from "./apiClient";
import type { StandardResponse, PageResponse, PageQuery } from "../types/common";
import type {
  RoomResponseDTO,
  RoomDetailDTO,
  RoomCreateDTO,
  RoomUpdateDTO,
} from "../types/room";

export interface RoomFilterQuery extends PageQuery {
  hotelId?: number;
  available?: boolean;
  keyword?: string;
  status?: string;
}

export const roomApi = {
  getAll: (params?: RoomFilterQuery) =>
    apiClient
      .get<StandardResponse<PageResponse<RoomResponseDTO>>>("/rooms", { params })
      .then((res) => res.data),

  getById: (id: number) =>
    apiClient
      .get<StandardResponse<RoomDetailDTO>>(`/rooms/${id}`)
      .then((res) => res.data),

  getImages: (id: number) =>
    apiClient
      .get<StandardResponse<string[]>>(`/rooms/${id}/images`)
      .then((res) => res.data),

  create: (body: RoomCreateDTO) =>
    apiClient
      .post<StandardResponse<RoomResponseDTO>>("/rooms", body)
      .then((res) => res.data),

  update: (id: number, body: RoomUpdateDTO) =>
    apiClient
      .put<StandardResponse<RoomResponseDTO>>(`/rooms/${id}`, body)
      .then((res) => res.data),

  delete: (id: number) =>
    apiClient
      .delete<StandardResponse<null>>(`/rooms/${id}`)
      .then((res) => res.data),
};
