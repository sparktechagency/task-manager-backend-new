import AppError from '../../error/AppError';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import { TTaskPost } from './taskPost.interface';
import TaskPost from './taskPost.model';
import Chat from '../chat/chat.model';
import Message from '../message/message.model';
import { Wallet } from '../wallet/wallet.model';
import { User } from '../user/user.models';
import { notificationService } from '../notification/notification.service';

const createTaskPostService = async (payload: TTaskPost) => {

  const isExistWallet:any = await Wallet.findOne({
    userId: payload.posterUserId,
  });

  if (!isExistWallet) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Wallet not found');
  }

  // Check if the total wallet balance is 0
  // const totalBalance = isExistWallet.reduce(
  //   (acc, wallet) => acc + wallet.amount,
  //   0,
  // );

  if (isExistWallet.amount === 0 || isExistWallet.amount < payload.price) {
    throw new AppError(
     402,
      'Your wallet balance is insufficient',
    );
  }
  const result = await TaskPost.create(payload);
  if(result){
    let remainingAmount = result.price;

    const updateWalletAmount = await Wallet.findOneAndUpdate(
      {userId:result.posterUserId},
      { $inc: { amount: -remainingAmount } },
      { new: true },
    );
    console.log('updateWalletAmount', updateWalletAmount);

    if (!updateWalletAmount) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Wallet updated failed!!');
    }

    // for (const wallet of isExistWallet) {
    //   if (remainingAmount > 0) {
    //     wallet.amount -= remainingAmount;
    //     await wallet.save();
    //   } else {
    //     break;
    //   }
    // }

      const data = {
        role:"admin",
        message: 'Task created successfully! Please Accept/Reject Task',
        type:"success",
      };
      await notificationService.createNotification(data);
  


  }
  return result;
};



const getAllTaskPostQuery = async (query: Record<string, unknown>) => {
  const TaskPostQuery = new QueryBuilder(
    TaskPost.find({ }).populate('posterUserId').populate('taskerUserId'),
    query,
  )
    .search([''])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await TaskPostQuery.modelQuery;
  const meta = await TaskPostQuery.countTotal();
  return { meta, result };
};

const getAllTaskByMapQuery = async (query: Record<string, unknown>) => {

 const userLongitude = Number(query.userLongitude);
 const userLatitude = Number(query.userLatitude);
 const radiusInKilometers = 20;

 const tasks = await TaskPost.find({
   status: 'accept',
   location: {
     $geoWithin: {
       $centerSphere: [
         [userLongitude, userLatitude], 
         radiusInKilometers / 6378.1,
       ],
     },
   },
 });

 return tasks;
};


const getAllTaskOverviewQuery = async (query: Record<string, unknown>) => {
 const totalTask = await TaskPost.find({status: 'accept'}).countDocuments();
 const totalOngoingTask = await TaskPost.find({ status: 'ongoing' }).countDocuments();
 const tasker = await User.find({role: 'tasker'}).countDocuments();
 const poster = await User.find({role: 'poster'}).countDocuments();
 const result = {
  totalTask,
  tasker,
  poster,
  totalOngoingTask
 }

  return result;
};

const getAllTaskPendingCompleteCancelQuery = async (query: Record<string, unknown>) => {
 const totalPendingTask = await TaskPost.find({ status: 'ongoing' }).countDocuments();
 const totalOngoingTask = await TaskPost.find({
   status: 'cancel',
 }).countDocuments();
 const totalCompleteTask = await TaskPost.find({
   status: 'complete',
 }).countDocuments();
 const result = {
   totalPendingTask,
   totalOngoingTask,
   totalCompleteTask,
 };

  return result;
};


const getAllTaskOverviewByPosterQuery = async (
  query: Record<string, unknown>,
  userId: string,
) => {
  const tasksOngoing = await TaskPost.find({
    posterUserId: userId,
    status: 'ongoing',
  }).countDocuments();
  const tasksComplete = await TaskPost.find({
    posterUserId: userId,
    status: 'complete',
  }).countDocuments();
  const tasksCancel = await TaskPost.find({
    posterUserId: userId,
    status: 'cancel',
  }).countDocuments();

  return {
    tasksOngoing,
    tasksComplete,
    tasksCancel,
  };
};


