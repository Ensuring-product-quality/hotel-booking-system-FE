import { apiClient } from "./apiClient";
import type { StandardResponse } from "../types/common";
import type { ReviewResponseDTO, ReviewCreateDTO, ReviewUpdateDTO } from "../types/review";

export const reviewApi = {
  create: (body: ReviewCreateDTO) =>
    apiClient
      .post<StandardResponse<ReviewResponseDTO>>("/reviews", body)
      .then((res) => res.data),

  update: (id: number, body: ReviewUpdateDTO) =>
    apiClient
      .put<StandardResponse<ReviewResponseDTO>>(`/reviews/${id}`, body)
      .then((res) => res.data),

  delete: (id: number) =>
    apiClient
      .delete<StandardResponse<null>>(`/reviews/${id}`)
      .then((res) => res.data),
};
