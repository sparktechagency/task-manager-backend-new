"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bankService = void 0;
const mongoose_1 = require("mongoose");
const AppError_1 = __importDefault(require("../../error/AppError"));
const adminBankInfo_model_1 = require("./adminBankInfo.model");
const addBankAcountService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('payload', payload);
    if (!payload.adminId) {
        throw new AppError_1.default(400, 'User ID is required!');
    }
    if (!mongoose_1.Types.ObjectId.isValid(payload.adminId)) {
        throw new AppError_1.default(400, 'Invalid User ID format!');
    }
    if (!payload.bankName || !payload.accountNumber || !payload.routingNumber) {
        throw new AppError_1.default(400, 'Bank name, account number, and SWIFT code are required!');
    }
    const existingBankInfo = yield adminBankInfo_model_1.BankInfo.findOne({ adminId: payload.adminId });
    if (existingBankInfo) {
        const updatedBankInfo = yield adminBankInfo_model_1.BankInfo.findOneAndUpdate({ adminId: payload.adminId }, { $set: payload }, { new: true });
        return updatedBankInfo;
    }
    else {
        const result = yield adminBankInfo_model_1.BankInfo.create(payload);
        return result;
    }
    //   const updatedBankInfo = await BankInfo.findOneAndUpdate(
    //     { adminId: payload.adminId },
    //     { $set: payload }, 
    //     { new: true }, 
    //   );
    //   return updatedBankInfo;
});
const getBankAcountService = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield adminBankInfo_model_1.BankInfo.findOne({});
    return result;
});
const updateBankAcountService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('payload ------>', payload);
    const result = yield adminBankInfo_model_1.BankInfo.findOneAndUpdate({}, { $set: payload }, { new: true });
    return result;
});
exports.bankService = {
    addBankAcountService,
    getBankAcountService,
    updateBankAcountService,
};
