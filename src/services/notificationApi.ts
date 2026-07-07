import { apiClient } from "./apiClient";
import type { StandardResponse, PageResponse, PageQuery } from "../types/common";
import type { NotificationResponseDTO } from "../types/notification";

export interface NotificationFilterQuery extends PageQuery {
  status?: "unread" | "read";
}

export const notificationApi = {
  getAll: (params?: NotificationFilterQuery) =>
    apiClient
      .get<StandardResponse<PageResponse<NotificationResponseDTO>>>("/notifications", { params })
      .then((res) => res.data),

  markAsRead: (id: number) =>
    apiClient
      .post<StandardResponse<null>>(`/notifications/${id}/mark-as-read`)
      .then((res) => res.data),
};
