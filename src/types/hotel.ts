import type { RoomResponseDTO } from "./room";

export interface HotelResponseDTO {
  id: number;
  name: string;
  address: string;
  city: string;
  stars: number;
  description: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
  images?: string[];
}

export interface HotelDetailDTO extends HotelResponseDTO {
  images: string[];
  rooms: RoomResponseDTO[];
}

export interface HotelCreateDTO {
  name: string;
  address: string;
  city: string;
  stars: number;
  description: string;
  status: "active" | "inactive";
}

export type HotelUpdateDTO = Partial<HotelCreateDTO>;
