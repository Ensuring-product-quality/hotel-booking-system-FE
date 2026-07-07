import type { User } from "./auth";

export interface ReviewResponseDTO {
  id: number;
  userId: number;
  hotelId?: number;
  roomId?: number;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface ReviewCreateDTO {
  userId: number;
  hotelId?: number;
  roomId?: number;
  rating: number;
  comment: string;
}

export interface ReviewUpdateDTO {
  rating: number;
  comment: string;
}
