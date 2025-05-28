import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const messageSchema = new Schema(
  {
    text: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },

    seen: {
      type: Boolean,
      default: false,
    },
    sender: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      default: '',
    },
    receiver: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      default: '',
    },

    chat: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Chat',
      default: '',
    },
    taskId: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: 'TaskPost',
      default: '',
    },
    taskStatus: {
      type: String,
      enum: ['pending', 'accept', 'cencel'],
      required: false,
      default: '',
    },
    offerPrice: {
      type: Number,
      required: false,
      default: 0,
    },
    reason: {
      type: String,
      required: false,
      default: '',
    },
  },
  {
    timestamps: true,
  },
);
const Message =  model('Message', messageSchema);

export default Message;