const getAllTaskOverviewByTaskerPosterQuery = async (
  query: Record<string, unknown>,
  userId: string,
) => {

  const user = await User.findById(userId);
  if(!user){
    throw new AppError(404, 'User not found');
  }
  const updateUserId = user.role === 'tasker' ? 'taskerUserId' : 'posterUserId';

  const tasksOngoing = await TaskPost.find({
    [updateUserId]: userId,
    status: ['ongoing', 'accept'],
  }).countDocuments();
  const tasksComplete = await TaskPost.find({
    [updateUserId]: userId,
    status: 'complete',
  }).countDocuments();
  const tasksCancel = await TaskPost.find({
    [updateUserId]: userId,
    status: 'cancel',
  }).countDocuments();

  return {
    tasksOngoing,
    tasksComplete,
    tasksCancel,
  };
};



const getAllCompleteIncomeTaskOverviewChartByTaskerQuery = async (
  query: Record<string, unknown>,
  userId: string,
) => {
  console.log('query', query);
  let result: any;
  if (query.status === 'complete') {
    const currentDate = new Date();
    const sevenDaysAgo = new Date(currentDate);
    sevenDaysAgo.setDate(currentDate.getDate() - 7);

    const tasksComplete = await TaskPost.find({
      taskerUserId: userId,
      status: 'complete',
      updatedAt: { $gte: sevenDaysAgo, $lte: currentDate },
    });

    console.log('tasksComplete', tasksComplete);

    const allDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

    const taskCountByDay = tasksComplete.reduce(
      (acc, task) => {
        const updatedAt = new Date(task.updatedAt);
        const day = updatedAt
          .toLocaleDateString('en-US', { weekday: 'short' })
          .toLowerCase();

        if (!acc[day]) {
          acc[day] = 0;
        }
        acc[day]++;
        return acc;
      },
      {} as Record<string, number>,
    );

    result = allDays.map((day) => ({
      day,
      task: taskCountByDay[day] || 0, 
    }));
  }
  // else if (query.status === 'monthly') {
  //   if (query.status === 'monthly') {
  //     const tasksComplete = await TaskPost.find({
  //       taskerUserId: userId,
  //       status: 'complete',
  //     });

  //     const allMonths = [
  //       'jan',
  //       'feb',
  //       'mar',
  //       'apr',
  //       'may',
  //       'jun',
  //       'jul',
  //       'aug',
  //       'sep',
  //       'oct',
  //       'nov',
  //       'dec',
  //     ];

  //     const taskCountByMonth = tasksComplete.reduce(
  //       (acc, task) => {
  //         const updatedAt = new Date(task.updatedAt);
  //         const month = updatedAt
  //           .toLocaleDateString('en-US', { month: 'short' })
  //           .toLowerCase();

  //         acc[month] = (acc[month] || 0) + 1;
  //         return acc;
  //       },
  //       {} as Record<string, number>,
  //     );

  //     result = allMonths.map((month) => ({
  //       day: month,
  //       task: taskCountByMonth[month] || 0,
  //     }));
  //   }
    
  // }



  else if (query.startDate && query.endDate) {
    const startDateRaw = query.startDate;
    const endDateRaw = query.endDate;

    // Validate input and convert to Date only if valid
    const start =
      typeof startDateRaw === 'string' || typeof startDateRaw === 'number'
        ? new Date(startDateRaw)
        : null;

    const end =
      typeof endDateRaw === 'string' || typeof endDateRaw === 'number'
        ? new Date(endDateRaw)
        : null;

    if (!start || !end) {
      throw new AppError(400, 'Invalid date format');
    }

    end.setHours(23, 59, 59, 999);

    const tasksComplete = await TaskPost.find({
      taskerUserId: userId,
      status: 'complete',
      updatedAt: {
        $gte: start,
        $lte: end,
      },
    });

    result = tasksComplete.map((task) => ({
      day: task.updatedAt,
      task: 1,
    }));
 
  } else {
    const currentDate = new Date();
    const sevenDaysAgo = new Date(currentDate);
    sevenDaysAgo.setDate(currentDate.getDate() - 7);

    // Fetch tasks completed by the user in the last 7 days
    const tasksComplete = await TaskPost.find({
      taskerUserId: userId,
      paymentStatus: 'paid', // Filter for tasks that are paid
      updatedAt: { $gte: sevenDaysAgo, $lte: currentDate }, // Filter tasks based on the update date
    });

    // Group tasks by day and sum the price of tasks per day
    const taskIncomeByDay = tasksComplete.reduce(
      (acc, task) => {
        const updatedAt = new Date(task.updatedAt);
        const day = updatedAt
          .toLocaleDateString('en-US', { weekday: 'short' })
          .toLowerCase(); // Get the day (e.g., "sun", "mon")

        if (!acc[day]) {
          acc[day] = 0; // Initialize income for the day
        }

        acc[day] += task.price; // Add price to the total income for that day

        return acc;
      },
      {} as Record<string, number>,
    );

    // Ensure all days are represented, even if no tasks were completed
    const allDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    result = allDays.map((day) => ({
      day,
      totalIncome: taskIncomeByDay[day] || 0, // Set to 0 if no income for the day
    }));
  }

  return result;
};






