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
exports.taskPostService = void 0;
const AppError_1 = __importDefault(require("../../error/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const mongoose_1 = __importDefault(require("mongoose"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const taskPost_model_1 = __importDefault(require("./taskPost.model"));
const chat_model_1 = __importDefault(require("../chat/chat.model"));
const message_model_1 = __importDefault(require("../message/message.model"));
const wallet_model_1 = require("../wallet/wallet.model");
const user_models_1 = require("../user/user.models");
const notification_service_1 = require("../notification/notification.service");
const moment_1 = __importDefault(require("moment"));
const withdraw_model_1 = __importDefault(require("../withdraw/withdraw.model"));
const createTaskPostService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistWallet = yield wallet_model_1.Wallet.findOne({
        userId: payload.posterUserId,
    });
    console.log('isExistWallet', isExistWallet);
    // if (!isExistWallet) {
    //   throw new AppError(httpStatus.BAD_REQUEST, 'Wallet not found');
    // }
    // // Check if the total wallet balance is 0
    // // const totalBalance = isExistWallet.reduce(
    // //   (acc, wallet) => acc + wallet.amount,
    // //   0,
    // // );
    // if (isExistWallet.amount === 0 || isExistWallet.amount < payload.price) {
    //   console.log('dsfasfa')
    //   throw new AppError(402, 'Your wallet balance is insufficient');
    // }
    const result = yield taskPost_model_1.default.create(payload);
    console.log('result', result);
    if (result) {
        // let remainingAmount = result.price;
        // const updateWalletAmount = await Wallet.findOneAndUpdate(
        //   { userId: result.posterUserId },
        //   { $inc: { amount: -remainingAmount } },
        //   { new: true },
        // );
        // console.log('updateWalletAmount', updateWalletAmount);
        // if (!updateWalletAmount) {
        //   throw new AppError(httpStatus.BAD_REQUEST, 'Wallet updated failed!!');
        // }
        // const paymentData = {
        //   posterUserId: result.posterUserId,
        //   transactionId: result._id,
        //   method: 'task',
        //   status: 'paid',
        //   price: result.price,
        //   type: 'task',
        //   transactionDate: new Date(),
        // };
        // const payment = await paymentService.addPaymentService(paymentData);
        // if (!payment) {
        //   throw new AppError(400, 'Payment not found!');
        // }
        const data = {
            role: 'admin',
            message: 'Task created successfully! Please Accept/Reject Task',
            type: 'success',
        };
        yield notification_service_1.notificationService.createNotification(data);
    }
    return result;
});
const getAllTaskPostQuery = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const TaskPostQuery = new QueryBuilder_1.default(taskPost_model_1.default.find({}).populate('posterUserId').populate('taskerUserId'), query)
        .search([''])
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = yield TaskPostQuery.modelQuery;
    const meta = yield TaskPostQuery.countTotal();
    return { meta, result };
});
const getAllTaskByMapQuery = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const userLongitude = Number(query.userLongitude);
    const userLatitude = Number(query.userLatitude);
    const radiusInKilometers = 20;
    const tasks = yield taskPost_model_1.default.find({
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
});
const getAllTaskOverviewQuery = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const totalTask = yield taskPost_model_1.default.find({ status: 'accept' }).countDocuments();
    const totalOngoingTask = yield taskPost_model_1.default.find({
        status: 'ongoing',
    }).countDocuments();
    const tasker = yield user_models_1.User.find({ role: 'tasker' }).countDocuments();
    const poster = yield user_models_1.User.find({ role: 'poster' }).countDocuments();
    const result = {
        totalTask,
        tasker,
        poster,
        totalOngoingTask,
    };
    return result;
});
const getAllTaskPendingCompleteCancelQuery = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const totalPendingTask = yield taskPost_model_1.default.find({
        status: 'ongoing',
    }).countDocuments();
    const totalOngoingTask = yield taskPost_model_1.default.find({
        status: 'cancel',
    }).countDocuments();
    const totalCompleteTask = yield taskPost_model_1.default.find({
        status: 'complete',
    }).countDocuments();
    const result = {
        totalPendingTask,
        totalOngoingTask,
        totalCompleteTask,
    };
    return result;
});
const getAllTaskOverviewByPosterQuery = (query, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const tasksOngoing = yield taskPost_model_1.default.find({
        posterUserId: userId,
        status: 'ongoing',
    }).countDocuments();
    const tasksComplete = yield taskPost_model_1.default.find({
        posterUserId: userId,
        status: 'complete',
    }).countDocuments();
    const tasksCancel = yield taskPost_model_1.default.find({
        posterUserId: userId,
        status: 'cancel',
    }).countDocuments();
    return {
        tasksOngoing,
        tasksComplete,
        tasksCancel,
    };
});
const getAllTaskOverviewByTaskerPosterQuery = (query, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_models_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.default(404, 'User not found');
    }
    const updateUserId = user.role === 'tasker' ? 'taskerUserId' : 'posterUserId';
    if (user.role === 'poster') {
        const tasksOngoing = yield taskPost_model_1.default.find({
            [updateUserId]: userId,
            status: ['ongoing', 'accept'],
        }).countDocuments();
        const tasksComplete = yield taskPost_model_1.default.find({
            [updateUserId]: userId,
            status: 'complete',
        }).countDocuments();
        const tasksCancel = yield taskPost_model_1.default.find({
            [updateUserId]: userId,
            status: 'cancel',
        }).countDocuments();
        return {
            tasksOngoing,
            tasksComplete,
            tasksCancel,
        };
    }
    else {
        const tasksOngoing = yield taskPost_model_1.default.find({
            [updateUserId]: userId,
            status: ['ongoing', 'accept'],
        }).countDocuments();
        const tasksComplete = yield taskPost_model_1.default.find({
            [updateUserId]: userId,
            status: 'complete',
        }).countDocuments();
        console.log('userId', userId);
        const tasksCancel = yield message_model_1.default.find({
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
});
const getAllCompleteIncomeTaskOverviewChartByTaskerQuery = (query, userId) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('query', query);
    let result;
    if (query.status === 'complete') {
        const currentDate = new Date();
        const sevenDaysAgo = new Date(currentDate);
        sevenDaysAgo.setDate(currentDate.getDate() - 7);
        const tasksComplete = yield taskPost_model_1.default.find({
            taskerUserId: userId,
            status: 'complete',
            updatedAt: { $gte: sevenDaysAgo, $lte: currentDate },
        });
        console.log('tasksComplete', tasksComplete);
        const allDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
        const taskCountByDay = tasksComplete.reduce((acc, task) => {
            const updatedAt = new Date(task.updatedAt);
            const day = updatedAt
                .toLocaleDateString('en-US', { weekday: 'short' })
                .toLowerCase();
            if (!acc[day]) {
                acc[day] = 0;
            }
            acc[day]++;
            return acc;
        }, {});
        const incomeEntries = yield withdraw_model_1.default.find({
            taskerUserId: userId,
            status: 'completed',
            updatedAt: { $gte: sevenDaysAgo, $lte: currentDate },
        });
        console.log('incomeEntries', incomeEntries);
        const incomeByDay = incomeEntries.reduce((acc, entry) => {
            const updatedAt = new Date(entry.updatedAt);
            const day = updatedAt
                .toLocaleDateString('en-US', { weekday: 'short' })
                .toLowerCase();
            acc[day] = (acc[day] || 0) + (entry.amount || 0);
            return acc;
        }, {});
        result = allDays.map((day) => ({
            day,
            task: taskCountByDay[day] || 0,
            income: incomeByDay[day] || 0,
        }));
    }
    else if (query.status === 'yearly') {
        if (query.status === 'yearly') {
            const tasksComplete = yield taskPost_model_1.default.find({
                taskerUserId: userId,
                status: 'complete',
            });
            const incomeEntries = yield withdraw_model_1.default.find({
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
            const taskCountByMonth = tasksComplete.reduce((acc, task) => {
                const updatedAt = new Date(task.updatedAt);
                const month = updatedAt
                    .toLocaleDateString('en-US', { month: 'short' })
                    .toLowerCase();
                acc[month] = (acc[month] || 0) + 1;
                return acc;
            }, {});
            // Group income by month
            const incomeByMonth = incomeEntries.reduce((acc, entry) => {
                const updatedAt = new Date(entry.updatedAt);
                const month = updatedAt
                    .toLocaleDateString('en-US', { month: 'short' })
                    .toLowerCase();
                acc[month] = (acc[month] || 0) + (entry.amount || 0); // Use correct field name
                return acc;
            }, {});
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
            const currentMonthDays = new Date(currentYear, currentMonth + 1, 0).getDate();
            const tasksComplete = yield taskPost_model_1.default.find({
                taskerUserId: userId,
                status: 'complete',
            });
            const incomeEntries = yield withdraw_model_1.default.find({
                taskerUserId: userId,
                status: 'completed',
            });
            const taskCountByDay = {};
            const incomeByDay = {};
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
                    day: (0, moment_1.default)(date).format('MMM DD'),
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
        const start = typeof startDateRaw === 'string' || typeof startDateRaw === 'number'
            ? new Date(startDateRaw)
            : null;
        const end = typeof endDateRaw === 'string' || typeof endDateRaw === 'number'
            ? new Date(endDateRaw)
            : null;
        if (!start || !end) {
            throw new AppError_1.default(400, 'Invalid date format');
        }
        end.setHours(23, 59, 59, 999); // Ensure end of day is included
        // Fetch completed tasks in date range
        const tasksComplete = yield taskPost_model_1.default.find({
            taskerUserId: userId,
            status: 'complete',
            updatedAt: {
                $gte: start,
                $lte: end,
            },
        });
        const incomeEntries = yield withdraw_model_1.default.find({
            taskerUserId: userId,
            status: 'completed',
            updatedAt: {
                $gte: start,
                $lte: end,
            },
        });
        // Group tasks by day key like: "01-07-2025"
        const taskCountByDay = {};
        for (const task of tasksComplete) {
            const updatedAt = new Date(task.updatedAt);
            const day = updatedAt.getDate().toString().padStart(2, '0');
            const month = (updatedAt.getMonth() + 1).toString().padStart(2, '0');
            const year = updatedAt.getFullYear();
            const dateKey = `${day}-${month}-${year}`;
            taskCountByDay[dateKey] = (taskCountByDay[dateKey] || 0) + 1;
        }
        // Group income by day key
        const incomeByDay = {};
        for (const entry of incomeEntries) {
            const updatedAt = new Date(entry.updatedAt);
            const day = updatedAt.getDate().toString().padStart(2, '0');
            const month = (updatedAt.getMonth() + 1).toString().padStart(2, '0');
            const year = updatedAt.getFullYear();
            const dateKey = `${day}-${month}-${year}`;
            incomeByDay[dateKey] = (incomeByDay[dateKey] || 0) + (entry.amount || 0); // ✅ replace `amount` if needed
        }
        // Build result from full date range
        const resultList = [];
        const current = new Date(start);
        while (current <= end) {
            const day = current.getDate().toString().padStart(2, '0');
            const month = (current.getMonth() + 1).toString().padStart(2, '0');
            const year = current.getFullYear();
            const dateKey = `${day}-${month}-${year}`; // used for lookup
            resultList.push({
                day: (0, moment_1.default)(current).format('MMM DD'), // e.g., "Jul 01"
                task: taskCountByDay[dateKey] || 0,
                income: incomeByDay[dateKey] || 0,
            });
            // Move to next day
            current.setDate(current.getDate() + 1);
        }
        result = resultList;
    }
    else {
        const currentDate = new Date();
        const sevenDaysAgo = new Date(currentDate);
        sevenDaysAgo.setDate(currentDate.getDate() - 7);
        // Fetch tasks completed by the user in the last 7 days
        const tasksComplete = yield taskPost_model_1.default.find({
            taskerUserId: userId,
            paymentStatus: 'paid', // Filter for tasks that are paid
            updatedAt: { $gte: sevenDaysAgo, $lte: currentDate }, // Filter tasks based on the update date
        });
        // Group tasks by day and sum the price of tasks per day
        const taskIncomeByDay = tasksComplete.reduce((acc, task) => {
            const updatedAt = new Date(task.updatedAt);
            const day = updatedAt
                .toLocaleDateString('en-US', { weekday: 'short' })
                .toLowerCase(); // Get the day (e.g., "sun", "mon")
            if (!acc[day]) {
                acc[day] = 0; // Initialize income for the day
            }
            acc[day] += task.price; // Add price to the total income for that day
            return acc;
        }, {});
        // Ensure all days are represented, even if no tasks were completed
        const allDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
        result = allDays.map((day) => ({
            day,
            totalIncome: taskIncomeByDay[day] || 0, // Set to 0 if no income for the day
        }));
    }
    return result;
});
const getAllTaskPostByFilterQuery = (query) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('filter query data', query);
    let newQuery = {};
    if (query.minPrice &&
        query.maxPrice &&
        query.minPrice !== '' &&
        query.maxPrice !== '' &&
        query.maxPrice !== null &&
        query.minPrice !== null) {
        const price = {
            $gte: Number(query.minPrice),
            $lte: Number(query.maxPrice),
        };
        delete query.minPrice;
        delete query.maxPrice;
        newQuery = Object.assign(Object.assign({}, query), { price });
    }
    else {
        newQuery = Object.assign({}, query);
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
    newQuery = Object.assign(Object.assign({}, query), { sort: sortString });
    console.log('newQuery ===', newQuery);
    //  "sort": "price high,postDate low,dueDate high"
    // sort query data
    //   console.log('sortObject', sortObject);
    const TaskPostQuery = new QueryBuilder_1.default(taskPost_model_1.default.find({}), newQuery)
        .search(['taskName', 'taskDetails', 'category'])
        .filter()
        .multiplesort()
        // .sort()
        .paginate()
        .fields();
    const result = yield TaskPostQuery.modelQuery;
    const meta = yield TaskPostQuery.countTotal();
    return { meta, result };
});
const getAllTaskByTaskerPosterQuery = (query, posterTaskerUserId) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('posterTaskerUserId', posterTaskerUserId);
    const user = yield user_models_1.User.findById(posterTaskerUserId);
    if (!user) {
        throw new AppError_1.default(404, 'User not found');
    }
    const userField = (user === null || user === void 0 ? void 0 : user.role) === 'poster' ? 'posterUserId' : 'taskerUserId';
    if (query.status === 'ongoing') {
        query.status = ['ongoing', 'accept'];
    }
    console.log('query', query);
    const TaskPostQuery = new QueryBuilder_1.default(taskPost_model_1.default.find({ [userField]: posterTaskerUserId })
        .populate('posterUserId')
        .populate('taskerUserId'), query)
        .search([''])
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = yield TaskPostQuery.modelQuery;
    const meta = yield TaskPostQuery.countTotal();
    return { meta, result };
});
const getAllCancleTaskByTaskerQuery = (query, taskerUserId) => __awaiter(void 0, void 0, void 0, function* () {
    const page = Number(query === null || query === void 0 ? void 0 : query.page) || 1;
    const limit = Number(query === null || query === void 0 ? void 0 : query.limit) || 10;
    const skip = (page - 1) * limit;
    // console.log('taskerUserId', taskerUserId);
    const user = yield user_models_1.User.findById(taskerUserId);
    if (!user) {
        throw new AppError_1.default(404, 'User not found');
    }
    const allCancelTask = yield message_model_1.default.find({
        sender: taskerUserId,
        taskStatus: 'cencel',
    })
        .populate('taskId')
        .skip(skip)
        .limit(limit);
    // console.log('allCancelTask', allCancelTask);
    const taskIds = allCancelTask.map((task) => task.taskId);
    // console.log('taskIds', taskIds);
    const count = yield message_model_1.default.countDocuments({
        sender: taskerUserId,
        taskStatus: 'cencel',
    });
    const meta = {
        page,
        limit,
        total: count,
        totalPage: Math.ceil(count / limit),
    };
    return { meta, result: taskIds };
});
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
const getSingleTaskPostQuery = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const taskPost = yield taskPost_model_1.default.findById(id)
        .populate('posterUserId')
        .populate('taskerUserId');
    if (!taskPost) {
        throw new AppError_1.default(404, 'TaskPost Not Found!!');
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
});
const taskAcceptByAdminQuery = (id) => __awaiter(void 0, void 0, void 0, function* () {
    if (!id) {
        throw new AppError_1.default(400, 'Invalid id parameters');
    }
    const taskPost = yield taskPost_model_1.default.findById(id);
    if (!taskPost) {
        throw new AppError_1.default(404, 'TaskPost not found!!');
    }
    if (taskPost.status === 'accept') {
        throw new AppError_1.default(400, 'Task already accepted!!');
    }
    if (taskPost.status === 'cancel') {
        throw new AppError_1.default(400, 'Task already canceled!!');
    }
    const result = yield taskPost_model_1.default.findByIdAndUpdate(id, { status: 'accept' }, { new: true, runValidators: true });
    if (!result) {
        throw new AppError_1.default(404, 'Task accept not found!!');
    }
    return result;
});
const taskCancelByAdminQuery = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        if (!id) {
            throw new AppError_1.default(400, 'Invalid id parameters');
        }
        const result = yield taskPost_model_1.default.findByIdAndUpdate(id, { status: 'cancel' }, { new: true, runValidators: true, session });
        if (!result) {
            throw new AppError_1.default(404, 'Task already canceled!');
        }
        // const paymentData = {
        //   posterUserId: result.posterUserId,
        //   transactionId: result._id,
        //   method: 'task',
        //   status: 'paid',
        //   price: result.price,
        //   type: 'refund',
        //   transactionDate: new Date(),
        // };
        // const payment = await paymentService.addPaymentService(paymentData, session);
        // if (!payment) {
        //   throw new AppError(400, 'Payment not found!');
        // }
        // const walletAddMoney = await Wallet.findOneAndUpdate(
        //   { userId: result.posterUserId },
        //   { $inc: { amount: result.price } },
        //   { new: true, runValidators: true, session },
        // );
        // if (!walletAddMoney) {
        //   throw new AppError(400, 'Wallet not found!');
        // }
        const notificationData = {
            userId: result.posterUserId,
            message: 'Your task has been canceled by admin',
            type: 'warning',
        };
        const notification = yield notification_service_1.notificationService.createNotification(notificationData, session);
        if (!notification) {
            throw new AppError_1.default(400, 'Notification not found!');
        }
        yield session.commitTransaction();
        yield session.endSession();
        return result;
    }
    catch (error) {
        yield session.abortTransaction();
        yield session.endSession();
        throw new AppError_1.default(error.statusCode, error.message);
    }
});
const deletedTaskPostQuery = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield taskPost_model_1.default.findByIdAndDelete(id);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'TaskPost not found');
    }
    return result;
});
//---------------------------------------------------------------------------//
//---------------------------------------------------------------------------//
const posterTaskAcceptedService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log('task accept payload', payload);
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const chat = yield chat_model_1.default.findById(payload.chatId).session(session);
        const messageExist = yield message_model_1.default.findById(payload.messageId).session(session);
        const task = yield taskPost_model_1.default.findById(payload.taskId).session(session);
        if (!task) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Task not found');
        }
        const taskUpdatePrice = messageExist.offerPrice > 0 ? messageExist.offerPrice : task.price;
        const isExistWallet = yield wallet_model_1.Wallet.findOne({
            userId: task.posterUserId,
        });
        console.log('isExistWallet', isExistWallet);
        if (!isExistWallet) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Wallet not found');
        }
        // Check if the total wallet balance is 0
        // const totalBalance = isExistWallet.reduce(
        //   (acc, wallet) => acc + wallet.amount,
        //   0,
        // );
        if (isExistWallet.amount === 0 || isExistWallet.amount < taskUpdatePrice) {
            console.log('dsfasfa');
            throw new AppError_1.default(402, 'Your wallet balance is insufficient');
        }
        if (!chat) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Chat not found');
        }
        if (!messageExist) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Message not found');
        }
        console.log('sdfafafasfsafa', task);
        if (task.status !== 'accept') {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Task is not accepted');
        }
        if (['ongoing', 'complete', 'cancel'].includes(task.status)) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `Task is not valid! because task status is ${task.status}`);
        }
        const alreadyAccept = yield message_model_1.default.findOne({
            _id: payload.messageId,
            taskId: payload.taskId,
            chat: chat._id,
            taskStatus: 'accept',
        }).session(session);
        const alreadyCancel = yield message_model_1.default.findOne({
            _id: payload.messageId,
            taskId: payload.taskId,
            chat: chat._id,
            taskStatus: 'cencel',
        }).session(session);
        console.log('alreadyAccept', alreadyAccept);
        if (alreadyAccept) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Task Request already accepted!!');
        }
        if (alreadyCancel) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Task Request already canceled!!');
        }
        const result = yield message_model_1.default.findOneAndUpdate({ _id: payload.messageId, chat: chat._id, taskId: payload.taskId }, { taskStatus: 'accept' }, { new: true, runValidators: true, session })
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
        yield task.save({ session });
        console.log('first taskPost', task);
        const allMessageUpdate = yield message_model_1.default.updateMany({
            taskId: task._id,
            taskStatus: 'pending',
        }, {
            $set: {
                taskStatus: 'cancel',
            },
        }, {
            session,
        });
        const updatedResult = yield message_model_1.default.findById(result._id)
            .populate([
            { path: 'sender', select: 'fullName email image role _id phone' },
            { path: 'taskId' }, // This now reflects updated taskPost
        ])
            .session(session);
        const updateWalletAmount = yield wallet_model_1.Wallet.findOneAndUpdate({ userId: task.posterUserId }, { $inc: { amount: -task.price } }, { new: true, runValidators: true, session });
        console.log('updateWalletAmount', updateWalletAmount);
        if (!updateWalletAmount) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Wallet updated failed!!');
        }
        const data = {
            userId: payload.receiver,
            message: 'Task Accept success!!',
            type: 'success',
        };
        yield notification_service_1.notificationService.createNotification(data, session);
        const senderMessage = 'new-message::' + ((_a = updatedResult.chat) === null || _a === void 0 ? void 0 : _a._id.toString());
        console.log('senderMessage', senderMessage);
        io.emit(senderMessage, updatedResult);
        yield session.commitTransaction();
        session.endSession();
        return task;
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
const posterTaskerTaskCanceledService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('cancel payload', payload);
    const chat = yield chat_model_1.default.findById(payload.chatId);
    const messageExist = yield message_model_1.default.findById(payload.messageId);
    if (!chat) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Chat not found');
    }
    if (!messageExist) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Message not found');
    }
    const task = yield taskPost_model_1.default.findById(payload.taskId);
    if (!task) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Task not found');
    }
    // console.log('chat', chat);
    // console.log('chat', chat);
    console.log('console opore==', {
        chat: chat._id,
        taskId: task._id,
        taskStatus: 'cencel',
    });
    const alreadyCancel = yield message_model_1.default.findOne({
        _id: payload.messageId,
        taskId: payload.taskId,
        chat: chat._id,
        taskStatus: 'cencel',
    });
    const alreadyAccept = yield message_model_1.default.findOne({
        _id: payload.messageId,
        taskId: payload.taskId,
        chat: chat._id,
        taskStatus: 'accept',
    });
    console.log('alreadyCancel===', alreadyCancel);
    if (alreadyCancel) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'task Request already canceled!!');
    }
    if (alreadyAccept) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'task Request already Accept!!');
    }
    const result = yield message_model_1.default.findOneAndUpdate({ _id: payload.messageId, chat: chat._id, taskId: payload.taskId }, { taskStatus: 'cencel' }, { new: true, runValidators: true })
        .populate([
        {
            path: 'sender',
            select: 'fullName email image role _id phone',
        },
    ])
        .populate('taskId');
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Message not found or conditions do not match');
    }
    const senderMessage = 'new-message::' + result.chat._id.toString();
    console.log('senderMessage', senderMessage);
    io.emit(senderMessage, result);
    return result;
});
const taskCompleteService = (userId, taskId) => __awaiter(void 0, void 0, void 0, function* () {
    const task = yield taskPost_model_1.default.findOne({ _id: taskId, taskerUserId: userId });
    if (!task) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Task not found');
    }
    if (task.status === 'complete') {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Task is already completed');
    }
    const result = yield taskPost_model_1.default.findOneAndUpdate({ _id: taskId, taskerUserId: userId }, { status: 'complete' }, { new: true });
    return result;
});
const taskPaymentRequestService = (userId, taskId) => __awaiter(void 0, void 0, void 0, function* () {
    const task = yield taskPost_model_1.default.findOne({ _id: taskId, taskerUserId: userId });
    if (!task) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Task not found!!');
    }
    // if (task.status !== 'complete') {
    //   throw new AppError(httpStatus.BAD_REQUEST, 'Task is not completed!!');
    // }
    if (task.paymentStatus === 'request') {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Task payment is already request!!');
    }
    const result = yield taskPost_model_1.default.findOneAndUpdate({ _id: taskId, taskerUserId: userId }, { paymentStatus: 'request' }, { new: true })
        .populate('taskerUserId')
        .populate('posterUserId');
    return result;
});
const taskPaymentConfirmService = (posterId, taskId) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const taskerId = yield taskPost_model_1.default.findOne({
            _id: taskId,
            posterUserId: posterId,
        });
        if (!taskerId) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Tasker not found!!');
        }
        const task = yield taskPost_model_1.default.findOne({
            _id: taskId,
            taskerUserId: taskerId.taskerUserId,
            posterUserId: posterId,
        }).session(session);
        if (!task) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'you are not tasker!!');
        }
        // if (task.status !== 'complete') {
        //   throw new AppError(httpStatus.BAD_REQUEST, 'Task is not completed!!');
        // }
        if (task.paymentStatus !== 'request') {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Task payment is not request!!');
        }
        const result = yield taskPost_model_1.default.findOneAndUpdate({
            _id: taskId,
            taskerUserId: taskerId.taskerUserId,
            posterUserId: posterId,
        }, { paymentStatus: 'paid', status: 'complete' }, { new: true, session }).populate('posterUserId').populate('taskerUserId');
        const wallet = yield wallet_model_1.Wallet.findOne({
            userId: taskerId.taskerUserId,
            // role: 'tasker',
        }).session(session);
        if (!wallet) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Wallet not found!!');
        }
        const walletAmountAdd = yield wallet_model_1.Wallet.findOneAndUpdate({ userId: taskerId.taskerUserId }, { $inc: { amount: task.price } }, { new: true, session });
        if (!walletAmountAdd) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Wallet update failed!!');
        }
        const withdrawData = {
            taskerUserId: taskerId.taskerUserId,
            amount: task.price,
            method: 'task',
            status: 'completed',
            type: 'taskPayment',
            taskName: task.taskName,
        };
        const taskPayment = yield withdraw_model_1.default.create([withdrawData], { session });
        if (!taskPayment) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Task payment failed!!');
        }
        yield session.commitTransaction();
        session.endSession();
        return result;
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
const taskReviewConfirmService = (userId, taskId, bodyData) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const user = yield user_models_1.User.findById(userId).session(session);
        if (!user) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'User not found!!');
        }
        const updateUserId = user.role === 'tasker' ? 'taskerUserId' : 'posterUserId';
        const task = yield taskPost_model_1.default.findOne({
            _id: taskId,
            [updateUserId]: userId,
        }).session(session);
        if (!task) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Task not found!!');
        }
        if (task.status !== 'complete') {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Task is not completed!!');
        }
        if (task.paymentStatus !== 'paid') {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Task payment is not paid!!');
        }
        if (task.ratingStatus === 'complete' &&
            task.taskerratingStatus === 'complete') {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Task review is already completed!!');
        }
        if (user.role === 'tasker') {
            const taskReviewAlreadyGiven = yield taskPost_model_1.default.findOne({
                taskId: taskId,
                taskerUserId: user === null || user === void 0 ? void 0 : user._id,
                posterUserId: task.posterUserId,
                ratingStatus: 'complete',
            }).session(session);
            if (taskReviewAlreadyGiven) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Task review is already given!!');
            }
            const result = yield taskPost_model_1.default.findOneAndUpdate({
                _id: taskId,
                taskerUserId: user === null || user === void 0 ? void 0 : user._id,
                posterUserId: task.posterUserId,
            }, { ratingStatus: 'complete' }, { new: true, session });
            if (!result) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Task update failed!!');
            }
            const poster = yield user_models_1.User.findById(result.posterUserId).session(session);
            if (!poster) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Poster not found!!');
            }
            //calculation new rating
            const newRatingTotal = poster.rating * poster.reviews + bodyData.rating;
            const newReviewCount = poster.reviews + 1;
            const newRating = newRatingTotal / newReviewCount;
            const taskerUpdate = yield user_models_1.User.findOneAndUpdate({ _id: poster === null || poster === void 0 ? void 0 : poster._id }, { rating: newRating, reviews: newReviewCount }, { new: true, session });
            if (!taskerUpdate) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Poster update failed!!');
            }
            yield session.commitTransaction();
            session.endSession();
            return taskerUpdate;
        }
        else {
            const taskReviewAlreadyGiven = yield taskPost_model_1.default.findOne({
                taskId: taskId,
                taskerUserId: user === null || user === void 0 ? void 0 : user._id,
                posterUserId: task.posterUserId,
                taskerratingStatus: 'complete',
            }).session(session);
            if (taskReviewAlreadyGiven) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Task review is already given!!');
            }
            const result = yield taskPost_model_1.default.findOneAndUpdate({
                _id: taskId,
                taskerUserId: user === null || user === void 0 ? void 0 : user._id,
                posterUserId: task.posterUserId,
            }, { taskerratingStatus: 'complete' }, { new: true, session });
            if (!result) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Task update failed!!');
            }
            const tasker = yield user_models_1.User.findById(result.taskerUserId).session(session);
            if (!tasker) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Tasker not found!!');
            }
            //calculation new rating
            const newRatingTotal = tasker.rating * tasker.reviews + bodyData.rating;
            const newReviewCount = tasker.reviews + 1;
            const newRating = newRatingTotal / newReviewCount;
            const taskerUpdate = yield user_models_1.User.findOneAndUpdate({ _id: tasker === null || tasker === void 0 ? void 0 : tasker._id }, { rating: newRating, reviews: newReviewCount }, { new: true, session });
            if (!taskerUpdate) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Tasker update failed!!');
            }
            yield session.commitTransaction();
            session.endSession();
            return taskerUpdate;
        }
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
exports.taskPostService = {
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
