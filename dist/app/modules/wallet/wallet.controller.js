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
exports.walletController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const wallet_service_1 = require("./wallet.service");
const createWallet = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    // console.log('userId', userId);
    // console.log('walet', walet);
    const result = yield wallet_service_1.walletService.addWalletService(userId);
    if (result) {
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: 'Wallet added Successfull!!',
            data: result,
        });
    }
    else {
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.BAD_REQUEST,
            success: true,
            message: 'Failed to add Wallet',
            data: {},
        });
    }
}));
const addWalletAmount = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const walet = req.body;
    // console.log('userId', userId);
    // console.log('walet', walet);
    const result = yield wallet_service_1.walletService.addWalletAmountService(userId, walet);
    if (result) {
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: 'Wallet added Successfull!!',
            data: result,
        });
    }
    else {
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.BAD_REQUEST,
            success: true,
            message: 'Failed to add Wallet',
            data: {},
        });
    }
}));
const addWalletAmountConformRequest = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const walet = req.body;
    // console.log('userId', userId);
    // console.log('walet', walet);
    const result = yield wallet_service_1.walletService.addWalletAmountConformRequestService(userId, walet);
    if (result) {
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: 'Add wallet request Successfull!!',
            data: result,
        });
    }
    else {
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.BAD_REQUEST,
            success: true,
            message: 'Failed to request Wallet',
            data: {},
        });
    }
}));
const addWalletAmountConform = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield wallet_service_1.walletService.addWalletAmountConformService(id);
    if (result) {
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: 'Wallet added Successfull!!',
            data: result,
        });
    }
    else {
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.BAD_REQUEST,
            success: true,
            message: 'Failed to add Wallet',
            data: {},
        });
    }
}));
const getSingleWalletByUser = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const result = yield wallet_service_1.walletService.userWalletGetService(userId);
    if (result) {
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: 'Wallet are retrive Successfull!',
            data: result,
        });
    }
    else {
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.BAD_REQUEST,
            success: true,
            message: 'Data is not found',
            data: {},
        });
    }
}));
const getSingleWalletByTasker = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const result = yield wallet_service_1.walletService.userWalletGetByTaskerService(userId);
    if (result) {
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: 'Wallet are retrive Successfull!',
            data: result,
        });
    }
    else {
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.BAD_REQUEST,
            success: true,
            message: 'Data is not found',
            data: {},
        });
    }
}));
const deleteWallet = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const { id } = req.params;
    const result = yield wallet_service_1.walletService.deletedWallet(userId, id);
    if (result) {
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: 'Deleted Wallet are Successfull!',
            data: result,
        });
    }
    else {
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.BAD_REQUEST,
            success: true,
            message: 'Data is not found',
            data: {},
        });
    }
}));
exports.walletController = {
    createWallet,
    addWalletAmount,
    addWalletAmountConformRequest,
    addWalletAmountConform,
    getSingleWalletByUser,
    getSingleWalletByTasker,
    deleteWallet,
};
