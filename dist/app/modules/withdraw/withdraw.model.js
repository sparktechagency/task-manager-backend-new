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
const withdrawSchema = new mongoose_1.Schema({
    taskerUserId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
});
const Withdraw = mongoose_1.default.model('Withdraw', withdrawSchema);
exports.default = Withdraw;
