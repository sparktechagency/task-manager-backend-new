"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Review = void 0;
const mongoose_1 = require("mongoose");
const reviewSchema = new mongoose_1.Schema({
    taskId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'TaskPost',
    },
    taskerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    posterId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    rating: {
        type: Number,
        required: true,
        default: 0,
    },
    review: {
        type: String,
        required: false,
        default: '',
    },
}, { timestamps: true });
exports.Review = (0, mongoose_1.model)('Review', reviewSchema);
