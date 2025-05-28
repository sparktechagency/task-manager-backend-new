import { Types } from 'mongoose';

export type TReport = {
  taskerId: Types.ObjectId;
  details:string;
};
