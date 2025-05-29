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
exports.walletService = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const user_models_1 = require("../user/user.models");
const wallet_model_1 = require("./wallet.model");
const payment_service_1 = require("../payment/payment.service");
const payment_model_1 = require("../payment/payment.model");
const addWalletService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!userId) {
        throw new AppError_1.default(400, 'User ID is required!');
    }
    if (!mongoose_1.Types.ObjectId.isValid(userId)) {
        throw new AppError_1.default(400, 'Invalid User ID format!');
    }
    const user = yield user_models_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.default(404, 'user not found!');
    }
    // console.log('user', user);
    if (user.role !== 'tasker' && user.role !== 'poster') {
        throw new AppError_1.default(400, 'The user is not valid!');
    }
    const wallet = yield wallet_model_1.Wallet.findOne({ userId: userId });
    if (wallet) {
        throw new AppError_1.default(400, 'Wallet already exist!');
    }
    const payload = {
        userId: new mongoose_1.Types.ObjectId(userId),
        amount: 0,
    };
    const result = yield wallet_model_1.Wallet.create(payload);
    return result;
});
const addWalletAmountService = (userId, walet) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        if (!userId) {
            throw new AppError_1.default(400, 'User ID is required!');
        }
        if (!mongoose_1.Types.ObjectId.isValid(userId)) {
            throw new AppError_1.default(400, 'Invalid User ID format!');
        }
        const user = yield user_models_1.User.findById(userId).session(session);
        if (!user) {
            throw new AppError_1.default(404, 'User not found!');
        }
        if (user.role !== 'poster') {
            throw new AppError_1.default(400, 'The user is not valid!');
        }
        const wallet = yield wallet_model_1.Wallet.findOne({
            userId: userId
        }).session(session);
        if (!wallet) {
            throw new AppError_1.default(400, 'Wallet not found!');
        }
        const paymentData = {
            posterUserId: userId,
            transactionId: walet.transactionId,
            method: walet.method,
            status: 'paid',
            price: walet.amount,
        };
        const payment = yield payment_service_1.paymentService.addPaymentService(paymentData);
        if (!payment) {
            throw new AppError_1.default(400, 'Payment not found!');
        }
        const updatedWallet = yield wallet_model_1.Wallet.findOneAndUpdate({ userId: userId }, { $inc: { amount: walet.amount } }, { new: true, session });
        if (!updatedWallet) {
            throw new AppError_1.default(400, 'Failed to update wallet balance');
        }
        yield session.commitTransaction();
        session.endSession();
        return updatedWallet;
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
const addWalletAmountConformRequestService = (userId, walet) => __awaiter(void 0, void 0, void 0, function* () {
    if (!userId) {
        throw new AppError_1.default(400, 'User ID is required!');
    }
    if (!mongoose_1.Types.ObjectId.isValid(userId)) {
        throw new AppError_1.default(400, 'Invalid User ID format!');
    }
    const user = yield user_models_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.default(404, 'user not found!');
    }
    // console.log('user', user);
    if (user.role !== 'poster') {
        throw new AppError_1.default(400, 'The user is not valid!');
    }
    const wallet = yield wallet_model_1.Wallet.findOne({ userId: userId });
    if (!wallet) {
        throw new AppError_1.default(400, 'Wallet not found!');
    }
    if (walet.name !== "bank") {
        throw new AppError_1.default(400, 'The payment method is not valid!');
    }
    const paymentData = {
        posterUserId: userId,
        transactionId: walet.transactionId,
        method: walet.name,
        status: "request",
        price: walet.amount
    };
    const payment = yield payment_service_1.paymentService.addPaymentService(paymentData);
    if (!payment) {
        throw new AppError_1.default(400, 'Payment not found!');
    }
    return payment;
});
const addWalletAmountConformService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        if (!id) {
            throw new AppError_1.default(400, 'User ID is required!');
        }
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            throw new AppError_1.default(400, 'Invalid User ID format!');
        }
        const payment = yield payment_model_1.Payment.findById(id).session(session);
        if (!payment) {
            throw new AppError_1.default(404, 'Payment not found!');
        }
        if (payment.status !== 'request') {
            throw new AppError_1.default(400, 'The payment is not valid!');
        }
        if (payment.method !== 'bank') {
            throw new AppError_1.default(400, 'The payment method is not valid!');
        }
        const updatePayment = yield payment_model_1.Payment.findByIdAndUpdate(id, { $set: { status: 'paid' } }, { new: true, session });
        if (!updatePayment) {
            throw new AppError_1.default(400, 'Payment confirm not found!');
        }
        const updatedWallet = yield wallet_model_1.Wallet.findOneAndUpdate({ userId: payment.posterUserId }, { $inc: { amount: payment.price } }, { new: true, session });
        if (!updatedWallet) {
            throw new AppError_1.default(400, 'Wallet not found or unable to update balance!');
        }
        yield session.commitTransaction();
        session.endSession();
        return updatePayment;
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
const userWalletGetService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!userId) {
        throw new AppError_1.default(400, 'User ID is required!');
    }
    if (!mongoose_1.Types.ObjectId.isValid(userId)) {
        throw new AppError_1.default(400, 'Invalid User ID format!');
    }
    const user = yield user_models_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.default(404, 'User not found!');
    }
    if (user.role !== 'tasker' && user.role !== 'poster') {
        throw new AppError_1.default(400, 'The user is not valid!');
    }
    const wallet = yield wallet_model_1.Wallet.findOne({ userId });
    return wallet;
});
const userWalletGetByTaskerService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!userId) {
        throw new AppError_1.default(400, 'User ID is required!');
    }
    if (!mongoose_1.Types.ObjectId.isValid(userId)) {
        throw new AppError_1.default(400, 'Invalid User ID format!');
    }
    const user = yield user_models_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.default(404, 'User not found!');
    }
    if (user.role !== 'tasker') {
        throw new AppError_1.default(400, 'The user is not valid!');
    }
    const wallet = yield wallet_model_1.Wallet.findOne({ userId });
    return wallet;
});
const deletedWallet = (userId, id) => __awaiter(void 0, void 0, void 0, function* () {
    if (!userId) {
        throw new AppError_1.default(400, 'User ID is required!');
    }
    if (!mongoose_1.Types.ObjectId.isValid(userId)) {
        throw new AppError_1.default(400, 'Invalid User ID format!');
    }
    const user = yield user_models_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.default(404, 'User not found!');
    }
    if (user.role !== 'tasker' && user.role !== 'poster') {
        throw new AppError_1.default(400, 'The user is not valid!');
    }
    const wallet = yield wallet_model_1.Wallet.findOne({ userId });
    if (!wallet) {
        throw new AppError_1.default(404, 'Wallet not found!');
    }
    const result = yield wallet_model_1.Wallet.findOneAndDelete({ userId, _id: id });
    return result;
});
exports.walletService = {
    addWalletService,
    addWalletAmountService,
    addWalletAmountConformRequestService,
    addWalletAmountConformService,
    userWalletGetService,
    userWalletGetByTaskerService,
    deletedWallet,
};
