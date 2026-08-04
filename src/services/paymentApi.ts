import { apiClient } from "./apiClient";
import type { StandardResponse, PageResponse, PageQuery } from "../types/common";
import type { PaymentResponseDTO, PaymentCreateDTO } from "../types/payment";

export interface PaymentFilterQuery extends PageQuery {
  userId?: number;
  bookingId?: number;
  status?: string;
  createdFrom?: string;
  createdTo?: string;
}

export const paymentApi = {
  create: (body: PaymentCreateDTO) =>
    apiClient
      .post<StandardResponse<PaymentResponseDTO>>("/payments", body)
      .then((res) => res.data),

  getAll: (params?: PaymentFilterQuery) =>
    apiClient
      .get<StandardResponse<PageResponse<PaymentResponseDTO>>>("/payments", { params })
      .then((res) => res.data),
};
