"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const taskPostSchema = new mongoose_1.Schema({
    posterUserId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    taskerUserId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
});
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
const TaskPost = mongoose_1.default.model('TaskPost', taskPostSchema);
exports.default = TaskPost;
