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
exports.chatService = void 0;
const chat_model_1 = __importDefault(require("./chat.model"));
const user_models_1 = require("../user/user.models");
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const message_model_1 = __importDefault(require("../message/message.model"));
// Create a new chat (Equivalent to `createChat` in your old code)
// export const createChat = async (user: any, participant: any) => {
//   const newChat = new Chat({
//     participants: [user, participant],
//   });
//   const savedChat = await newChat.save();
//   return await savedChat.populate({
//     path: 'participants',
//     match: { _id: { $ne: user } },
//   });
// };
// Get chat by ID
// export const getChatById = async (id: string) => {
//   return await Chat.findById(id);
// };
// Get chat by participants
// export const getChatByParticipants = async (user: any, participant: any) => {
//   const chat = await Chat.findOne({
//     participants: { $all: [user, participant] },
//   }).populate({
//     path: 'participants',
//     match: { _id: { $ne: user } },
//   });
//   return chat;
// };
// // Get chat details by participant ID
// export const getChatDetailsByParticipantId = async (
//   user: any,
//   participant: any,
// ) => {
//   const chat = await Chat.findOne({
//     participants: { $all: [user, participant] },
//   });
//   return chat;
// };
// Delete chat by ID (Equivalent to `deleteChatList` in your old code)
// export const deleteChatList = async (chatId: any) => {
//   return await Chat.findByIdAndDelete(chatId);
// };
// export const getChatByParticipantId = async (filters: any, options: any) => {
//   // // console.log(filters, options);
//   // console.log('filters ----', filters);
//   try {
//     const page = Number(options.page) || 1;
//     const limit = Number(options.limit) || 10;
//     const skip = (page - 1) * limit;
//     const participantId = new mongoose.Types.ObjectId(filters.participantId);
//     // console.log('participantId===', participantId);
//     const name = filters.name || '';
//     // console.log({ name });
//     const allChatLists = await Chat.aggregate([
//       { $match: { participants: participantId } },
//       {
//         $lookup: {
//           from: 'messages',
//           let: { chatId: '$_id' },
//           pipeline: [
//             { $match: { $expr: { $eq: ['$chat', '$$chatId'] } } },
//             { $sort: { createdAt: -1 } },
//             { $limit: 1 },
//             { $project: { message: 1, createdAt: 1 } },
//           ],
//           as: 'latestMessage',
//         },
//       },
//       { $unwind: { path: '$latestMessage', preserveNullAndEmptyArrays: true } },
//       { $sort: { 'latestMessage.createdAt': -1 } },
//       {
//         $lookup: {
//           from: 'users',
//           localField: 'participants',
//           foreignField: '_id',
//           as: 'participants',
//         },
//       },
//       {
//         $addFields: {
//           participants: {
//             $map: {
//               input: {
//                 $filter: {
//                   input: '$participants',
//                   as: 'participant',
//                   cond: { $ne: ['$$participant._id', participantId] },
//                 },
//               },
//               as: 'participant',
//               in: {
//                 _id: '$$participant._id',
//                 fullName: '$$participant.fullName',
//                 image: '$$participant.image',
//               },
//             },
//           },
//         },
//       },
//       {
//         $match: {
//           participants: {
//             $elemMatch: {
//               fullName: { $regex: name },
//             },
//           },
//         },
//       },
//       {
//         $addFields: {
//           participant: { $arrayElemAt: ['$participants', 0] },
//         },
//       },
//       {
//         $project: {
//           latestMessage: 1,
//           groupName: 1,
//           type: 1,
//           groupAdmin: 1,
//           image: 1,
//           participant: 1,
//         },
//       },
//       {
//         $facet: {
//           totalCount: [{ $count: 'count' }],
//           data: [{ $skip: skip }, { $limit: limit }],
//         },
//       },
//     ]);
//     // console.log('allChatLists');
//     // console.log(allChatLists);
//     const totalResults =
//       allChatLists[0]?.totalCount?.length > 0
//         ? allChatLists[0]?.totalCount[0]?.count
//         : 0;
//     const totalPages = Math.ceil(totalResults / limit);
//     const pagination = { totalResults, totalPages, currentPage: page, limit };
//     // return { chatList: allChatLists, pagination };
//     return { chatList: allChatLists[0]?.data, pagination };
//     // return allChatLists;
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// };
// Get participant lists (Equivalent to `getMyChatList` in your old code)
// export const getMyChatList = async (userId: any) => {
//   const myId = new mongoose.Types.ObjectId(userId);
//   const result = await Chat.aggregate([
//     { $match: { participants: { $in: [myId] } } },
//     { $unwind: '$participants' },
//     { $match: { participants: { $ne: myId } } },
//     {
//       $group: {
//         _id: null,
//         participantIds: { $addToSet: '$participants' },
//       },
//     },
//   ]);
//   return result;
// };
//-----------------------------------------------------------//
//-----------------------------------------------------------//
const createChat = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('chat payload', payload);
    const user1 = yield user_models_1.User.findById(payload === null || payload === void 0 ? void 0 : payload.participants[0]);
    if (!user1) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Invalid user');
    }
    const user2 = yield user_models_1.User.findById(payload === null || payload === void 0 ? void 0 : payload.participants[1]);
    if (!user2) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Invalid user');
    }
    const alreadyExists = yield chat_model_1.default.findOne({
        participants: { $all: payload.participants },
    }).populate(['participants']);
    console.log('alreadyExists', alreadyExists);
    if (alreadyExists) {
        return alreadyExists;
    }
    else {
        const result = yield chat_model_1.default.create(payload);
        if (!result) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Chat creation failed');
        }
        return result;
    }
});
// Get my chat list
const getMyChatList = (userId, query) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('*****', userId);
    console.log('*****query', query);
    // const chats = await Chat.find({
    //   participants: { $all: userId },
    // }).populate({
    //   path: 'participants',
    //   select: 'fullName email image role _id phone',
    //   match: { _id: { $ne: userId } },
    // });
    // console.log('chats==*********', chats);
    let chats;
    if (query && query.search && query.search !== '') {
        const searchRegExp = new RegExp('.*' + query.search + '.*', 'i');
        const matchingUsers = yield user_models_1.User.find({ fullName: searchRegExp }).select('_id');
        const matchingUserIds = matchingUsers.map((u) => u._id);
        chats = yield chat_model_1.default.find({
            $and: [
                { participants: { $all: [userId] } },
                { participants: { $in: matchingUserIds } },
            ],
        }).populate({
            path: 'participants',
            select: 'fullName email image role _id phone',
            match: { _id: { $ne: userId } },
        });
    }
    else {
        chats = yield chat_model_1.default.find({
            participants: { $all: userId },
        }).populate({
            path: 'participants',
            select: 'fullName email image role _id phone',
            match: { _id: { $ne: userId } },
        });
    }
    // const chatsQuery = new QueryBuilder(
    //   Chat.find({ participants: { $all: userId } })
    //   .populate({
    //     path: 'participants',
    //     select: 'fullName email image role _id phone',
    //     match: { _id: { $ne: userId } },
    //   }),
    //   query || {},
    // )
    //   .search([''])
    //   .filter()
    //   .sort()
    //   .paginate()
    //   .fields();
    // const chats = await chatsQuery.modelQuery;
    // const meta = await chatsQuery.countTotal();
    if (!chats) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Chat list not found');
    }
    const data = [];
    for (const chatItem of chats) {
        const chatId = chatItem === null || chatItem === void 0 ? void 0 : chatItem._id;
        // Find the latest message in the chat
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const message = yield message_model_1.default.findOne({ chat: chatId }).sort({
            updatedAt: -1,
        });
        console.log('message', message);
        const unreadMessageCount = yield message_model_1.default.countDocuments({
            chat: chatId,
            seen: false,
            sender: { $ne: userId },
        });
        console.log('unreadMessageCount', unreadMessageCount);
        // if (message) {
        //   data.push({ chat: chatItem, message: message, unreadMessageCount });
        // }
        const defaultMessage = {
            _id: '',
            text: '',
            image: '',
            seen: false,
            sender: '',
            receiver: '',
            chat: '',
            taskId: null,
            taskStatus: null,
            offerPrice: 0,
            reason: '',
            type: '',
            createdAt: null,
            updatedAt: null,
            __v: '',
        };
        data.push({
            chat: chatItem,
            message: message ? message : defaultMessage,
            unreadMessageCount: message ? unreadMessageCount : 0,
        });
    }
    data.sort((a, b) => {
        const dateA = (a.message && a.message.createdAt) || 0;
        const dateB = (b.message && b.message.createdAt) || 0;
        return dateB - dateA;
    });
    return data.length ? data : chats;
});
// Get chat by ID
const getChatById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield chat_model_1.default.findById(id).populate({
        path: 'participants',
        select: 'fullName email image role _id phone ',
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Chat not found');
    }
    return result;
});
// Update chat list
const updateChatList = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield chat_model_1.default.findByIdAndUpdate(id, payload, { new: true });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Chat not found');
    }
    return result;
});
const deleteChatList = (id) => __awaiter(void 0, void 0, void 0, function* () {
    // await deleteFromS3(`images/messages/${id}`);
    const result = yield chat_model_1.default.findByIdAndDelete(id);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Chat not found');
    }
    return result;
});
// Export all functions as part of chatService object (Optional)
exports.chatService = {
    createChat,
    getChatById,
    // getChatByParticipants,
    // getChatDetailsByParticipantId,
    // getChatByParticipantId,
    deleteChatList,
    getMyChatList,
    updateChatList,
};
