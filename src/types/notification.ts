export interface NotificationResponseDTO {
  id: number;
  userId: number;
  message: string;
  status: "unread" | "read";
  createdAt: string;
}
