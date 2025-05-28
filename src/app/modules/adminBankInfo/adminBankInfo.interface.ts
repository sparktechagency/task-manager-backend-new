import { Types } from 'mongoose';

export type TAdminBankInfo = {
  adminId: Types.ObjectId;
  name: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
};
