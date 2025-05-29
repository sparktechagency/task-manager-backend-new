"use strict";
/** @format */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constants_1 = require("../user/user.constants");
const chat_controller_1 = require("./chat.controller");
const chatRouter = (0, express_1.Router)();
// chatRouter.get(
//   '/',
//   auth(USER_ROLE.TASKER, USER_ROLE.POSTER),
//   chatController.getAllChats,
// );
chatRouter.post('/', (0, auth_1.default)(user_constants_1.USER_ROLE.TASKER, user_constants_1.USER_ROLE.POSTER), chat_controller_1.chatController.createChat);
chatRouter.patch('/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.TASKER, user_constants_1.USER_ROLE.POSTER), chat_controller_1.chatController.updateChat);
chatRouter.delete('/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.TASKER, user_constants_1.USER_ROLE.POSTER), chat_controller_1.chatController.deleteChat);
chatRouter.get('/my-chat-list', (0, auth_1.default)(user_constants_1.USER_ROLE.TASKER, user_constants_1.USER_ROLE.POSTER), chat_controller_1.chatController.getMyChatList);
chatRouter.get('/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.TASKER, user_constants_1.USER_ROLE.POSTER), chat_controller_1.chatController.getChatById);
exports.default = chatRouter;