const getAllTaskPostByFilterQuery = async (query: Record<string, unknown>) => {
  console.log('filter query data', query);

  let newQuery:any = {};

  if (
    query.minPrice &&
    query.maxPrice &&
    query.minPrice !== '' &&
    query.maxPrice !== '' &&
    query.maxPrice !== null &&
    query.minPrice !== null
  ) {
    const price = {
      $gte: Number(query.minPrice),
      $lte: Number(query.maxPrice),
    };

    delete query.minPrice;
    delete query.maxPrice;
    newQuery = { ...query, price };
  } else {
    newQuery = { ...query };
  }

  console.log('newQuery filter', newQuery);
  // console.log('new filter query data', query);

  // this is sort by price, post date, due date
  // This is the sorting logic for price, postDate, and dueDate
//    const sortObject: any = {};
//   if (
//     query.price &&
//     query.postDate &&
//     query.dueDate &&
//     query.price !== '' &&
//     query.postDate !== '' &&
//     query.dueDate !== '' &&
//     query.price !== null &&
//     query.postDate !== null &&
//     query.dueDate !== null
//   ) {
//     console.log('sort hit hoise');

   

//     // Sorting by price
//     if (query.price === 'high') {
//       sortObject.price = -1; 
//     } else if (query.price === 'low') {
//       sortObject.price = 1; 
//     }

//     // Sorting by postDate
//     if (query.postDate === 'high') {
//       sortObject.postDate = -1; 
//     } else if (query.postDate === 'low') {
//       sortObject.postDate = 1; 
//     }

//     // Sorting by dueDate
//     if (query.dueDate === 'high') {
//       sortObject.dueDate = -1; 
//     } else if (query.dueDate === 'low') {
//       sortObject.dueDate = 1; 
//     }

//   }

   const sortArray = [];

if (query.price) {
  sortArray.push(`price ${query.price === 'high' ? -1 : 1}`); 
}

if (query.postDate) {
  sortArray.push(`createdAt ${query.postDate === 'high' ? -1 : 1}`); 
}

if (query.dueDate) {
  sortArray.push(`dueDate ${query.dueDate === 'high' ? -1 : 1}`); 
}

// Default sorting logic if no sort options are provided
const sortString = sortArray.length > 0 ? sortArray.join(',') : '-createdAt';
// console.log('sortString:', sortString);
delete query.price;
delete query.postDate;
delete query.dueDate;
// newQuery.sort = sortString;
newQuery = { ...query, sort: sortString };




console.log('newQuery ===', newQuery);
//  "sort": "price high,postDate low,dueDate high"

  // sort query data
//   console.log('sortObject', sortObject);

  const TaskPostQuery = new QueryBuilder(TaskPost.find({}), newQuery)
    .search(['taskName', 'taskDetails', 'category'])
    .filter()
    .multiplesort()
    // .sort()
    .paginate()
    .fields();

  const result = await TaskPostQuery.modelQuery;
  const meta = await TaskPostQuery.countTotal();
  return { meta, result };
};

const getAllTaskByTaskerPosterQuery = async (
  query: Record<string, unknown>,
  posterTaskerUserId: string,
) => {

  console.log('posterTaskerUserId', posterTaskerUserId);
  const user = await User.findById(posterTaskerUserId);
  if(!user){
    throw new AppError(404, 'User not found');
  }

  const userField = user?.role === 'poster' ? 'posterUserId' : 'taskerUserId';

  if (query.status === 'ongoing') {
    query.status = ['ongoing', 'accept'];
  }

  console.log('query', query);
  const TaskPostQuery = new QueryBuilder(
    TaskPost.find({ [userField]: posterTaskerUserId })
      .populate('posterUserId')
      .populate('taskerUserId'),
    query,
  )
    .search([''])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await TaskPostQuery.modelQuery;
  const meta = await TaskPostQuery.countTotal();
  return { meta, result };
};

