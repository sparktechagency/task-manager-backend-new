import { Types } from "mongoose"

export type TTaskPost = {
  posterUserId: Types.ObjectId;
  taskerUserId?: Types.ObjectId;

  category: string;
  taskName: string;
  taskDetails: string;
  taskImages?: string[];
  taskType: string;
  taskAddress: string;
  taskTimeDate: string;
  // taskEndDate: string;
  certainTime: boolean;
  needTime: {
    option: string;
    time: string;
  };
  price: number;
  latitude: number;
  longitude: number;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  status: string;
  paymentStatus: string;
  ratingStatus: string;
  taskerratingStatus: string;
};