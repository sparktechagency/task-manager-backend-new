import { model, Schema } from "mongoose";
import { TAdminBankInfo } from "./adminBankInfo.interface";

const adminBankInfoSchema = new Schema<TAdminBankInfo>({
  adminId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  bankName: {
    type: String,
    required: true,
  },
  accountNumber: {
    type: String,
    required: true,
  },
  routingNumber: {
    type: String,
    required: true,
  },
});

export const BankInfo = model<TAdminBankInfo>('BankInfo', adminBankInfoSchema);