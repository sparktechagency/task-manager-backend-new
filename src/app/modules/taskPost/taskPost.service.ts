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
import { CLIENT_RENEG_LIMIT } from 'tls';
import moment from 'moment';
import { Payment } from '../payment/payment.model';
import Withdraw from '../withdraw/withdraw.model';

const createTaskPostService = async (payload: TTaskPost) => {
  const isExistWallet: any = await Wallet.findOne({
    userId: payload.posterUserId,
  });

  console.log('isExistWallet', isExistWallet);


  if (!isExistWallet) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Wallet not found');
  }

  // Check if the total wallet balance is 0
  // const totalBalance = isExistWallet.reduce(
  //   (acc, wallet) => acc + wallet.amount,
  //   0,
  // );

  if (isExistWallet.amount === 0 || isExistWallet.amount < payload.price) {
    console.log('dsfasfa')
    throw new AppError(402, 'Your wallet balance is insufficient');
  }
  const result = await TaskPost.create(payload);
  console.log('result', result)
  if (result) {
    let remainingAmount = result.price;

    const updateWalletAmount = await Wallet.findOneAndUpdate(
      { userId: result.posterUserId },
      { $inc: { amount: -remainingAmount } },
      { new: true },
    );
    console.log('updateWalletAmount', updateWalletAmount);

    if (!updateWalletAmount) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Wallet updated failed!!');
    }

   

    const data = {
      role: 'admin',
      message: 'Task created successfully! Please Accept/Reject Task',
      type: 'success',
    };
    await notificationService.createNotification(data);
  }
  return result;
};