// const getAllTaskByTaskerQuery = async (
//   query: Record<string, unknown>,
//   taskerUserId: string,
// ) => {
//   const TaskPostQuery = new QueryBuilder(
//     TaskPost.find({ taskerUserId })
//       .populate('posterUserId')
//       .populate('taskerUserId'),
//     query,
//   )
//     .search([''])
//     .filter()
//     .sort()
//     .paginate()
//     .fields();

//   const result = await TaskPostQuery.modelQuery;
//   const meta = await TaskPostQuery.countTotal();
//   return { meta, result };
// };

const getSingleTaskPostQuery = async (id: string) => {
  const taskPost = await TaskPost.findById(id).populate('posterUserId').populate('taskerUserId');
  if (!taskPost) {
    throw new AppError(404, 'TaskPost Not Found!!');
  }
//   const result = await TaskPost.aggregate([
//     { $match: { _id: new mongoose.Types.ObjectId(id) } },
//     {
//         $lookup:{
//             from:"users",
//             localField:"posterUserId",
//             foreignField:"_id",
//             as:"posterUser"
//         }
//     }
//   ]);
//   if (result.length === 0) {
//     throw new AppError(404, 'TaskPost not found!');
//   }

//   return result[0];
return taskPost;
};

const taskAcceptByAdminQuery = async (
  id: string,
) => {
  if (!id ) {
    throw new AppError(400, 'Invalid id parameters');
  }

  const result = await TaskPost.findByIdAndUpdate(
   id,
    {status:"accept"},
    { new: true, runValidators: true },
  );

  if (!result) {
    throw new AppError(404, 'Task accept not found!!');
  }
  return result;
};

const taskCancelByAdminQuery = async (
  id: string
) => {
  if (!id) {
    throw new AppError(400, 'Invalid id parameters');
  }

  const result = await TaskPost.findByIdAndUpdate(
    id,
    { status: 'cancel' },
    { new: true, runValidators: true },
  );

  if (!result) {
    throw new AppError(404, 'Task cancel not found!!');
  }
  return result;
};

const deletedTaskPostQuery = async (id: string) => {
  const result = await TaskPost.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'TaskPost not found');
  }
  return result;
  
};

//---------------------------------------------------------------------------//

//---------------------------------------------------------------------------//



const posterTaskAcceptedService = async (payload: any) => {
  console.log('task accept payload', payload);
  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    const chat = await Chat.findOne({
      participants: { $all: [payload.sender, payload.receiver] },
    })
      .populate(['participants'])
      .session(session);

    if (!chat) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Chat not found');
    }

    const task = await TaskPost.findById(payload.taskId).session(session);
 
    if (!task) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Task not found');
    }
    console.log('sdfafafasfsafa', task);
    if (task.status !== 'accept') {
      throw new AppError(httpStatus.BAD_REQUEST, 'Task is not accepted');
    }
    if (['ongoing', 'complete', 'cancel'].includes(task.status)) {
      throw new AppError(httpStatus.BAD_REQUEST, `Task is not valid! because task status is ${task.status}`);
    }

    const message = await Message.findById(payload.messageId).session(session);

    if (!message) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Message not found');
    }

    const alreadyAccept = await Message.findOne({
      taskId: payload.taskId,
      taskStatus: 'accept',
    }).session(session);

    console.log('alreadyAccept', alreadyAccept);

    if (alreadyAccept) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Task Request already accepted!!',
      );
    }

    const alreadyCancel = await Message.findOne({
      taskId: payload.taskId,
      taskStatus: 'cancel',
    }).session(session);

    if (alreadyCancel) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Task Request already canceled!!',
      );
    }

    const result: any = await Message.findOneAndUpdate(
      { _id: payload.messageId, chat: chat._id, taskId: payload.taskId },
      { taskStatus: 'accept' },
      { new: true, runValidators: true, session },
    ).populate([
      {
        path: 'sender',
        select: 'fullName email image role _id phone',
      },
    ]).populate('taskId');

    console.log('first result', result);

    
      const taskPost = await TaskPost.findById(payload.taskId).session(session);
      if (!taskPost) {
        throw new AppError(httpStatus.BAD_REQUEST, 'TaskPost not found');
      }

      taskPost.status = 'ongoing';
      taskPost.taskerUserId = payload.receiver;
      await taskPost.save({ session });

