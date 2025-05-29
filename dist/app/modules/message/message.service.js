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
exports.messageService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const http_status_1 = __importDefault(require("http-status"));
const message_model_1 = __importDefault(require("./message.model"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const chat_model_1 = __importDefault(require("../chat/chat.model"));
const chat_service_1 = require("../chat/chat.service");
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
// // Add a new message
// const addMessage = async (messageBody: any) => {
//   const newMessage = await Message.create(messageBody);
//   return await newMessage.populate('chat sender');
// };
// // Get messages by chat ID with pagination
// const getMessages = async (chatId: any, options = {}) => {
//   const { limit = 10, page = 1 }: { limit?: number; page?: number } = options;
//   try {
//     const totalResults = await Message.countDocuments({ chat: chatId });
//     const totalPages = Math.ceil(totalResults / limit);
//     const pagination = { totalResults, totalPages, currentPage: page, limit };
//     // console.log([chatId]);
//     const skip = (page - 1) * limit;
//     const chat = new mongoose.Types.ObjectId(chatId);
//     const messages = await Message.aggregate([
//       { $match: { chat: chat } },
//       { $sort: { createdAt: -1 } },
//       { $skip: skip },
//       { $limit: limit },
//       {
//         $lookup: {
//           from: 'users',
//           localField: 'sender',
//           foreignField: '_id',
//           as: 'sender',
//         },
//       },
//       { $unwind: '$sender' },
//       {
//         $lookup: {
//           from: 'chats',
//           localField: 'chat',
//           foreignField: '_id',
//           as: 'chatDetails',
//         },
//       },
//       { $unwind: '$chatDetails' },
//       {
//         $project: {
//           _id: 1,
//           chat: 1,
//           message: 1,
//           type: 1,
//           sender: {
//             _id: 1,
//             fullName: 1,
//             image: 1,
//           },
//           createdAt: 1,
//           updatedAt: 1,
//         },
//       },
//     ]);
//     // console.log('messages', messages);
//     return { messages, pagination };
//   } catch (error) {
//     throw new AppError(
//       httpStatus.INTERNAL_SERVER_ERROR,
//       'Failed to retrieve messages',
//     );
//   }
// };
// const getMessageById = async (messageId: Types.ObjectId) => {
//   return Message.findById(messageId).populate('chat');
// };
// // Delete a message by ID
// const deleteMessage = async (id: string) => {
//   const result = await Message.findByIdAndDelete(id);
//   if (!result) {
//     throw new AppError(httpStatus.NOT_FOUND, 'Message not found');
//   }
//   return result;
// };
// // Delete messages by chat ID
// const deleteMessagesByChatId = async (chatId: string) => {
//   const result = await Message.deleteMany({ chat: chatId });
//   if (!result) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete messages');
//   }
//   return result;
// };
//------------------------------------------------------//
//------------------------------------------------------//
const createMessages = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('payload===', payload);
    const alreadyExists = yield chat_model_1.default.findOne({
        participants: { $all: [payload.sender, payload.receiver] },
    }).populate(['participants']);
    console.log('alreadyExists', alreadyExists);
    if (!alreadyExists) {
        const chatList = yield chat_model_1.default.create({
            participants: [payload.sender, payload.receiver],
        });
        //@ts-ignore
        payload.chat = chatList === null || chatList === void 0 ? void 0 : chatList._id;
    }
    else {
        //@ts-ignore
        payload.chat = alreadyExists === null || alreadyExists === void 0 ? void 0 : alreadyExists._id;
    }
    console.log('payload==2', payload);
    const result = yield (yield message_model_1.default.create(payload)).populate([
        {
            path: 'sender',
            select: 'fullName email image role _id phone ',
        },
        {
            path: 'receiver',
            select: 'fullName email image role _id phone ',
        },
    ]);
    console.log('result', result);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Message creation failed');
    }
    if (io) {
        console.log('socket hit hoise!');
        const senderMessage = 'new-message::' + result.chat.toString();
        console.log('senderMessage', senderMessage);
        io.emit(senderMessage, result);
        const ChatListSender = yield chat_service_1.chatService.getMyChatList(result === null || result === void 0 ? void 0 : result.sender._id.toString());
        const ChatListReceiver = yield chat_service_1.chatService.getMyChatList(result === null || result === void 0 ? void 0 : result.receiver._id.toString());
        const senderChat = 'chat-list::' + result.sender._id.toString();
        const receiverChat = 'chat-list::' + result.receiver._id.toString();
        console.log('senderChat', senderChat);
        console.log('receiverChat', receiverChat);
        io.emit(receiverChat, ChatListSender);
        io.emit(senderChat, ChatListReceiver);
    }
    return result;
});
// Get all messages
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getAllMessages = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const MessageModel = new QueryBuilder_1.default(message_model_1.default.find().populate([
        {
            path: 'sender',
            select: 'name email image role _id phone ',
        },
        {
            path: 'receiver',
            select: 'name email image role _id phone ',
        },
    ]), query)
        .filter()
        // .paginate()
        .sort()
        .fields();
    const data = yield MessageModel.modelQuery;
    const meta = yield MessageModel.countTotal();
    return {
        data,
        meta,
    };
});
// Update messages
const updateMessages = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield message_model_1.default.findByIdAndUpdate(id, payload, { new: true });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Message update failed');
    }
    return result;
});
// Get messages by chat ID
const getMessagesByChatId = (chatId) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('chatId', chatId);
    const result = yield message_model_1.default.find({ chat: chatId })
        .populate('taskId')
        .sort({ createdAt: -1 });
    return result;
});
// Get message by ID
const getMessagesById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield message_model_1.default.findById(id).populate([
        {
            path: 'sender',
            select: 'name email image role _id phoneNumber ',
        },
        {
            path: 'receiver',
            select: 'name email image role _id phoneNumber ',
        },
    ]);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Oops! Message not found');
    }
    return result;
});
const deleteMessages = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const message = yield message_model_1.default.findById(id);
    if (!message) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Oops! Message not found');
    }
    // if (message?.imageUrl) {
    //   await deleteFromS3(
    //     `images/messages/${message?.chat.toString()}/${message?.id}`,
    //   );
    // }
    const result = yield message_model_1.default.findByIdAndDelete(id);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Oops! Message not found');
    }
    return result;
});
const seenMessage = (userId, chatId) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('userId', userId);
    console.log('chatId', chatId);
    const chatIdObj = new mongoose_1.default.Types.ObjectId(chatId);
    const userIdObj = new mongoose_1.default.Types.ObjectId(userId);
    const messageIdList = yield message_model_1.default.aggregate([
        {
            $match: {
                chat: chatIdObj,
                seen: false,
                sender: { $ne: userIdObj },
            },
        },
        { $group: { _id: null, ids: { $push: '$_id' } } },
        { $project: { _id: 0, ids: 1 } },
    ]);
    console.log('messageIdList', messageIdList);
    const unseenMessageIdList = messageIdList.length > 0 ? messageIdList[0].ids : [];
    console.log('unseenMessageIdList', unseenMessageIdList);
    const updateMessages = yield message_model_1.default.updateMany({ _id: { $in: unseenMessageIdList } }, { $set: { seen: true } });
    console.log('updateMessages', updateMessages);
    return updateMessages;
});
// Export all methods in the same format as the old structure
exports.messageService = {
    // addMessage,
    // getMessageById,
    // getMessages,
    // deleteMessage,
    // deleteMessagesByChatId,
    createMessages,
    getAllMessages,
    getMessagesByChatId,
    getMessagesById,
    updateMessages,
    deleteMessages,
    seenMessage,
};
