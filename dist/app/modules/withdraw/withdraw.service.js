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
exports.withdrawService = void 0;
const AppError_1 = __importDefault(require("../../error/AppError"));
const user_models_1 = require("../user/user.models");
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const withdraw_model_1 = __importDefault(require("./withdraw.model"));
const wallet_model_1 = require("../wallet/wallet.model");
const mongoose_1 = __importDefault(require("mongoose"));
// import { Wallet } from '../wallet/wallet.model';
const paypal_rest_sdk_1 = __importDefault(require("paypal-rest-sdk"));
paypal_rest_sdk_1.default.configure({
    mode: 'sandbox', // Change to 'live' for production
    client_id: 'YOUR_PAYPAL_CLIENT_ID',
    client_secret: 'YOUR_PAYPAL_CLIENT_SECRET',
});
const conformPaypalWithdrawService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { taskerUserId, receiverEmail, currency = 'USD' } = payload;
    const amount = Number(payload.amount);
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const tasker = yield user_models_1.User.findById(taskerUserId).session(session);
        if (!tasker) {
            throw new AppError_1.default(400, 'User is not found!');
        }
        if (tasker.role !== 'tasker') {
            throw new AppError_1.default(400, 'User is not authorized as a Tasker!!');
        }
        if (!amount || amount <= 0) {
            throw new AppError_1.default(400, 'Invalid Withdrawal amount. It must be a positive number.');
        }
        const wallet = yield wallet_model_1.Wallet.findOne({
            userId: taskerUserId,
        }).session(session);
        if (!wallet) {
            throw new AppError_1.default(400, 'Wallet not found!');
        }
        if (wallet.amount < amount) {
            throw new AppError_1.default(400, 'Insufficient wallet balance!');
        }
        const senderEmail = 'adminpaypal@gmail.com';
        const payoutData = {
            sender_batch_header: {
                email_subject: 'You have a payment',
            },
            items: [
                {
                    recipient_type: 'EMAIL',
                    amount: {
                        value: amount,
                        currency: currency,
                    },
                    receiver: receiverEmail,
                    note: `Payment from ${senderEmail}`,
                    sender_item_id: `item-${Math.random().toString(36).substring(7)}`,
                },
            ],
        };
        const payout = yield new Promise((resolve, reject) => {
            paypal_rest_sdk_1.default.payout.create(payoutData, (error, payoutResponse) => {
                if (error) {
                    reject(new AppError_1.default(400, error.message));
                }
                else {
                    resolve(payoutResponse);
                }
            });
        });
        console.log('Payout Response:', payout);
        const withdrawData = {
            taskerUserId: taskerUserId,
            amount: amount,
            method: 'paypal',
            status: 'completed',
            transactionId: payout.batch_header.payout_batch_id,
            transactionDate: new Date(),
            receiverEmail: receiverEmail,
            type: 'withdraw',
        };
        const result = yield withdraw_model_1.default.create([withdrawData], { session });
        wallet.amount = wallet.amount - amount;
        yield wallet.save({ session });
        yield session.commitTransaction();
        session.endSession();
        return result;
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        console.error('Error processing payout:', error);
        throw new AppError_1.default(400, 'Payment processing failed!');
    }
});
const withdrawRequestService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const amount = Number(payload.amount);
    payload.amount = amount;
    const tasker = yield user_models_1.User.findById(payload.taskerUserId);
    if (!tasker) {
        throw new AppError_1.default(400, 'User is not found!');
    }
    if (tasker.role !== 'tasker') {
        throw new AppError_1.default(400, 'User is not authorized as a tasker!!');
    }
    if (!amount || amount <= 0) {
        throw new AppError_1.default(400, 'Invalid Withdrawal amount. It must be a positive number.');
    }
    if (payload.method !== 'bank') {
        throw new AppError_1.default(400, 'Invalid withdrawal method. It must be a bank.');
    }
    const wallet = yield wallet_model_1.Wallet.findOne({
        userId: payload.taskerUserId
    });
    if (!wallet) {
        throw new AppError_1.default(400, 'Wallet not found!');
    }
    if (wallet.amount < amount) {
        throw new AppError_1.default(400, 'Insufficient wallet balance!');
    }
    payload.type = 'withdraw';
    const result = yield withdraw_model_1.default.create(payload);
    return result;
});
const getAllWithdrawService = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const WithdrawQuery = new QueryBuilder_1.default(withdraw_model_1.default.find().populate('taskerUserId'), query)
        .search(['name'])
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = yield WithdrawQuery.modelQuery;
    const meta = yield WithdrawQuery.countTotal();
    return { meta, result };
});
const getAllWithdrawBybusinessService = (query, taskerUserId) => __awaiter(void 0, void 0, void 0, function* () {
    const WithdrawQuery = new QueryBuilder_1.default(withdraw_model_1.default.find({ taskerUserId }), query)
        .search(['name'])
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = yield WithdrawQuery.modelQuery;
    const meta = yield WithdrawQuery.countTotal();
    return { meta, result };
});
const singleWithdrawService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const task = yield withdraw_model_1.default.findById(id);
    return task;
});
const adminPaidBankWithdrawService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const withdraw = yield withdraw_model_1.default.findById(id).session(session);
        if (!withdraw) {
            throw new AppError_1.default(400, 'Withdraw not found!');
        }
        if (withdraw.status !== 'request') {
            throw new AppError_1.default(400, 'Withdraw is not request!');
        }
        const withdrawUpate = yield withdraw_model_1.default.findByIdAndUpdate(id, { status: 'completed' }, { new: true, runValidators: true, session });
        if (!withdrawUpate) {
            throw new AppError_1.default(400, 'Failed to update withdraw status!');
        }
        const tasker = yield user_models_1.User.findById(withdraw.taskerUserId).session(session);
        if (!tasker) {
            throw new AppError_1.default(400, 'Tasker not found!');
        }
        if (tasker.role !== 'tasker') {
            throw new AppError_1.default(400, 'User is not authorized as a tasker!');
        }
        const wallet = yield wallet_model_1.Wallet.findOne({
            userId: withdraw.taskerUserId
        }).session(session);
        if (!wallet) {
            throw new AppError_1.default(400, 'Wallet not found!');
        }
        if (wallet.amount < withdraw.amount) {
            throw new AppError_1.default(400, 'Insufficient wallet balance!');
        }
        wallet.amount = wallet.amount - withdraw.amount;
        yield wallet.save({ session });
        yield session.commitTransaction();
        session.endSession();
        return withdrawUpate;
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
const deleteSingleWithdrawService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield withdraw_model_1.default.deleteOne({ _id: id });
    return result;
});
exports.withdrawService = {
    conformPaypalWithdrawService,
    withdrawRequestService,
    getAllWithdrawService,
    singleWithdrawService,
    adminPaidBankWithdrawService,
    getAllWithdrawBybusinessService,
    deleteSingleWithdrawService,
};
