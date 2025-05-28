import mongoose, { Schema } from 'mongoose';
import { Types } from 'mongoose';


const taskPostSchema = new Schema(
  {
    posterUserId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    taskerUserId: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: 'User',
    },
    category: {
      type: String,
      required: true,
    },
    taskName: {
      type: String,
      required: true,
    },
    taskDetails: {
      type: String,
      required: true,
    },
    taskImages: [
      {
        type: String,
        required: false,
      },
    ],
    taskType: {
      type: String,
      required: true,
    },
    taskAddress: {
      type: String,
      required: true,
    },
    taskTimeDate: {
      type: String,
      required: true,
    },
    // taskEndDate: {
    //   type: String,
    //   required: true,
    // },
    certainTime: {
      type: Boolean,
      required: true,
    },
    needTime: {
      option: {
        type: String,
        required: true,
      },
      time: {
        type: String,
        required: true,
      },
    },
    price: {
      type: Number,
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    location: {
      type: { type: String, default: 'Point' },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: false,
      },
    },
    status: {
      type: String,
      enum: ['pending', 'accept', 'ongoing', 'complete', 'cancel'],
      default: 'accept', //pending
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'request', 'paid'],
      default: 'pending',
    },
    ratingStatus: {
      type: String,
      enum: ['pending', 'complete'],
      default: 'pending',
    },
    taskerratingStatus: {
      type: String,
      enum: ['pending', 'complete'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  },
);


taskPostSchema.pre('save', function (next) {
  if (this.latitude && this.longitude) {
    this.location = {
      type: 'Point',
      coordinates: [this.longitude, this.latitude],
    };
  }
  next();
});


taskPostSchema.index({ location: '2dsphere' });


const TaskPost = mongoose.model('TaskPost', taskPostSchema);

export default TaskPost;
