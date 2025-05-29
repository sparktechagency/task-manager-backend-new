"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const settings_controller_1 = require("./settings.controller");
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constants_1 = require("../user/user.constants");
const settingsRouter = express_1.default.Router();
settingsRouter
    .post('/', (0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN, user_constants_1.USER_ROLE.SUPER_ADMIN), settings_controller_1.settingsController.addSetting)
    .get('/', settings_controller_1.settingsController.getSettings)
    .patch('/', settings_controller_1.settingsController.updateSetting);
exports.default = settingsRouter;
