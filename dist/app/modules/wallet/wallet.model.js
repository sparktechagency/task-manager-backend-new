"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wallet = void 0;
const mongoose_1 = require("mongoose");
const walletSchema = new mongoose_1.Schema({
    // name: {
    //   type: String,
    //   required: true,
    // },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
exports.Wallet = (0, mongoose_1.model)('Wallet', walletSchema);
