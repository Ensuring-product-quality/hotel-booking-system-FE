import type { User } from "./auth";
import type { RoomResponseDTO } from "./room";

export const BookingStatus = {
  PENDING_PAYMENT: "pending_payment",
  CONFIRMED: "confirmed",
  CHECKED_IN: "checked_in",
  CHECKED_OUT: "checked_out",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
} as const;

export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

export interface BookingResponseDTO {
  id: number;
  userId: number;
  roomId: number;
  roomNumber: string;
  hotelId: number;
  hotelName: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  status: BookingStatus;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  userFullName?: string;
  userPhone?: string;
}

export interface BookingDetailDTO extends BookingResponseDTO {
  user: User;
  room: RoomResponseDTO;
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
