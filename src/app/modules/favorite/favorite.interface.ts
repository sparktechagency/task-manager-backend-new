import { Types } from 'mongoose';

export type TfavoriteBusiness = {
  customerId: Types.ObjectId;
  businessId: Types.ObjectId;
};
