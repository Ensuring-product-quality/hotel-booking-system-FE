// Kiểu response chuẩn mà backend trả về cho MỌI endpoint.
export interface StandardResponse<T = unknown> {
  success: boolean;
  message: string;
  timestamp: string;
  status: number;
  data?: T;
}

// Kiểu dữ liệu phân trang phổ biến (điều chỉnh lại field name nếu backend
// trả về khác, ví dụ Spring Data thường dùng "content"/"totalElements").
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface PageQuery {
  page?: number;
  size?: number;
  sort?: string;
  keyword?: string;
}
