"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constants_1 = require("../user/user.constants");
const wallet_controller_1 = require("./wallet.controller");
const walletRouter = express_1.default.Router();
walletRouter
    .post('/', (0, auth_1.default)(user_constants_1.USER_ROLE.TASKER, user_constants_1.USER_ROLE.POSTER), 
// validateRequest(videoValidation.VideoSchema),
wallet_controller_1.walletController.createWallet)
    .post('/amount', (0, auth_1.default)(user_constants_1.USER_ROLE.POSTER), 
// validateRequest(videoValidation.VideoSchema),
wallet_controller_1.walletController.addWalletAmount)
    .post('/bank-amount-request', (0, auth_1.default)(user_constants_1.USER_ROLE.POSTER), 
// validateRequest(videoValidation.VideoSchema),
wallet_controller_1.walletController.addWalletAmountConformRequest)
    .patch('/bank-amount-conform/:id', 
// auth(USER_ROLE.ADMIN),
// validateRequest(videoValidation.VideoSchema),
wallet_controller_1.walletController.addWalletAmountConform)
    .get('/tasker', (0, auth_1.default)(user_constants_1.USER_ROLE.TASKER), wallet_controller_1.walletController.getSingleWalletByTasker)
    .get('/', (0, auth_1.default)(user_constants_1.USER_ROLE.TASKER, user_constants_1.USER_ROLE.POSTER), wallet_controller_1.walletController.getSingleWalletByUser)
    .delete('/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.TASKER, user_constants_1.USER_ROLE.POSTER), wallet_controller_1.walletController.deleteWallet);
exports.default = walletRouter;
