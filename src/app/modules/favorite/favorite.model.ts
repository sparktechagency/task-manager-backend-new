import mongoose, { Schema} from 'mongoose';
import { TfavoriteBusiness } from './favorite.interface';


const favoriteBusinessSchema: Schema = new Schema<TfavoriteBusiness>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);


const FavoriteBusiness = mongoose.model<TfavoriteBusiness>(
  'FavoriteBusiness',
  favoriteBusinessSchema,
);

export default FavoriteBusiness;
