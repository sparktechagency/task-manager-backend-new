import { Types } from "mongoose";

export type TWallet = {
  // name: string;
  userId: Types.ObjectId;
  // role: string;
  amount: number;
};
