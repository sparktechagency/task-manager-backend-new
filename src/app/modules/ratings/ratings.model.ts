import { model, Schema } from 'mongoose';
import { TReview } from './ratings.interface';

const reviewSchema = new Schema<TReview>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'TaskPost',
    },
    taskerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    posterId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    review: {
      type: String,
      required: false,
      default: '',
    },
  },
  { timestamps: true },
);

export const Review = model<TReview>('Review', reviewSchema);
