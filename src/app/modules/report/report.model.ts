import { model, Schema } from "mongoose";
import { TReport } from "./report.interface";


const reportShema = new Schema<TReport>({
  taskerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  details: { type: String, required: true },
});


const Report = model<TReport>('Report', reportShema);
export default Report;
