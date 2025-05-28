import mongoose, { Schema } from 'mongoose';
import { Types } from 'mongoose';
import { TWithdraw } from './withdraw.interface';


const withdrawSchema = new Schema<TWithdraw>(
  {
    taskerUserId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    amount: {
      type: Number,
      required: true,
    },
    method: {
      type: String,
      enum: ['bank', 'paypal'],
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'completed', 'request', 'failed'],
    },
    transactionId: {
      type: String,
      required: false,
    },
    transactionDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    accountNumber: {
      type: String,
      required: false,
    },
    country: {
      type: String,
      required: false,
    },
    currency: {
      type: String,
      required: false,
    },
    payout_id: {
      type: String,
      required: false,
    },
    receiverEmail: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

const Withdraw = mongoose.model('Withdraw', withdrawSchema);

export default Withdraw;
