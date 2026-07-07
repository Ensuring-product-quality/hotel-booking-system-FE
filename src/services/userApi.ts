import { apiClient } from "./apiClient";
import type { StandardResponse, PageResponse, PageQuery } from "../types/common";
import type { User } from "../types/auth";

export interface UserFilterQuery extends PageQuery {
  role?: string;
  status?: string;
  keyword?: string;
  createdFrom?: string;
  createdTo?: string;
}

export interface UserCreateDTO {
  username: string;
  password?: string;
  email: string;
  role: string;
  status: string;
}

export interface UserUpdateDTO {
  email?: string;
  status?: string;
}

export const userApi = {
  getAll: (params?: UserFilterQuery) =>
    apiClient
      .get<StandardResponse<PageResponse<User>>>("/users", { params })
      .then((res) => res.data),

  getById: (id: number) =>
    apiClient
      .get<StandardResponse<User & { bookings?: any[] }>>(`/users/${id}`)
      .then((res) => res.data),

  create: (body: UserCreateDTO) =>
    apiClient
      .post<StandardResponse<User>>("/users", body)
      .then((res) => res.data),

  update: (id: number, body: UserUpdateDTO) =>
    apiClient
      .put<StandardResponse<User>>(`/users/${id}`, body)
      .then((res) => res.data),

  delete: (id: number) =>
    apiClient
      .delete<StandardResponse<null>>(`/users/${id}`)
      .then((res) => res.data),

  updateAvatar: (id: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient
      .put<StandardResponse<string>>(`/users/${id}/avatar`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => res.data);
  },
};
