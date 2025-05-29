"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankInfo = void 0;
const mongoose_1 = require("mongoose");
const adminBankInfoSchema = new mongoose_1.Schema({
    adminId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    bankName: {
        type: String,
        required: true,
    },
    accountNumber: {
        type: String,
        required: true,
    },
    routingNumber: {
        type: String,
        required: true,
    },
});
exports.BankInfo = (0, mongoose_1.model)('BankInfo', adminBankInfoSchema);
