import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { taskPostService } from './taskPost.service';
import { messageService } from '../message/message.service';
import Message from '../message/message.model';
import AppError from '../../error/AppError';
import { notificationService } from '../notification/notification.service';
import { Wallet } from '../wallet/wallet.model';
import TaskPost from './taskPost.model';

const createTaskPost = catchAsync(async (req, res) => {
  console.log('hit hoise025')
  // console.log('need time', req.body.needTime)
  const taskPostData = req.body;
  console.log('taskPostData', taskPostData);
  console.log('file', req.file);
  const { userId } = req.user;
  taskPostData.posterUserId = userId;
  const parseData =
    typeof taskPostData.needTime === 'string'
      ? JSON.parse(taskPostData.needTime)
      : taskPostData.needTime;
  //   console.log('parseData', parseData);
  taskPostData.needTime = parseData;
  taskPostData.latitude = Number(taskPostData.latitude);
  taskPostData.longitude = Number(taskPostData.longitude);
  console.log('dsaffasfsafafasf')

  const updateFiles = req.files as {
    [fieldname: string]: Express.Multer.File[];
  };

  console.log('updateFiles', updateFiles);

  if (updateFiles?.taskImages && updateFiles?.taskImages?.length > 0) {
    taskPostData.taskImages = updateFiles?.taskImages?.map((file) => 
     file.path.replace(/^public[\\/]/, '')
    );
  }

  console.log('taskPostData==', taskPostData);

  const result = await taskPostService.createTaskPostService(taskPostData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Task Post create successfully!',
    data: result,
  });
});

const getAllTask = catchAsync(async (req, res) => {
  const { meta, result } = await taskPostService.getAllTaskPostQuery(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    meta: meta,
    data: result,
    message: ' All Accepted Task are requered successful!!',
  });
});

const getAllTaskByMap = catchAsync(async (req, res) => {
  const result = await taskPostService.getAllTaskByMapQuery(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: ' All Map Task are requered successful!!',
  });
});

const getTaskOverview = catchAsync(async (req, res) => {
  const result = await taskPostService.getAllTaskOverviewQuery(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: ' All overview Task are requered successful!!',
  });
});

const getAllTaskPendingCompleteCancel = catchAsync(async (req, res) => {
  const result = await taskPostService.getAllTaskPendingCompleteCancelQuery(
    req.query,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: ' All pending , calcel , complete Task are requered successful!!',
  });
});

const getAllTaskOverviewPoster = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result = await taskPostService.getAllTaskOverviewByPosterQuery(
    req.query,
    userId,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'My Task are Overview successful!!',
  });
});

const getAllTaskOverviewTaskerPoster = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result = await taskPostService.getAllTaskOverviewByTaskerPosterQuery(
    req.query,
    userId,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'My Task are Overview successful!!',
  });
});

const getAllCompleteTaskOverviewChartByTasker = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result =
    await taskPostService.getAllCompleteIncomeTaskOverviewChartByTaskerQuery(
      req.query,
      userId,
    );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'My Completed-income Task are Overview by chart successful!!',
  });
});

const getAllTaskByFilter = catchAsync(async (req, res) => {
  const { meta, result } = await taskPostService.getAllTaskPostByFilterQuery(
    req.query,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    meta: meta,
    data: result,
    message: ' All Accepted Filter Task are requered successful!!',
  });
});

const getAllTaskByTaskerPoster = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const { meta, result } = await taskPostService.getAllTaskByTaskerPosterQuery(
    req.query,
    userId,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    meta: meta,
    data: result,
    message: ' All Task Post are requered successful!!',
  });
});

const getSingleTaskPost = catchAsync(async (req, res) => {
  const result = await taskPostService.getSingleTaskPostQuery(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Single Task Post are requered successful!!',
  });
});

const taskAcceptByAdmin = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await taskPostService.taskAcceptByAdminQuery(id);

  // Send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Task Accept successfully!',
    data: result,
  });
});

const taskCancelByAdmin = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await taskPostService.taskCancelByAdminQuery(id);

  // Send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Task Cancel successfully!',
    data: result,
  });
});

const deleteSingleTaskPost = catchAsync(async (req, res) => {
  const result = await taskPostService.deletedTaskPostQuery(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Deleted Single Task Post are successful!!',
  });
});

//---------------------------------------------------------------------------//

//---------------------------------------------------------------------------//

