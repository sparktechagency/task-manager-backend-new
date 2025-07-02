import { Types } from 'mongoose';

export type TReview = {
  taskId: Types.ObjectId;
  taskerId: Types.ObjectId;
  posterId: Types.ObjectId;
  rating: number;
  review?: string;
};