console.log('first taskPost', taskPost);
       
          const updatedResult:any = await Message.findById(result._id)
            .populate([
              { path: 'sender', select: 'fullName email image role _id phone' },
              { path: 'taskId' }, // This now reflects updated taskPost
            ])
            .session(session);

            const data = {
              userId: payload.receiver,
              message: 'Task Accept success!!',
              type: 'success',
            };
            await notificationService.createNotification(data, session);
  

            const senderMessage = 'new-message::' + updatedResult.chat?._id.toString();
            console.log('senderMessage', senderMessage);

            io.emit(senderMessage, updatedResult);


    await session.commitTransaction();
    session.endSession();

   

    return result;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};



const posterTaskCanceledService = async (payload: any) => {
    console.log('cancel payload', payload);
    const chat = await Chat.findOne({ participants: { $all: [payload.sender, payload.receiver] } }).populate(['participants']);

    console.log('chat participant', chat);

    if (!chat || !chat._id) {
      throw new Error('Chat object or chat._id is missing');
    }

    const message = await Message.findById(payload.messageId);

    if(!message){
        throw new AppError(httpStatus.BAD_REQUEST, 'Message not found');
    }

    const task = await TaskPost.findById(payload.taskId);

    if(!task){
        throw new AppError(httpStatus.BAD_REQUEST, 'Task not found');
    }

   
   

    // console.log('chat', chat);
    console.log('message', message);
    // console.log('chat', chat);

    console.log('console opore==', {
      chat: chat._id,
      taskId: task._id,
      taskStatus: 'cencel',
    });

    const alreadyCancel = await Message.findOne({
      chat: chat._id,
      taskId: task._id,
      taskStatus: 'cencel',
    });

    console.log('alreadyCancel===', alreadyCancel);

    if (alreadyCancel) {
        throw new AppError(httpStatus.BAD_REQUEST, 'task Request already canceled!!'); 
    }

    const result:any = await Message.findOneAndUpdate(
      { _id: payload.messageId, chat: chat._id, taskId: payload.taskId },
      { taskStatus: 'cencel' },
      { new: true, runValidators: true },
    ).populate([
      {
        path: 'sender',
        select: 'fullName email image role _id phone',
      },
    ]).populate('taskId');
    
    if (!result) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Message not found or conditions do not match');
    }
    

    const senderMessage = 'new-message::' + result.chat._id.toString();
    console.log('senderMessage', senderMessage);

    io.emit(senderMessage, result);



  return result;
};


const taskCompleteService = async (userId: string, taskId: string) => {
  const task = await TaskPost.findOne({ _id: taskId, taskerUserId: userId });

  if (!task) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Task not found');
  }

  if (task.status === 'complete') {
    throw new AppError(httpStatus.BAD_REQUEST, 'Task is already completed');
  }

  const result = await TaskPost.findOneAndUpdate(
    { _id: taskId, taskerUserId: userId },
    { status: 'complete' },
    { new: true },
  );
  return result;
};


const taskPaymentRequestService = async (userId: string, taskId: string) => {
  const task = await TaskPost.findOne({ _id: taskId, taskerUserId: userId });

  if (!task) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Task not found!!');
  }

  if (task.status !== 'complete') {
    throw new AppError(httpStatus.BAD_REQUEST, 'Task is not completed!!');
  }

  if (task.paymentStatus === 'request') {
    throw new AppError(httpStatus.BAD_REQUEST, 'Task payment is already request!!');
  }



  const result = await TaskPost.findOneAndUpdate(
    { _id: taskId, taskerUserId: userId },
    { paymentStatus: 'request' },
    { new: true },
  );
  return result;
};


const taskPaymentConfirmService = async (
  posterId: string,
  taskId: string,
  taskerId: string,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const task = await TaskPost.findOne({
      _id: taskId,
      taskerUserId: taskerId,
      posterUserId: posterId,
    }).session(session);

    if (!task) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Task not found!!');
    }

    if (task.status !== 'complete') {
      throw new AppError(httpStatus.BAD_REQUEST, 'Task is not completed!!');
    }

    if (task.paymentStatus !== 'request') {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Task payment is not request!!',
      );
    }

    const result = await TaskPost.findOneAndUpdate(
      { _id: taskId, taskerUserId: taskerId, posterUserId: posterId },
      { paymentStatus: 'paid' },
      { new: true, session },
    );

    const wallet = await Wallet.findOne({
      userId: taskerId,
      // role: 'tasker',
    }).session(session);
    if (!wallet) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Wallet not found!!');
    }

    const walletAmountAdd = await Wallet.findOneAndUpdate(
      { userId: taskerId},
      { $inc: { amount: task.price } },
      { new: true, session },
    );

    if (!walletAmountAdd) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Wallet update failed!!');
    }

    await session.commitTransaction();
    session.endSession();

    return result;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};


