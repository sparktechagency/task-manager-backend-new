import { Types } from 'mongoose';

export type TPayment = {
  posterUserId: Types.ObjectId;
  price: number;
  method: string;
  status: string;
  transactionId?: string;
  transactionDate: Date;
};
