import { Types } from "mongoose";

export type TNotification = {
  userId?: Types.ObjectId;
  message: string;
  role?: 'admin' | 'mentee' | 'mentor';
  type?: 'info' | 'warning' | 'error' | 'success' | 'reshedule' | 'ugiToken';
  status?: 'pending' | 'accept' | 'cancel';
  isRead: boolean;
};