const taskReviewConfirmService = async (
  userId: string,
  taskId: string,
  bodyData: any,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new AppError(httpStatus.BAD_REQUEST, 'User not found!!');
    }

    const updateUserId = user.role === 'tasker' ? 'taskerUserId' : 'posterUserId';


    const task = await TaskPost.findOne({
      _id: taskId,
      [updateUserId]: userId,
    }).session(session);

    if (!task) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Task not found!!');
    }

    if (task.status !== 'complete') {
      throw new AppError(httpStatus.BAD_REQUEST, 'Task is not completed!!');
    }

    if (task.paymentStatus !== 'paid') {
      throw new AppError(httpStatus.BAD_REQUEST, 'Task payment is not paid!!');
    }
    if (task.ratingStatus === 'complete' && task.taskerratingStatus === 'complete') {
      throw new AppError(httpStatus.BAD_REQUEST, 'Task review is already completed!!');
    }

    if(user.role === 'tasker'){


      const taskReviewAlreadyGiven = await TaskPost.findOne({
        taskId: taskId,
        taskerUserId: user?._id,
        posterUserId: task.posterUserId,
        ratingStatus: 'complete',
      }).session(session);
      if (taskReviewAlreadyGiven) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Task review is already given!!',
        );
      }



      const result = await TaskPost.findOneAndUpdate(
        {
          _id: taskId,
          taskerUserId: user?._id,
          posterUserId: task.posterUserId,
        },
        { ratingStatus: 'complete' },
        { new: true, session },
      );

      if (!result) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Task update failed!!');
      }

      const poster = await User.findById(result.posterUserId).session(session);
      if (!poster) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Poster not found!!');
      }

      //calculation new rating
      const newRatingTotal = poster.rating * poster.reviews + bodyData.rating;
      const newReviewCount = poster.reviews + 1;
      const newRating = newRatingTotal / newReviewCount;

      const taskerUpdate = await User.findOneAndUpdate(
        { _id: poster?._id },
        { rating: newRating, reviews: newReviewCount },
        { new: true, session },
      );

      if (!taskerUpdate) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Poster update failed!!');
      }

      await session.commitTransaction();
      session.endSession();

      return taskerUpdate;
    }else{

      const taskReviewAlreadyGiven = await TaskPost.findOne({
        taskId: taskId,
        taskerUserId: user?._id,
        posterUserId: task.posterUserId,
        taskerratingStatus: 'complete',
      }).session(session);
      if (taskReviewAlreadyGiven) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Task review is already given!!',
        );
      }

      const result = await TaskPost.findOneAndUpdate(
        {
          _id: taskId,
          taskerUserId: user?._id,
          posterUserId: task.posterUserId,
        },
        { taskerratingStatus: 'complete' },
        { new: true, session },
      );

      if (!result) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Task update failed!!');
      }

      const tasker = await User.findById(result.taskerUserId).session(session);
      if (!tasker) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Tasker not found!!');
      }

      //calculation new rating
      const newRatingTotal = tasker.rating * tasker.reviews + bodyData.rating;
      const newReviewCount = tasker.reviews + 1;
      const newRating = newRatingTotal / newReviewCount;

      const taskerUpdate = await User.findOneAndUpdate(
        { _id: tasker?._id },
        { rating: newRating, reviews: newReviewCount },
        { new: true, session },
      );

      if (!taskerUpdate) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Tasker update failed!!');
      }
      await session.commitTransaction();
      session.endSession();

      return taskerUpdate

    }


    

    
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const taskPostService = {
  createTaskPostService,
  taskCompleteService,
  getAllTaskPostQuery,
  getAllTaskByMapQuery,
  getAllTaskOverviewQuery,
  getAllTaskPendingCompleteCancelQuery,
  getAllTaskOverviewByTaskerPosterQuery,
  getAllCompleteIncomeTaskOverviewChartByTaskerQuery,
  getAllTaskOverviewByPosterQuery,
  getAllTaskPostByFilterQuery,
  getAllTaskByTaskerPosterQuery,
  taskAcceptByAdminQuery,
  taskCancelByAdminQuery,
  getSingleTaskPostQuery,
  deletedTaskPostQuery,
  posterTaskAcceptedService,
  posterTaskCanceledService,
  taskPaymentRequestService,
  taskPaymentConfirmService,
  taskReviewConfirmService,
};
