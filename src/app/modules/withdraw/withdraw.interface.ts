import { Types } from "mongoose";

export type TWithdraw = {
  taskerUserId: Types.ObjectId;
  amount: number;
  method: string;
  status: string;
  transactionId?: string;
  transactionDate: Date;
  accountNumber?: string;
  country?: string;
  currency?: string;
  payout_id: string;
  receiverEmail?: string;
};