const getAllTaskPostQuery = async (query: Record<string, unknown>) => {
  const TaskPostQuery = new QueryBuilder(
    TaskPost.find({}).populate('posterUserId').populate('taskerUserId'),
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
  const totalTask = await TaskPost.find({ status: 'accept' }).countDocuments();
  const totalOngoingTask = await TaskPost.find({
    status: 'ongoing',
  }).countDocuments();
  const tasker = await User.find({ role: 'tasker' }).countDocuments();
  const poster = await User.find({ role: 'poster' }).countDocuments();
  const result = {
    totalTask,
    tasker,
    poster,
    totalOngoingTask,
  };

  return result;
};

const getAllTaskPendingCompleteCancelQuery = async (
  query: Record<string, unknown>,
) => {
  const totalPendingTask = await TaskPost.find({
    status: 'ongoing',
  }).countDocuments();
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
  if (!user) {
    throw new AppError(404, 'User not found');
  }
  const updateUserId = user.role === 'tasker' ? 'taskerUserId' : 'posterUserId';

  if(user.role === 'poster'){
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

  }else{
    const tasksOngoing = await TaskPost.find({
      [updateUserId]: userId,
      status: ['ongoing', 'accept'],
    }).countDocuments();
    const tasksComplete = await TaskPost.find({
      [updateUserId]: userId,
      status: 'complete',
    }).countDocuments();
    console.log('userId', userId);
    const tasksCancel = await Message.find({
      sender: userId,
      taskStatus: 'cencel',
    }).countDocuments();
    console.log('tasksCancel', tasksCancel);
   
    return {
      tasksOngoing,
      tasksComplete,
      tasksCancel,
    };

  }

 

  
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

    const incomeEntries = await Withdraw.find({
      taskerUserId: userId,
      status: 'completed',
      updatedAt: { $gte: sevenDaysAgo, $lte: currentDate },
    });
    console.log('incomeEntries', incomeEntries);

    const incomeByDay = incomeEntries.reduce(
      (acc, entry:any) => {
        const updatedAt = new Date(entry.updatedAt);
        const day = updatedAt
          .toLocaleDateString('en-US', { weekday: 'short' })
          .toLowerCase();
  
        acc[day] = (acc[day] || 0) + (entry.amount || 0);
        return acc;
      },
      {} as Record<string, number>,
    );
  

    result = allDays.map((day) => ({
      day,
      task: taskCountByDay[day] || 0,
      income:incomeByDay[day] || 0,
    }));
  }
  else if (query.status === 'yearly') {
    if (query.status === 'yearly') {
      const tasksComplete = await TaskPost.find({
        taskerUserId: userId,
        status: 'complete',
      });

      const incomeEntries = await Withdraw.find({
        taskerUserId: userId,
        status: 'completed',
      });

      const allMonths = [
        'jan',
        'feb',
        'mar',
        'apr',
        'may',
        'jun',
        'jul',
        'aug',
        'sep',
        'oct',
        'nov',
        'dec',
      ];

      const taskCountByMonth = tasksComplete.reduce(
        (acc, task) => {
          const updatedAt = new Date(task.updatedAt);
          const month = updatedAt
            .toLocaleDateString('en-US', { month: 'short' })
            .toLowerCase();

          acc[month] = (acc[month] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      // Group income by month
      const incomeByMonth = incomeEntries.reduce(
        (acc, entry:any) => {
          const updatedAt = new Date(entry.updatedAt);
          const month = updatedAt
            .toLocaleDateString('en-US', { month: 'short' })
            .toLowerCase();

          acc[month] = (acc[month] || 0) + (entry.amount || 0); // Use correct field name
          return acc;
        },
        {} as Record<string, number>,
      );

      result = allMonths.map((month) => ({
        day: month,
        task: taskCountByMonth[month] || 0,
        income: incomeByMonth[month] || 0,
      }));
    }

  }
  else if (query.status === 'monthly') {
    if (query.status === 'monthly') {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth(); // 0 = Jan
      const currentMonthDays = new Date(
        currentYear,
        currentMonth + 1,
        0,
      ).getDate();

      const tasksComplete = await TaskPost.find({
        taskerUserId: userId,
        status: 'complete',
      });

      const incomeEntries:any = await Withdraw.find({
        taskerUserId: userId,
        status: 'completed',
      });

      const taskCountByDay: Record<string, number> = {};
      const incomeByDay: Record<string, number> = {};

      for (const task of tasksComplete) {
        const updatedAt = new Date(task.updatedAt);
        const taskYear = updatedAt.getFullYear();
        const taskMonth = updatedAt.getMonth();

        if (taskYear === currentYear && taskMonth === currentMonth) {
          const day = updatedAt.getDate().toString().padStart(2, '0');
          const month = (taskMonth + 1).toString().padStart(2, '0');
          const year = taskYear.toString();
          const dateKey = `${day}-${month}-${year}`;

          taskCountByDay[dateKey] = (taskCountByDay[dateKey] || 0) + 1;
        }
      }

      // Group income by day
      for (const entry of incomeEntries) {
        const updatedAt = new Date(entry.updatedAt);
        const incomeYear = updatedAt.getFullYear();
        const incomeMonth = updatedAt.getMonth();

        if (incomeYear === currentYear && incomeMonth === currentMonth) {
          const day = updatedAt.getDate().toString().padStart(2, '0');
          const month = (incomeMonth + 1).toString().padStart(2, '0');
          const year = incomeYear.toString();
          const dateKey = `${day}-${month}-${year}`;
          incomeByDay[dateKey] =
            (incomeByDay[dateKey] || 0) + (entry.amount || 0); // Adjust 'amount' if your field is named differently
        }
      }

      // Build full month response with all days
      result = Array.from({ length: currentMonthDays }, (_, i) => {
        // const day = (i + 1).toString().padStart(2, '0');
        // const month = (currentMonth + 1).toString().padStart(2, '0');
        // const year = currentYear.toString();
        // const dateKey = `${month}-${day}`;
        const date = new Date(currentYear, currentMonth, i + 1); // Valid Date
        const dateKey = `${(i + 1).toString().padStart(2, '0')}-${(currentMonth + 1).toString().padStart(2, '0')}-${currentYear}`;

        return {
          day: moment(date).format('MMM DD'),
          task: taskCountByDay[dateKey] || 0,
          income: incomeByDay[dateKey] || 0,
        };
      });
    }
  }
  // else if (query.startDate && query.endDate) {
  //   const startDateRaw = query.startDate;
  //   const endDateRaw = query.endDate;

  //   // Validate input and convert to Date only if valid
  //   const start =
  //     typeof startDateRaw === 'string' || typeof startDateRaw === 'number'
  //       ? new Date(startDateRaw)
  //       : null;

  //   const end =
  //     typeof endDateRaw === 'string' || typeof endDateRaw === 'number'
  //       ? new Date(endDateRaw)
  //       : null;

  //   if (!start || !end) {
  //     throw new AppError(400, 'Invalid date format');
  //   }

  //   end.setHours(23, 59, 59, 999);

  //   const tasksComplete = await TaskPost.find({
  //     taskerUserId: userId,
  //     status: 'complete',
  //     updatedAt: {
  //       $gte: start,
  //       $lte: end,
  //     },
  //   });

  //   console.log('task ------------------', tasksComplete);

  //   result = tasksComplete.map((task) => ({
  //     day: moment(task.updatedAt).format('MMM DD'),
  //     task: 1,
  //   }));

  // }
  else if (query.startDate && query.endDate) {
    const startDateRaw = query.startDate;
    const endDateRaw = query.endDate;

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

    end.setHours(23, 59, 59, 999); // Ensure end of day is included

    // Fetch completed tasks in date range
    const tasksComplete = await TaskPost.find({
      taskerUserId: userId,
      status: 'complete',
      updatedAt: {
        $gte: start,
        $lte: end,
      },
    });

    const incomeEntries:any = await Withdraw.find({
      taskerUserId: userId,
      status: 'completed',
      updatedAt: {
        $gte: start,
        $lte: end,
      },
    });

    // Group tasks by day key like: "01-07-2025"
    const taskCountByDay: Record<string, number> = {};

    for (const task of tasksComplete) {
      const updatedAt = new Date(task.updatedAt);
      const day = updatedAt.getDate().toString().padStart(2, '0');
      const month = (updatedAt.getMonth() + 1).toString().padStart(2, '0');
      const year = updatedAt.getFullYear();
      const dateKey = `${day}-${month}-${year}`;

      taskCountByDay[dateKey] = (taskCountByDay[dateKey] || 0) + 1;
    }

    // Group income by day key
    const incomeByDay: Record<string, number> = {};
    for (const entry of incomeEntries) {
      const updatedAt = new Date(entry.updatedAt);
      const day = updatedAt.getDate().toString().padStart(2, '0');
      const month = (updatedAt.getMonth() + 1).toString().padStart(2, '0');
      const year = updatedAt.getFullYear();
      const dateKey = `${day}-${month}-${year}`;
      incomeByDay[dateKey] = (incomeByDay[dateKey] || 0) + (entry.amount || 0); // ✅ replace `amount` if needed
    }

    // Build result from full date range
    const resultList: { day: string; task: number; income: number }[] = [];
    const current = new Date(start);

    while (current <= end) {
      const day = current.getDate().toString().padStart(2, '0');
      const month = (current.getMonth() + 1).toString().padStart(2, '0');
      const year = current.getFullYear();
      const dateKey = `${day}-${month}-${year}`; // used for lookup

      resultList.push({
        day: moment(current).format('MMM DD'), // e.g., "Jul 01"
        task: taskCountByDay[dateKey] || 0,
        income: incomeByDay[dateKey] || 0,
      });

      // Move to next day
      current.setDate(current.getDate() + 1);
    }

    result = resultList;
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

  let newQuery: any = {};

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
  if (!user) {
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


const getAllCancleTaskByTaskerQuery = async (
  query: Record<string, unknown>,
  taskerUserId: string,
) => {

  const page = Number(query?.page) || 1;
  const limit = Number(query?.limit) || 10;
  const skip = (page - 1) * limit;

  // console.log('taskerUserId', taskerUserId);
  const user = await User.findById(taskerUserId);
  if (!user) {
    throw new AppError(404, 'User not found');
  }

  const allCancelTask = await Message.find({
    sender: taskerUserId,
    taskStatus: 'cencel',
  })
    .populate('taskId')
    .skip(skip)
    .limit(limit);
  // console.log('allCancelTask', allCancelTask);

  const taskIds = allCancelTask.map((task) => task.taskId);
  // console.log('taskIds', taskIds);

  const count = await Message.countDocuments({
    sender: taskerUserId,
    taskStatus: 'cencel',
  });

  const meta = {
    page,
    limit,
    total: count,
    totalPage: Math.ceil(count / limit),
  }
  return { meta, result: taskIds };



 
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
  const taskPost = await TaskPost.findById(id)
    .populate('posterUserId')
    .populate('taskerUserId');
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

const taskAcceptByAdminQuery = async (id: string) => {
  if (!id) {
    throw new AppError(400, 'Invalid id parameters');
  }

  const result = await TaskPost.findByIdAndUpdate(
    id,
    { status: 'accept' },
    { new: true, runValidators: true },
  );

  if (!result) {
    throw new AppError(404, 'Task accept not found!!');
  }
  return result;
};

const taskCancelByAdminQuery = async (id: string) => {
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
    const chat = await Chat.findById(payload.chatId).session(session);

    const messageExist:any = await Message.findById(payload.messageId).session(
      session,
    );

    if (!chat) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Chat not found');
    }
    if (!messageExist) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Message not found');
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
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Task is not valid! because task status is ${task.status}`,
      );
    }

    const alreadyAccept = await Message.findOne({
      _id: payload.messageId,
      taskId: payload.taskId,
      chat: chat._id,
      taskStatus: 'accept',
    }).session(session);

    const alreadyCancel = await Message.findOne({
      _id: payload.messageId,
      taskId: payload.taskId,
      chat: chat._id,
      taskStatus: 'cencel',
    }).session(session);

    console.log('alreadyAccept', alreadyAccept);

    if (alreadyAccept) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Task Request already accepted!!',
      );
    }
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
    )
      .populate([
        {
          path: 'sender',
          select: 'fullName email image role _id phone',
        },
      ])
      .populate('taskId');

    console.log('first result', result);

    task.status = 'ongoing';
    task.taskerUserId = result.sender;
    task.price = messageExist.offerPrice > 0 ? messageExist.offerPrice : task.price;
    await task.save({ session });

    console.log('first taskPost', task);

    const allMessageUpdate = await Message.updateMany(
      {
        taskId: task._id,
        taskStatus: 'pending',
      },
      {
        $set: {
          taskStatus: 'cancel',
        },
      },
      {
        session,
      },
    );

    const updatedResult: any = await Message.findById(result._id)
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

    return task;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};



const posterTaskerTaskCanceledService = async (payload: any) => {
  console.log('cancel payload', payload);
  const chat = await Chat.findById(payload.chatId);

  const messageExist = await Message.findById(payload.messageId);

  if (!chat) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Chat not found');
  }
  if (!messageExist) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Message not found');
  }

  const task = await TaskPost.findById(payload.taskId);

  if (!task) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Task not found');
  }

  // console.log('chat', chat);
  // console.log('chat', chat);

  console.log('console opore==', {
    chat: chat._id,
    taskId: task._id,
    taskStatus: 'cencel',
  });

  const alreadyCancel = await Message.findOne({
    _id: payload.messageId,
    taskId: payload.taskId,
    chat: chat._id,
    taskStatus: 'cencel',
  });

  const alreadyAccept = await Message.findOne({
    _id: payload.messageId,
    taskId: payload.taskId,
    chat: chat._id,
    taskStatus: 'accept',
  });

  console.log('alreadyCancel===', alreadyCancel);

  if (alreadyCancel) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'task Request already canceled!!',
    );
  }

  if (alreadyAccept) {
    throw new AppError(httpStatus.BAD_REQUEST, 'task Request already Accept!!');
  }

  const result: any = await Message.findOneAndUpdate(
    { _id: payload.messageId, chat: chat._id, taskId: payload.taskId },
    { taskStatus: 'cencel' },
    { new: true, runValidators: true },
  )
    .populate([
      {
        path: 'sender',
        select: 'fullName email image role _id phone',
      },
    ])
    .populate('taskId');

  if (!result) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Message not found or conditions do not match',
    );
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

  // if (task.status !== 'complete') {
  //   throw new AppError(httpStatus.BAD_REQUEST, 'Task is not completed!!');
  // }

  if (task.paymentStatus === 'request') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Task payment is already request!!',
    );
  }

  const result = await TaskPost.findOneAndUpdate(
    { _id: taskId, taskerUserId: userId },
    { paymentStatus: 'request' },
    { new: true },
  )
    .populate('taskerUserId')
    .populate('posterUserId');
  return result;
};

const taskPaymentConfirmService = async (
  posterId: string,
  taskId: string,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const taskerId = await TaskPost.findOne({
      _id: taskId,
      posterUserId: posterId,
    })

    if(!taskerId){
      throw new AppError(httpStatus.BAD_REQUEST, 'Tasker not found!!');

    }
    const task = await TaskPost.findOne({
      _id: taskId,
      taskerUserId: taskerId.taskerUserId,
      posterUserId: posterId,
    }).session(session);

    if (!task) {
      throw new AppError(httpStatus.BAD_REQUEST, 'you are not tasker!!');
    }

    // if (task.status !== 'complete') {
    //   throw new AppError(httpStatus.BAD_REQUEST, 'Task is not completed!!');
    // }

    if (task.paymentStatus !== 'request') {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Task payment is not request!!',
      );
    }

    const result = await TaskPost.findOneAndUpdate(
      {
        _id: taskId,
        taskerUserId: taskerId.taskerUserId,
        posterUserId: posterId,
      },
      { paymentStatus: 'paid', status: 'complete' },
      { new: true, session },
    ).populate('posterUserId').populate('taskerUserId');

    const wallet = await Wallet.findOne({
      userId: taskerId.taskerUserId,
      // role: 'tasker',
    }).session(session);
    if (!wallet) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Wallet not found!!');
    }

    const walletAmountAdd = await Wallet.findOneAndUpdate(
      { userId: taskerId.taskerUserId },
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

    const updateUserId =
      user.role === 'tasker' ? 'taskerUserId' : 'posterUserId';

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
    if (
      task.ratingStatus === 'complete' &&
      task.taskerratingStatus === 'complete'
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Task review is already completed!!',
      );
    }

    if (user.role === 'tasker') {
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
    } else {
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

      return taskerUpdate;
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
  getAllCancleTaskByTaskerQuery,
  taskAcceptByAdminQuery,
  taskCancelByAdminQuery,
  getSingleTaskPostQuery,
  deletedTaskPostQuery,
  posterTaskAcceptedService,
  posterTaskerTaskCanceledService,
  taskPaymentRequestService,
  taskPaymentConfirmService,
  taskReviewConfirmService,
};
