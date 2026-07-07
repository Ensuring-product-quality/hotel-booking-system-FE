export interface RoomResponseDTO {
  id: number;
  hotelId: number;
  roomNumber: string;
  type: string;
  price: number;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoomDetailDTO extends RoomResponseDTO {
  images: string[];
}

export interface RoomCreateDTO {
  hotelId: number;
  roomNumber: string;
  type: string;
  price: number;
  description: string;
  status: string;
}

export type RoomUpdateDTO = Partial<Omit<RoomCreateDTO, "hotelId">>;
