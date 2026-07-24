import type { User } from "./auth";
import type { RoomResponseDTO } from "./room";

export const BookingStatus = {
  PENDING_PAYMENT: "pending_payment",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
} as const;

export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

export interface BookingResponseDTO {
  id: number;
  userId: number;
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  status: BookingStatus;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface BookingDetailDTO extends BookingResponseDTO {
  user: User;
  room: RoomResponseDTO;
  hotelName?: string;
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
}

export interface BookingCreateDTO {
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
}

export interface BookingUpdateDTO {
  checkInDate?: string;
  checkOutDate?: string;
  guests?: number;
  status?: BookingStatus;
}
