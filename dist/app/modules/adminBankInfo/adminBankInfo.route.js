"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constants_1 = require("../user/user.constants");
const adminBankInfo_controller_1 = require("./adminBankInfo.controller");
const adminBankInfoRouter = express_1.default.Router();
adminBankInfoRouter
    .post('/bank-info', (0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN), 
// validateRequest(videoValidation.VideoSchema),
adminBankInfo_controller_1.bankInfoController.addBankInfo)
    .get('/', adminBankInfo_controller_1.bankInfoController.getbankInfo)
    .patch('/update', (0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN), adminBankInfo_controller_1.bankInfoController.updateBankInfo);
exports.default = adminBankInfoRouter;
