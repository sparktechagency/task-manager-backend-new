import { Types } from 'mongoose';

export interface IMessages {
  _id?: Types.ObjectId;
  id?: string;
  text?: string;
  image?: string;
  seen: boolean;
  chat: Types.ObjectId;
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  taskId?: Types.ObjectId;
  taskStatus?: string;
  offerPrice?: number;
  reason?: string;
}
