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
exports.chatController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const chat_service_1 = require("./chat.service");
// const getAllChats = catchAsync(async (req, res) => {
//   const options = {
//     limit: Number(req.query.limit) || 10,
//     page: Number(req.query.page) || 1,
//   };
//   const { userId } = req.user;
//   // console.log('userId=====================', userId);
//   const filter: any = { participantId: userId };
//   const search = req.query.search;
//   // console.log('serch', search);
//   if (search && search !== 'null' && search !== '' && search !== undefined) {
//     const searchRegExp = new RegExp('.*' + search + '.*', 'i');
//     filter.name = searchRegExp;
//     // filter._id = search;
//   }
//   //  const { userId } = req.user;
//   // // console.log({ filter });
//   // // console.log({ options });
//   const result = await chatService.getChatByParticipantId(filter, options);
//   sendResponse(res, {
//     success: true,
//     statusCode: httpStatus.OK,
//     //    meta: meta,
//     data: result,
//     message: 'chat list get successfully!',
//   });
// });
const createChat = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const chatData = req.body;
    console.log('chatData', chatData);
    if (typeof chatData.participants === 'string') {
        chatData.participants = JSON.parse(chatData.participants);
    }
    else {
        chatData.participants = chatData.participants;
    }
    if (!Array.isArray(chatData.participants)) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 400,
            success: false,
            message: 'Participants data should be an array',
            data: {},
        });
    }
    const chat = yield chat_service_1.chatService.createChat(chatData);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Chat created successfully',
        data: chat,
    });
}));
const getMyChatList = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const userId = req.user.userId;
    const result = yield chat_service_1.chatService.getMyChatList(userId, query);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Chat retrieved successfully',
        data: result,
    });
}));
const getChatById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield chat_service_1.chatService.getChatById(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Chat retrieved successfully',
        data: result,
    });
}));
const updateChat = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield chat_service_1.chatService.updateChatList(req.params.id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Chat updated successfully',
        data: result,
    });
}));
const deleteChat = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield chat_service_1.chatService.deleteChatList(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Chat deleted successfully',
        data: result,
    });
}));
exports.chatController = {
    // getAllChats,
    createChat,
    getMyChatList,
    getChatById,
    updateChat,
    deleteChat,
};
