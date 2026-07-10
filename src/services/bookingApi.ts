import { apiClient } from "./apiClient";
import type { StandardResponse, PageResponse, PageQuery } from "../types/common";
import type {
  BookingResponseDTO,
  BookingDetailDTO,
  BookingCreateDTO,
  BookingUpdateDTO,
} from "../types/booking";

export interface BookingFilterQuery extends PageQuery {
  userId?: number;
  status?: string;
  keyword?: string;
  createdFrom?: string;
  createdTo?: string;
}

export const bookingApi = {
  create: (body: BookingCreateDTO) =>
    apiClient
      .post<StandardResponse<BookingResponseDTO>>("/bookings", body)
      .then((res) => res.data),

  getAll: (params?: BookingFilterQuery) =>
    apiClient
      .get<StandardResponse<PageResponse<BookingResponseDTO>>>("/bookings", { params })
      .then((res) => res.data),

  getById: (id: number) =>
    apiClient
      .get<StandardResponse<BookingDetailDTO>>(`/bookings/${id}`)
      .then((res) => res.data),

  checkAvailability: (bookingId: number) =>
    apiClient
      .get<StandardResponse<boolean>>(`/bookings/${bookingId}/availability`)
      .then((res) => res.data),

  getPaymentStatus: (bookingId: number) =>
    apiClient
      .get<StandardResponse<string>>(`/bookings/${bookingId}/payment-status`)
      .then((res) => res.data),

  update: (id: number, body: BookingUpdateDTO) =>
    apiClient
      .put<StandardResponse<BookingResponseDTO>>(`/bookings/${id}`, body)
      .then((res) => res.data),

  delete: (id: number) =>
    apiClient
      .delete<StandardResponse<null>>(`/bookings/${id}`)
      .then((res) => res.data),

  publicLookup: (bookingId: number, email: string) =>
    apiClient
      .get<StandardResponse<BookingDetailDTO>>("/bookings/public/lookup", {
        params: { bookingId, email },
      })
      .then((res) => res.data),
};
