"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constants_1 = require("../user/user.constants");
const withdraw_controller_1 = require("./withdraw.controller");
const withdrawRouter = express_1.default.Router();
withdrawRouter
    .post('/conform-withdraw', (0, auth_1.default)(user_constants_1.USER_ROLE.TASKER), withdraw_controller_1.withdrawController.paypalConformWithdraw)
    .post('/withdraw-request', (0, auth_1.default)(user_constants_1.USER_ROLE.TASKER), withdraw_controller_1.withdrawController.withdrawRequest)
    .get('/', 
// auth(USER_ROLE.ADMIN),
withdraw_controller_1.withdrawController.getAllWithdraw)
    .get('/tasker-withdraw', (0, auth_1.default)(user_constants_1.USER_ROLE.TASKER), withdraw_controller_1.withdrawController.getAllWithdrawByBusinessMan)
    .get('/:id', withdraw_controller_1.withdrawController.getSingleWithdraw)
    .patch('/paid/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN), withdraw_controller_1.withdrawController.adminPaidBankWithdraw)
    .delete('/:id', withdraw_controller_1.withdrawController.deleteSingleWithdraw);
exports.default = withdrawRouter;
