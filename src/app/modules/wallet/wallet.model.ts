import { model, Schema } from "mongoose";
import { TWallet } from "./wallet.interface";

const walletSchema = new Schema<TWallet>({
  // name: {
  //   type: String,
  //   required: true,
  // },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // role: {
  //   type: String,
  //   enum: ['tasker', 'poster'],
  //   required: true,
  // },
  amount: {
    type: Number,
    default: 0,
  },
});

export const Wallet = model<TWallet>('Wallet', walletSchema);