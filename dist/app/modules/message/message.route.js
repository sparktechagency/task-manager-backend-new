"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constants_1 = require("../user/user.constants");
const fileUpload_1 = __importDefault(require("../../middleware/fileUpload"));
const message_controller_1 = require("./message.controller");
const messageRouter = (0, express_1.Router)();
// const storage = memoryStorage();
// const upload = multer({ storage });
const upload = (0, fileUpload_1.default)('./public/uploads/message');
messageRouter.get('/', message_controller_1.messageController.getAllMessages);
messageRouter.post('/send-messages', (0, auth_1.default)(user_constants_1.USER_ROLE.POSTER, user_constants_1.USER_ROLE.TASKER), upload.fields([{ name: 'image', maxCount: 5 }]), message_controller_1.messageController.createMessages);
messageRouter.patch('/seen/:chatId', (0, auth_1.default)(user_constants_1.USER_ROLE.POSTER, user_constants_1.USER_ROLE.TASKER), message_controller_1.messageController.seenMessage);
messageRouter.patch('/update/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.POSTER, user_constants_1.USER_ROLE.TASKER), 
//   upload.single('image'),
upload.fields([{ name: 'image', maxCount: 5 }]), 
//   parseData(),
//   validateRequest(messagesValidation.updateMessageValidation),
message_controller_1.messageController.updateMessages);
messageRouter.get('/my-messages/:chatId', message_controller_1.messageController.getMessagesByChatId);
messageRouter.delete('/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.POSTER, user_constants_1.USER_ROLE.TASKER), message_controller_1.messageController.deleteMessages);
messageRouter.get('/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.POSTER, user_constants_1.USER_ROLE.TASKER), message_controller_1.messageController.getMessagesById);
messageRouter.get('/', (0, auth_1.default)(user_constants_1.USER_ROLE.POSTER, user_constants_1.USER_ROLE.TASKER), message_controller_1.messageController.getAllMessages);
exports.default = messageRouter;
