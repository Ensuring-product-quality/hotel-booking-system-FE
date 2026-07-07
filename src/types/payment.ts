export const PaymentMethod = {
  CREDIT_CARD: "credit_card",
  PAYPAL: "paypal",
  BANK_TRANSFER: "bank_transfer",
} as const;

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export interface PaymentResponseDTO {
  id: number;
  bookingId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  status: "pending" | "completed" | "failed";
  transactionId?: string;
  createdAt: string;
}

export interface PaymentCreateDTO {
  bookingId: number;
  amount: number;
  paymentMethod: PaymentMethod;
}
