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
exports.taskPostController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const taskPost_service_1 = require("./taskPost.service");
const message_service_1 = require("../message/message.service");
const message_model_1 = __importDefault(require("../message/message.model"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const notification_service_1 = require("../notification/notification.service");
const wallet_model_1 = require("../wallet/wallet.model");
const taskPost_model_1 = __importDefault(require("./taskPost.model"));
const createTaskPost = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    console.log('hit hoise025');
    // console.log('need time', req.body.needTime)
    const taskPostData = req.body;
    console.log('taskPostData', taskPostData);
    console.log('file', req.file);
    const { userId } = req.user;
    taskPostData.posterUserId = userId;
    const parseData = typeof taskPostData.needTime === 'string'
        ? JSON.parse(taskPostData.needTime)
        : taskPostData.needTime;
    //   console.log('parseData', parseData);
    taskPostData.needTime = parseData;
    taskPostData.latitude = Number(taskPostData.latitude);
    taskPostData.longitude = Number(taskPostData.longitude);
    console.log('dsaffasfsafafasf');
    const updateFiles = req.files;
    console.log('updateFiles', updateFiles);
    if ((updateFiles === null || updateFiles === void 0 ? void 0 : updateFiles.taskImages) && ((_a = updateFiles === null || updateFiles === void 0 ? void 0 : updateFiles.taskImages) === null || _a === void 0 ? void 0 : _a.length) > 0) {
        taskPostData.taskImages = (_b = updateFiles === null || updateFiles === void 0 ? void 0 : updateFiles.taskImages) === null || _b === void 0 ? void 0 : _b.map((file) => file.path.replace(/^public[\\/]/, ''));
    }
    console.log('taskPostData==', taskPostData);
    const result = yield taskPost_service_1.taskPostService.createTaskPostService(taskPostData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Task Post create successfully!',
        data: result,
    });
}));
const getAllTask = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { meta, result } = yield taskPost_service_1.taskPostService.getAllTaskPostQuery(req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        meta: meta,
        data: result,
        message: ' All Accepted Task are requered successful!!',
    });
}));
const getAllTaskByMap = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield taskPost_service_1.taskPostService.getAllTaskByMapQuery(req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: ' All Map Task are requered successful!!',
    });
}));
const getTaskOverview = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield taskPost_service_1.taskPostService.getAllTaskOverviewQuery(req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: ' All overview Task are requered successful!!',
    });
}));
const getAllTaskPendingCompleteCancel = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield taskPost_service_1.taskPostService.getAllTaskPendingCompleteCancelQuery(req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: ' All pending , calcel , complete Task are requered successful!!',
    });
}));
const getAllTaskOverviewPoster = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const result = yield taskPost_service_1.taskPostService.getAllTaskOverviewByPosterQuery(req.query, userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'My Task are Overview successful!!',
    });
}));
const getAllTaskOverviewTaskerPoster = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const result = yield taskPost_service_1.taskPostService.getAllTaskOverviewByTaskerPosterQuery(req.query, userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'My Task are Overview successful!!',
    });
}));
const getAllCompleteTaskOverviewChartByTasker = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const result = yield taskPost_service_1.taskPostService.getAllCompleteIncomeTaskOverviewChartByTaskerQuery(req.query, userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'My Completed-income Task are Overview by chart successful!!',
    });
}));
const getAllTaskByFilter = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { meta, result } = yield taskPost_service_1.taskPostService.getAllTaskPostByFilterQuery(req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        meta: meta,
        data: result,
        message: ' All Accepted Filter Task are requered successful!!',
    });
}));
const getAllTaskByTaskerPoster = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const { meta, result } = yield taskPost_service_1.taskPostService.getAllTaskByTaskerPosterQuery(req.query, userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        meta: meta,
        data: result,
        message: ' All Task Post are requered successful!!',
    });
}));
const getAllCancelTaskByTasker = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const { meta, result } = yield taskPost_service_1.taskPostService.getAllCancleTaskByTaskerQuery(req.query, userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        meta: meta,
        data: result,
        message: ' All Cancel Task are requered successful!!',
    });
}));
const getSingleTaskPost = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield taskPost_service_1.taskPostService.getSingleTaskPostQuery(req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Single Task Post are requered successful!!',
    });
}));
const taskAcceptByAdmin = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield taskPost_service_1.taskPostService.taskAcceptByAdminQuery(id);
    // Send response
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Task Accept successfully!',
        data: result,
    });
}));
const taskCancelByAdmin = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield taskPost_service_1.taskPostService.taskCancelByAdminQuery(id);
    // Send response
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Task Cancel successfully!',
        data: result,
    });
}));
const deleteSingleTaskPost = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield taskPost_service_1.taskPostService.deletedTaskPostQuery(req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Deleted Single Task Post are successful!!',
    });
}));
//---------------------------------------------------------------------------//
//---------------------------------------------------------------------------//
const taskerTaskAcceptRequest = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { userId } = req.user;
    const bodyData = req.body;
    const acceptRequestData = {
        taskId: id,
        sender: userId,
        receiver: bodyData.receiver,
        taskStatus: 'pending',
        type: bodyData.type,
    };
    const task = yield taskPost_model_1.default.findById(id);
    if (!task) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Task not found');
    }
    if (task.posterUserId.toString() === userId.toString()) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'You can not send offer to your own task!!');
    }
    if (task.status !== 'accept') {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Task is not accepted');
    }
    if (['ongoing', 'complete', 'cancel'].includes(task.status)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `Task is not valid! because task status is ${task.status}`);
    }
    const taskRequestAlreadyCencel = yield message_model_1.default.findOne({
        taskId: id,
        sender: userId,
        taskStatus: 'cencel',
    });
    if (taskRequestAlreadyCencel) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'task Request already canceled!!');
    }
    const taskAlreadyExist = yield message_model_1.default.findOne({
        sender: userId,
        taskId: id,
        taskStatus: 'pending',
    }).populate([
        {
            path: 'sender',
            select: 'fullName email image role _id phone ',
        },
        {
            path: 'receiver',
            select: 'fullName email image role _id phone ',
        },
    ]);
    console.log('dsfadfafafas========', taskAlreadyExist);
    if (taskAlreadyExist) {
        return (0, sendResponse_1.default)(res, {
            success: true,
            statusCode: http_status_1.default.OK,
            data: taskAlreadyExist,
            message: 'Task Request already Created!!',
        });
    }
    console.log('new creae why');
    const wallet = yield wallet_model_1.Wallet.findOne({ userId: userId });
    if (!wallet) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Wallet not found!!');
    }
    // console.log('acceptRequestData', acceptRequestData);
    //   const result = await taskPostService.deletedTaskPostQuery(req.params.id);
    const result = yield message_service_1.messageService.createMessages(acceptRequestData);
    if (result) {
        const data = {
            userId: bodyData.receiver,
            message: 'Task Accept Request!!',
            type: 'success',
        };
        yield notification_service_1.notificationService.createNotification(data);
    }
    console.log('dfadlfaklfkaf;la', result);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Task Accept Request Successfully!!',
    });
}));
const taskerTaskOfferRequest = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { userId } = req.user;
    const bodyData = req.body;
    const acceptRequestData = {
        taskId: id,
        sender: userId,
        receiver: bodyData.receiver,
        taskStatus: 'pending',
        offerPrice: Number(bodyData.offerPrice),
        type: bodyData.type,
    };
    if (bodyData.reason) {
        acceptRequestData.reason = bodyData.reason;
    }
    console.log('acceptRequestData', acceptRequestData);
    const taskRequestAlreadyCencel = yield message_model_1.default.findOne({
        taskId: id,
        sender: userId,
        taskStatus: 'cencel',
    });
    const taskRequestAlreadyAccept = yield message_model_1.default.findOne({
        taskId: id,
        sender: userId,
        taskStatus: 'accept',
    });
    if (taskRequestAlreadyCencel) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'task Request already canceled!!');
    }
    if (taskRequestAlreadyAccept) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'task Request already accepted`!!');
    }
    // if (bodyData.offerPrice) {
    //   const taskAlreadyExist = await Message.findOne({
    //     sender: userId,
    //     taskId: id,
    //     taskStatus: 'pending',
    //   });
    //   console.log('dsfadfafafas========', taskAlreadyExist);
    //   if (taskAlreadyExist) {
    //     const updateMessage:any = await Message.findOneAndUpdate(
    //       {
    //         taskId: id,
    //         sender: userId,
    //         taskStatus: 'pending',
    //       },
    //       {
    //         offerPrice: bodyData.offerPrice,
    //         reason: bodyData.reason,
    //       },
    //       {
    //         new: true,
    //       },
    //     ).populate([
    //       {
    //         path: 'sender', 
    //         select: 'fullName email image role _id phone ',
    //       }
    //     ]).populate('taskId');
    //     const senderMessage = 'new-message::' + updateMessage.chat.toString();
    //     // console.log('senderMessage', senderMessage);
    //     io.emit(senderMessage, updateMessage);
    //     return sendResponse(res, {
    //       success: true,
    //       statusCode: httpStatus.OK,
    //       data: updateMessage,
    //       message: 'Task Request already Created!!',
    //     });
    //   }
    // }
    const taskAlreadyExist = yield message_model_1.default.findOne({
        sender: userId,
        taskId: id,
        taskStatus: 'pending',
    }).populate([
        {
            path: 'sender',
            select: 'fullName email image role _id phone ',
        },
        {
            path: 'receiver',
            select: 'fullName email image role _id phone ',
        },
    ]);
    console.log('dsfadfafafas========', taskAlreadyExist);
    if (taskAlreadyExist) {
        return (0, sendResponse_1.default)(res, {
            success: true,
            statusCode: http_status_1.default.OK,
            data: taskAlreadyExist,
            message: 'Task offer Request already Created!!',
        });
    }
    const wallet = yield wallet_model_1.Wallet.findOne({ userId: userId });
    if (!wallet) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Wallet not found!!');
    }
    const task = yield taskPost_model_1.default.findById(id);
    if (!task) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Task not found');
    }
    if (task.status !== 'accept') {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Task is not accepted');
    }
    if (['ongoing', 'complete', 'cancel'].includes(task.status)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `Task is not valid! because task status is ${task.status}`);
    }
    if (task.posterUserId.toString() === userId.toString()) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'You can not send offer to your own task!!');
    }
    //   const result = await taskPostService.deletedTaskPostQuery(req.params.id);
    const result = yield message_service_1.messageService.createMessages(acceptRequestData);
    // if (result) {
    //   const data = {
    //     userId: bodyData.receiver,
    //     message: 'Task Offer Request!!',
    //     type: 'success',
    //   };
    //   await notificationService.createNotification(data);
    // }
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Task Accept Request Successfully!!',
    });
}));
const taskOfferPriceAdjust = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    console.log('id', id);
    const bodyData = req.body;
    if (!bodyData.offerPrice) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Offer price is required');
    }
    if (bodyData.offerPrice < 0) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Offer price must be greater than 0');
    }
    const acceptRequestData = {
        taskId: id,
        offerPrice: Number(bodyData.offerPrice),
    };
    if (bodyData.reason) {
        acceptRequestData.reason = bodyData.reason;
    }
    console.log('acceptRequestData', acceptRequestData);
    const taskExsit = yield taskPost_model_1.default.findById(id);
    if (!taskExsit) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Task not found');
    }
    if (['ongoing', 'complete', 'cancel'].includes(taskExsit.status)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `Task is not valid! because task status is ${taskExsit.status}`);
    }
    if (taskExsit.status !== 'accept') {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Task is not accepted');
    }
    console.log('acceptRequestData', acceptRequestData);
    const taskRequestAlreadyCencel = yield message_model_1.default.findOne({
        _id: bodyData.messageId,
        taskId: id,
        taskStatus: 'cencel',
    });
    const taskRequestAlreadyAccepted = yield message_model_1.default.findOne({
        _id: bodyData.messageId,
        taskId: id,
        taskStatus: 'accept'
    });
    if (taskRequestAlreadyCencel) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'task Request already canceled!!');
    }
    if (taskRequestAlreadyAccepted) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'task Request already accepted`!!');
    }
    const notValidUserForThisMessage = yield message_model_1.default.findOne({
        _id: bodyData.messageId,
        taskId: id,
    });
    if (!notValidUserForThisMessage) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Message not found');
    }
    if (notValidUserForThisMessage.sender.toString() !== req.user.userId.toString() && notValidUserForThisMessage.receiver.toString() !== req.user.userId.toString()) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'You are not valid user for this message');
    }
    const taskAlreadyExist = yield message_model_1.default.findOne({
        _id: bodyData.messageId,
        taskId: id,
        taskStatus: 'pending',
    });
    console.log('dsfadfafafas========', taskAlreadyExist);
    if (taskAlreadyExist) {
        const updateMessage = yield message_model_1.default.findOneAndUpdate({
            _id: bodyData.messageId,
            taskId: id,
            taskStatus: 'pending',
        }, {
            offerPrice: bodyData.offerPrice,
            reason: bodyData.reason,
        }, {
            new: true,
        })
            .populate([
            {
                path: 'sender',
                select: 'fullName email image role _id phone ',
            },
        ])
            .populate('taskId');
        const senderMessage = 'new-message::' + updateMessage.chat.toString();
        // console.log('senderMessage', senderMessage);
        io.emit(senderMessage, updateMessage);
        return (0, sendResponse_1.default)(res, {
            success: true,
            statusCode: http_status_1.default.OK,
            data: updateMessage,
            message: 'Task Request already Created!!',
        });
    }
    else {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Task Request not found!!');
    }
}));
const posterAgainTaskOfferRequest = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { userId } = req.user;
    const bodyData = req.body;
    const acceptRequestData = {
        taskId: id,
        sender: userId,
        receiver: bodyData.receiver,
        taskStatus: 'pending',
        offerPrice: Number(bodyData.offerPrice),
    };
    //   const result = await taskPostService.deletedTaskPostQuery(req.params.id);
    const result = yield message_service_1.messageService.createMessages(acceptRequestData);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Task Accept Request Successfully!!',
    });
}));
const posterTaskAccepted = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // const { userId } = req.user;
    const bodyData = req.body;
    const acceptRequestData = {
        taskId: id,
        chatId: bodyData.chatId,
        messageId: bodyData.messageId,
    };
    // console.log('acceptRequestData', acceptRequestData);
    //   const result = await taskPostService.deletedTaskPostQuery(req.params.id);
    const result = yield taskPost_service_1.taskPostService.posterTaskAcceptedService(acceptRequestData);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Task Accepted Successfully!!',
    });
}));
const posterTaskerTaskCanceled = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const bodyData = req.body;
    const cancelRequestData = {
        taskId: id,
        chatId: bodyData.chatId,
        messageId: bodyData.messageId,
    };
    // console.log('acceptRequestData', acceptRequestData);
    //   const result = await taskPostService.deletedTaskPostQuery(req.params.id);
    const result = yield taskPost_service_1.taskPostService.posterTaskerTaskCanceledService(cancelRequestData);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Task Canceled Successfully!!',
    });
}));
const taskCompleteByTasker = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const { id } = req.params;
    const result = yield taskPost_service_1.taskPostService.taskCompleteService(userId, id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Task complete successful!!',
    });
}));
const taskPaymentRequest = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { userId } = req.user;
    // console.log('acceptRequestData', acceptRequestData);
    //   const result = await taskPostService.deletedTaskPostQuery(req.params.id);
    const result = yield taskPost_service_1.taskPostService.taskPaymentRequestService(userId, id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Task Payment request Successfully!!',
    });
}));
const taskPaymentConfirm = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { userId } = req.user;
    // console.log('acceptRequestData', acceptRequestData);
    //   const result = await taskPostService.deletedTaskPostQuery(req.params.id);
    const result = yield taskPost_service_1.taskPostService.taskPaymentConfirmService(userId, id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Task Payment Conform Successfully!!',
    });
}));
const taskReviewConfirm = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { userId } = req.user;
    const bodyData = req.body;
    // console.log('acceptRequestData', acceptRequestData);
    //   const result = await taskPostService.deletedTaskPostQuery(req.params.id);
    const result = yield taskPost_service_1.taskPostService.taskReviewConfirmService(userId, id, bodyData);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Task Review Conform Successfully!!',
    });
}));
exports.taskPostController = {
    createTaskPost,
    taskCompleteByTasker,
    getSingleTaskPost,
    getAllTask,
    getAllTaskByMap,
    getTaskOverview,
    getAllTaskPendingCompleteCancel,
    getAllTaskOverviewTaskerPoster,
    getAllCompleteTaskOverviewChartByTasker,
    getAllTaskOverviewPoster,
    getAllTaskByFilter,
    getAllTaskByTaskerPoster,
    getAllCancelTaskByTasker,
    taskAcceptByAdmin,
    taskCancelByAdmin,
    deleteSingleTaskPost,
    taskerTaskAcceptRequest,
    posterTaskAccepted,
    posterTaskerTaskCanceled,
    taskerTaskOfferRequest,
    posterAgainTaskOfferRequest,
    taskPaymentRequest,
    taskPaymentConfirm,
    taskReviewConfirm,
    taskOfferPriceAdjust,
};