const taskerTaskAcceptRequest = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;
  const bodyData = req.body;
  const acceptRequestData: any = {
    taskId: id,
    sender: userId,
    receiver: bodyData.receiver,
    taskStatus: 'pending',
    type: bodyData.type,
  };

  const task = await TaskPost.findById(id);

  if (!task) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Task not found');
  }
  if (task.posterUserId.toString() === userId.toString()) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You can not send offer to your own task!!',
    );
  }
  if (task.status !== 'accept') {
    throw new AppError(httpStatus.BAD_REQUEST, 'Task is not accepted');
  }
  if (['ongoing', 'complete', 'cancel'].includes(task.status)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Task is not valid! because task status is ${task.status}`,
    );
  }

  const taskRequestAlreadyCencel = await Message.findOne({
    taskId: id,
    sender: userId,
    taskStatus: 'cencel',
  });

  if (taskRequestAlreadyCencel) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'task Request already canceled!!',
    );
  }

  const taskAlreadyExist = await Message.findOne({
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
    return sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      data: taskAlreadyExist,
      message: 'Task Request already Created!!',
    });
  }

  console.log('new creae why');
  const wallet = await Wallet.findOne({ userId: userId });
  if (!wallet) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Wallet not found!!');
  }
  // console.log('acceptRequestData', acceptRequestData);
  //   const result = await taskPostService.deletedTaskPostQuery(req.params.id);

  const result = await messageService.createMessages(acceptRequestData);
  if (result) {
    const data = {
      userId: bodyData.receiver,
      message: 'Task Accept Request!!',
      type: 'success',
    };
    await notificationService.createNotification(data);
  }

  console.log('dfadlfaklfkaf;la', result);


  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Task Accept Request Successfully!!',
  });
});

const taskerTaskOfferRequest = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;
  const bodyData = req.body;
  const acceptRequestData: any = {
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
  const taskRequestAlreadyCencel = await Message.findOne({
    taskId: id,
    sender: userId,
    taskStatus: 'cencel',
  });

  if (taskRequestAlreadyCencel) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'task Request already canceled!!',
    );
  }

  if (bodyData.offerPrice) {
    const taskAlreadyExist = await Message.findOne({
      sender: userId,
      taskId: id,
      taskStatus: 'pending',
    });
    console.log('dsfadfafafas========', taskAlreadyExist);

    

    if (taskAlreadyExist) {
      const updateMessage:any = await Message.findOneAndUpdate(
        {
          taskId: id,
          sender: userId,
          taskStatus: 'pending',
        },
        {
          offerPrice: bodyData.offerPrice,
          reason: bodyData.reason,
        },
        {
          new: true,
        },
      ).populate([
        {
          path: 'sender', 
          select: 'fullName email image role _id phone ',
        }
      ]).populate('taskId');
      const senderMessage = 'new-message::' + updateMessage.chat.toString();
      // console.log('senderMessage', senderMessage);

      io.emit(senderMessage, updateMessage);
      return sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        data: updateMessage,
        message: 'Task Request already Created!!',
      });

    }
  }
  


  const wallet = await Wallet.findOne({ userId: userId });
  if (!wallet) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Wallet not found!!');
  }
  const task = await TaskPost.findById(id);
  if(!task){
    throw new AppError(httpStatus.BAD_REQUEST, 'Task not found');
  }
  if(task.posterUserId.toString() === userId.toString()){
    throw new AppError(httpStatus.BAD_REQUEST, 'You can not send offer to your own task!!');
  }
  //   const result = await taskPostService.deletedTaskPostQuery(req.params.id);
  const result = await messageService.createMessages(acceptRequestData);
  // if (result) {
  //   const data = {
  //     userId: bodyData.receiver,
  //     message: 'Task Offer Request!!',
  //     type: 'success',
  //   };
  //   await notificationService.createNotification(data);
  // }
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Task Accept Request Successfully!!',
  });
});

const posterAgainTaskOfferRequest = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;
  const bodyData = req.body;
  const acceptRequestData: any = {
    taskId: id,
    sender: userId,
    receiver: bodyData.receiver,
    taskStatus: 'pending',
    offerPrice: Number(bodyData.offerPrice),
  };
  //   const result = await taskPostService.deletedTaskPostQuery(req.params.id);
  const result = await messageService.createMessages(acceptRequestData);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Task Accept Request Successfully!!',
  });
});

const posterTaskAccepted = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;
  const bodyData = req.body;
  const acceptRequestData: any = {
    taskId: id,
    sender: userId,
    receiver: bodyData.receiver,
    chatId: bodyData.chatId,
    messageId: bodyData.messageId,
  };
  // console.log('acceptRequestData', acceptRequestData);
  //   const result = await taskPostService.deletedTaskPostQuery(req.params.id);
  const result =
    await taskPostService.posterTaskAcceptedService(acceptRequestData);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Task Accepted Successfully!!',
  });
});

const posterTaskCanceled = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;
  const bodyData = req.body;
  const cancelRequestData: any = {
    taskId: id,
    sender: userId,
    receiver: bodyData.receiver,
    chatId: bodyData.chatId,
    messageId: bodyData.messageId,
  };
  // console.log('acceptRequestData', acceptRequestData);
  //   const result = await taskPostService.deletedTaskPostQuery(req.params.id);
  const result =
    await taskPostService.posterTaskCanceledService(cancelRequestData);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Task Canceled Successfully!!',
  });
});

const taskCompleteByTasker = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const { id } = req.params;
  const result = await taskPostService.taskCompleteService(userId, id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Task complete successful!!',
  });
});

const taskPaymentRequest = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;

  // console.log('acceptRequestData', acceptRequestData);
  //   const result = await taskPostService.deletedTaskPostQuery(req.params.id);
  const result = await taskPostService.taskPaymentRequestService(userId, id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Task Payment request Successfully!!',
  });
});

const taskPaymentConfirm = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;
  const { taskerId } = req.body;

  // console.log('acceptRequestData', acceptRequestData);
  //   const result = await taskPostService.deletedTaskPostQuery(req.params.id);
  const result = await taskPostService.taskPaymentConfirmService(
    userId,
    id,
    taskerId,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Task Payment Conform Successfully!!',
  });
});

const taskReviewConfirm = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;
  const bodyData = req.body;

  // console.log('acceptRequestData', acceptRequestData);
  //   const result = await taskPostService.deletedTaskPostQuery(req.params.id);
  const result = await taskPostService.taskReviewConfirmService(
    userId,
    id,
    bodyData,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Task Review Conform Successfully!!',
  });
});

export const taskPostController = {
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
  taskAcceptByAdmin,
  taskCancelByAdmin,
  deleteSingleTaskPost,
  taskerTaskAcceptRequest,
  posterTaskAccepted,
  posterTaskCanceled,
  taskerTaskOfferRequest,
  posterAgainTaskOfferRequest,
  taskPaymentRequest,
  taskPaymentConfirm,
  taskReviewConfirm,
};
