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
exports.paymentService = exports.stripe = void 0;
const AppError_1 = __importDefault(require("../../error/AppError"));
const user_models_1 = require("../user/user.models");
const payment_model_1 = require("./payment.model");
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
// import { serviceBookingService } from '../serviceBooking/serviceBooking.service';
const stripe_1 = __importDefault(require("stripe"));
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../../config"));
const mongoose_1 = __importDefault(require("mongoose"));
const stripeAccount_model_1 = require("../stripeAccount/stripeAccount.model");
// console.log({ first: config.stripe.stripe_api_secret });
exports.stripe = new stripe_1.default(config_1.default.stripe.stripe_api_secret);
const addPaymentService = (payload, session) => __awaiter(void 0, void 0, void 0, function* () {
    const poster = yield user_models_1.User.findById(payload.posterUserId).session(session);
    if (!poster) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Poster not found');
    }
    const result = yield payment_model_1.Payment.create([payload], { session });
    return result[0];
});
const getAllPaymentService = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const PaymentQuery = new QueryBuilder_1.default(payment_model_1.Payment.find({ status: "paid" }).populate('posterUserId'), query)
        .search(['name'])
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = yield PaymentQuery.modelQuery;
    const meta = yield PaymentQuery.countTotal();
    return { meta, result };
});
const getAllPaymentByPosterService = (query, posterUserId) => __awaiter(void 0, void 0, void 0, function* () {
    const PaymentQuery = new QueryBuilder_1.default(payment_model_1.Payment.find({ status: 'paid', posterUserId }).populate({
        path: 'posterUserId',
        select: 'fullName image email role _id phone',
    }), query)
        .search(['name'])
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = yield PaymentQuery.modelQuery;
    const meta = yield PaymentQuery.countTotal();
    return { meta, result };
});
const getAllPaymentByCustomerService = (query, customerId) => __awaiter(void 0, void 0, void 0, function* () {
    const PaymentQuery = new QueryBuilder_1.default(payment_model_1.Payment.find({ customerId }), query)
        .search(['name'])
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = yield PaymentQuery.modelQuery;
    const meta = yield PaymentQuery.countTotal();
    return { meta, result };
});
const singlePaymentService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const task = yield payment_model_1.Payment.findById(id);
    return task;
});
const deleteSinglePaymentService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield payment_model_1.Payment.deleteOne({ _id: id });
    return result;
});
const getAllIncomeRatio = (year) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log('year dashboard====', year);
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year + 1, 0, 1);
    const months = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        totalIncome: 0,
    }));
    // console.log({ months });
    const incomeData = yield payment_model_1.Payment.aggregate([
        {
            $match: {
                transactionDate: { $gte: startOfYear, $lt: endOfYear },
            },
        },
        {
            $group: {
                _id: { month: { $month: '$transactionDate' } },
                totalIncome: { $sum: '$price' },
            },
        },
        {
            $project: {
                month: '$_id.month',
                totalIncome: 1,
                _id: 0,
            },
        },
        {
            $sort: { month: 1 },
        },
    ]);
    incomeData.forEach((data) => {
        const monthData = months.find((m) => m.month === data.month);
        if (monthData) {
            monthData.totalIncome = data.totalIncome;
        }
    });
    // console.log({ months });
    return months;
});
const getAllIncomeRatiobyDays = (days) => __awaiter(void 0, void 0, void 0, function* () {
    const currentDay = new Date();
    let startDate;
    if (days === '7day') {
        startDate = new Date(currentDay.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    else if (days === '24hour') {
        startDate = new Date(currentDay.getTime() - 24 * 60 * 60 * 1000);
    }
    else {
        throw new Error("Invalid value for 'days'. Use '7day' or '24hour'.");
    }
    // console.log(`Fetching income data from ${startDate} to ${currentDay}`);
    const timeSlots = days === '7day'
        ? Array.from({ length: 7 }, (_, i) => {
            const day = new Date(currentDay.getTime() - i * 24 * 60 * 60 * 1000);
            return {
                date: day.toISOString().split('T')[0],
                totalIncome: 0,
            };
        }).reverse()
        : Array.from({ length: 24 }, (_, i) => {
            const hour = new Date(currentDay.getTime() - i * 60 * 60 * 1000);
            return {
                hour: hour.toISOString(),
                totalIncome: 0,
            };
        }).reverse();
    const incomeData = yield payment_model_1.Payment.aggregate([
        {
            $match: {
                transactionDate: { $gte: startDate, $lte: currentDay },
            },
        },
        {
            $group: {
                _id: days === '7day'
                    ? {
                        date: {
                            $dateToString: {
                                format: '%Y-%m-%d',
                                date: '$transactionDate',
                            },
                        },
                    }
                    : {
                        hour: {
                            $dateToString: {
                                format: '%Y-%m-%dT%H:00:00',
                                date: '$transactionDate',
                            },
                        },
                    },
                totalIncome: { $sum: '$depositAmount' },
            },
        },
        {
            $project: {
                date: days === '7day' ? '$_id.date' : null,
                hour: days === '24hour' ? '$_id.hour' : null,
                totalIncome: 1,
                _id: 0,
            },
        },
        {
            $sort: { [days === '7day' ? 'date' : 'hour']: 1 },
        },
    ]);
    incomeData.forEach((data) => {
        if (days === '7day') {
            const dayData = timeSlots.find((d) => d.date === data.date);
            if (dayData) {
                dayData.totalIncome = data.totalIncome;
            }
        }
        else if (days === '24hour') {
            const hourData = timeSlots.find((h) => h.hour === data.hour);
            if (hourData) {
                hourData.totalIncome = data.totalIncome;
            }
        }
    });
    return timeSlots;
});
const createCheckout = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log('stripe payment', payload);
    let session = {};
    // const lineItems = products.map((product) => ({
    //   price_data: {
    //     currency: 'usd',
    //     product_data: {
    //       name: 'Order Payment',
    //       description: 'Payment for user order',
    //     },
    //     unit_amount: Math.round(product.price * 100),
    //   },
    //   quantity: product.quantity,
    // }));
    const lineItems = [
        {
            price_data: {
                currency: 'usd',
                product_data: {
                    name: 'Amount',
                },
                unit_amount: payload.depositAmount * 100,
            },
            quantity: 1,
        },
    ];
    const sessionData = {
        payment_method_types: ['card'],
        mode: 'payment',
        success_url: `http://10.0.70.35:8020/api/v1/payment/success`,
        cancel_url: `http://10.0.70.35:8020/api/v1/payment/cancel`,
        line_items: lineItems,
        metadata: {
            userId: String(userId), // Convert userId to string
            serviceBookingId: String(payload.serviceBookingId),
            // products: payload,
        },
    };
    try {
        session = yield exports.stripe.checkout.sessions.create(sessionData);
        // console.log('session', session.id);
    }
    catch (error) {
        // console.log('Error', error);
    }
    // // console.log({ session });
    const { id: session_id, url } = session || {};
    // console.log({ url });
    // console.log({ url });
    return { url };
});
const automaticCompletePayment = (event) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log('hit hise webhook controller servie')
    // try {
    //   switch (event.type) {
    //     case 'checkout.session.completed': {
    //       console.log('hit hise webhook controller servie checkout.session.completed');
    //       const session = event.data.object as Stripe.Checkout.Session;
    //       const sessionId = session.id;
    //       const paymentIntentId = session.payment_intent as string;
    //       const serviceBookingId =
    //         session.metadata && (session.metadata.serviceBookingId as string);
    //       // console.log('=======serviceBookingId', serviceBookingId);
    //       const customerId =
    //         session.metadata && (session.metadata.userId as string);
    //       console.log('=======customerId', customerId);
    //       // session.metadata && (session.metadata.serviceBookingId as string);
    //       if (!paymentIntentId) {
    //         throw new AppError(
    //           httpStatus.BAD_REQUEST,
    //           'Payment Intent ID not found in session',
    //         );
    //       }
    //       const paymentIntent =
    //         await stripe.paymentIntents.retrieve(paymentIntentId);
    //       if (!paymentIntent || paymentIntent.amount_received === 0) {
    //         throw new AppError(httpStatus.BAD_REQUEST, 'Payment Not Successful');
    //       }
    //       const updateServiceBooking = await ServiceBooking.findByIdAndUpdate(
    //         serviceBookingId,
    //         { paymentStatus: 'upcoming', status: 'booking' },
    //         { new: true },
    //       );
    //       console.log('===updateServiceBooking', updateServiceBooking);
    //       const paymentData: any = {
    //         customerId,
    //         serviceId: updateServiceBooking?.serviceId,
    //         businessId: updateServiceBooking?.businessId,
    //         bookingprice: updateServiceBooking?.bookingprice,
    //         depositAmount: updateServiceBooking?.depositAmount,
    //         dipositParsentage: updateServiceBooking?.dipositParsentage,
    //         method: 'stripe',
    //         transactionId: paymentIntentId,
    //         transactionDate: updateServiceBooking?.bookingDate,
    //         serviceBookingId: updateServiceBooking?._id,
    //         status: 'paid',
    //         session_id: sessionId,
    //       };
    //       const payment = await Payment.create(paymentData);
    //       console.log('===payment', payment);
    //       if (!payment || !updateServiceBooking) {
    //         console.warn(
    //           'No Payment  and ServiceBooking record was updated ',
    //           sessionId,
    //         );
    //         throw new AppError(httpStatus.BAD_REQUEST, 'Payment Not Updated');
    //       }
    //       // const deletedServiceBooking = await ServiceBooking.findOneAndDelete({
    //       //   customerId, status: 'pending',
    //       // })
    //       // if (deletedServiceBooking) {
    //       //   // console.log('deleted sarvice booking successfully');
    //       // }
    //       const deletedServiceBookings = await ServiceBooking.deleteMany({
    //         customerId,
    //         status: 'pending',
    //       });
    //       console.log('deletedServiceBookings', deletedServiceBookings);
    //       if (deletedServiceBookings.deletedCount > 0) {
    //         console.log(
    //           `${deletedServiceBookings.deletedCount} bookings deleted successfully.`,
    //         );
    //       } else {
    //         // console.log('No matching bookings found.');
    //       }
    //       console.log('Payment completed successfully:', {
    //         sessionId,
    //         paymentIntentId,
    //       });
    //       break;
    //     }
    //     case 'checkout.session.async_payment_failed': {
    //       const session = event.data.object as Stripe.Checkout.Session;
    //       const clientSecret = session.client_secret;
    //       const sessionId = session.id;
    //       if (!clientSecret) {
    //         console.warn('Client Secret not found in session.');
    //         throw new AppError(httpStatus.BAD_REQUEST, 'Client Secret not found');
    //       }
    //       // const payment = await Payment.findOne({ session_id: sessionId });
    //       // if (payment) {
    //       //   payment.status = 'Failed';
    //       //   await payment.save();
    //       //   // console.log('Payment marked as failed:', { clientSecret });
    //       // } else {
    //       //   console.warn(
    //       //     'No Payment record found for Client Secret:',
    //       //     clientSecret,
    //       //   );
    //       // }
    //       break;
    //     }
    //     default:
    //       // // console.log(`Unhandled event type: ${event.type}`);
    //       // res.status(400).send();
    //       return;
    //   }
    // } catch (err) {
    //   console.error('Error processing webhook event:', err);
    //   // res.status(500).send('Internal Server Error');
    // }
});
const paymentRefundService = (amount, payment_intent) => __awaiter(void 0, void 0, void 0, function* () {
    const refundOptions = {
        payment_intent,
    };
    // Conditionally add the `amount` property if provided
    if (amount) {
        refundOptions.amount = Number(amount);
    }
    // console.log('refaund options', refundOptions);
    const result = yield exports.stripe.refunds.create(refundOptions);
    // console.log('refund result ', result);
    return result;
});
const getAllEarningRatio = (year, businessId) => __awaiter(void 0, void 0, void 0, function* () {
    // const startOfYear = new Date(year, 0, 1);
    // const endOfYear = new Date(year + 1, 0, 1);
    // const months = Array.from({ length: 12 }, (_, i) => ({
    //   month: i + 1,
    //   totalIncome: 0,
    // }));
    // // console.log({ months });
    // const incomeData = await ServiceBooking.aggregate([
    //   {
    //     $match: {
    //       status: 'complete',
    //       businessId,
    //       bookingDate: { $gte: startOfYear, $lt: endOfYear },
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: { month: { $month: '$bookingDate' } },
    //       totalIncome: { $sum: '$bookingprice' },
    //     },
    //   },
    //   {
    //     $project: {
    //       month: '$_id.month',
    //       totalIncome: 1,
    //       _id: 0,
    //     },
    //   },
    //   {
    //     $sort: { month: 1 },
    //   },
    // ]);
    // incomeData.forEach((data) => {
    //   const monthData = months.find((m) => m.month === data.month);
    //   if (monthData) {
    //     monthData.totalIncome = data.totalIncome;
    //   }
    // });
    // return months;
});
const filterBalanceByPaymentMethod = (businessId) => __awaiter(void 0, void 0, void 0, function* () {
    // // Convert businessId to ObjectId
    // const businessObjectId = new mongoose.Types.ObjectId(businessId);
    // // Aggregate payments
    // const payment = await ServiceBooking.aggregate([
    //   {
    //     $match: {
    //       status: 'complete',
    //       businessId: businessObjectId,
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: '$status',
    //       totalAmount: { $sum: '$bookingprice' },
    //     },
    //   },
    //   {
    //     $project: {
    //       _id: 0,
    //       totalAmount: 1,
    //     },
    //   },
    // ]);
    // // // console.log('payment', payment[0] ? payment[0] : totalAmount:0);
    // if (!payment[0]) {
    //   return { totalAmount: 0 };
    // }
    // // Ensure `payment` always returns valid data
    // return payment[0];
});
const filterWithdrawBalanceByPaymentMethod = (paymentMethod, businessId) => __awaiter(void 0, void 0, void 0, function* () {
    // // console.log('businessId:', businessId);
    // // console.log('paymentMethod:', paymentMethod);
    // // Convert businessId to ObjectId
    // const businessObjectId = new mongoose.Types.ObjectId(businessId);
    // // Aggregate payments
    // const payment = await Payment.aggregate([
    //   {
    //     $match: {
    //       method: paymentMethod,
    //       businessId: businessObjectId,
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: '$method',
    //       totalAmount: { $sum: '$depositAmount' },
    //     },
    //   },
    //   {
    //     $project: {
    //       _id: 0,
    //       method: '$_id',
    //       totalAmount: 1,
    //     },
    //   },
    // ]);
    // // console.log('payment===', payment);
    // // Aggregate withdrawals
    // const withdraw = await Withdraw.aggregate([
    //   {
    //     $match: {
    //       method: paymentMethod,
    //       businessId: businessObjectId,
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: '$method',
    //       totalAmount: { $sum: '$amount' },
    //     },
    //   },
    //   {
    //     $project: {
    //       _id: 0,
    //       method: '$_id',
    //       totalAmount: 1,
    //     },
    //   },
    // ]);
    // // Calculate available balance
    // const totalDeposits = payment.length > 0 ? payment[0].totalAmount : 0;
    // const totalWithdrawals = withdraw.length > 0 ? withdraw[0].totalAmount : 0;
    // const availableBalance = totalDeposits - totalWithdrawals;
    // // Ensure `payment` always returns valid data
    // return [
    //   {
    //     method: paymentMethod,
    //     totalAmount: availableBalance,
    //   },
    // ];
    return [];
});
const availablewithdrawAmount = (paymentMethod, businessId) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log('businessId:', businessId);
    // console.log('paymentMethod:', paymentMethod);
    // Convert businessId to ObjectId
    const businessObjectId = new mongoose_1.default.Types.ObjectId(businessId);
    // Aggregate payments
    const payment = yield payment_model_1.Payment.aggregate([
        {
            $match: {
                method: paymentMethod,
                businessId: businessObjectId,
            },
        },
        {
            $group: {
                _id: '$method',
                totalAmount: { $sum: '$depositAmount' },
            },
        },
        {
            $project: {
                _id: 0,
                method: '$_id',
                totalAmount: 1,
            },
        },
    ]);
    // Aggregate withdrawals
    // Calculate available balance
    const totalDeposits = payment.length > 0 ? payment[0].totalAmount : 0;
    // Ensure `payment` always returns valid data
    return [
        {
            method: paymentMethod,
            totalAmount: totalDeposits,
        },
    ];
});
const refreshAccountConnect = (id, host, protocol) => __awaiter(void 0, void 0, void 0, function* () {
    const onboardingLink = yield exports.stripe.accountLinks.create({
        account: id,
        refresh_url: `${protocol}://${host}/api/v1/payment/refreshAccountConnect/${id}`,
        return_url: `${protocol}://${host}/api/v1/payment/success-account/${id}`,
        type: 'account_onboarding',
    });
    return onboardingLink.url;
});
const createStripeAccount = (user, host, protocol) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log('user',user);
    const existingAccount = yield stripeAccount_model_1.StripeAccount.findOne({
        userId: user.userId,
    }).select('user accountId isCompleted');
    // console.log('existingAccount', existingAccount);
    if (existingAccount) {
        if (existingAccount.isCompleted) {
            return {
                success: false,
                message: 'Account already exists',
                data: existingAccount,
            };
        }
        const onboardingLink = yield exports.stripe.accountLinks.create({
            account: existingAccount.accountId,
            refresh_url: `${protocol}://${host}/api/v1/payment/refreshAccountConnect/${existingAccount.accountId}`,
            return_url: `${protocol}://${host}/api/v1/payment/success-account/${existingAccount.accountId}`,
            type: 'account_onboarding',
        });
        // console.log('onboardingLink-1', onboardingLink);
        return {
            success: true,
            message: 'Please complete your account',
            url: onboardingLink.url,
        };
    }
    const account = yield exports.stripe.accounts.create({
        type: 'express',
        email: user.email,
        country: 'US',
        capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
        },
    });
    // console.log('stripe account', account);
    yield stripeAccount_model_1.StripeAccount.create({ accountId: account.id, userId: user.userId });
    const onboardingLink = yield exports.stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${protocol}://${host}/api/v1/payment/refreshAccountConnect/${account.id}`,
        return_url: `${protocol}://${host}/api/v1/payment/success-account/${account.id}`,
        type: 'account_onboarding',
    });
    // console.log('onboardingLink-2', onboardingLink);
    return {
        success: true,
        message: 'Please complete your account',
        url: onboardingLink.url,
    };
});
// const transferBalanceService = async (
//   accountId: string,
//   amt: number,
//   userId: string,
// ) => {
//   const withdreawAmount = await availablewithdrawAmount('stripe', userId);
//   // console.log('withdreawAmount===', withdreawAmount[0].totalAmount);
//   if (withdreawAmount[0].totalAmount < 0) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'Amount must be positive');
//   }
//   const amount = withdreawAmount[0].totalAmount * 100;
//   const transfer = await stripe.transfers.create({
//     amount,
//     currency: 'usd',
//     destination: accountId,
//   });
//   // console.log('transfer', transfer);
//   if (!transfer) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'Transfer failed');
//   }
//   let withdraw;
//   if (transfer) {
//     const withdrawData: any = {
//       transactionId: transfer.id,
//       amount: withdreawAmount[0].totalAmount,
//       method: 'stripe',
//       status: 'completed',
//       businessId: userId,
//       destination: transfer.destination,
//     };
//     withdraw = withdrawService.addWithdrawService(withdrawData);
//     if (!withdraw) {
//       throw new AppError(httpStatus.BAD_REQUEST, 'Withdrawal failed');
//     }
//   }
//   return withdraw;
// };
// 0 0 */7 * *
// cron.schedule('* * * * *', async () => {
//   // console.log('Executing transferBalanceService every 7 days...');
//   const businessUser = await User.find({
//     role: 'business',
//     isDeleted: false,
//   });
//   // console.log('businessUser==', businessUser);
//   for (const user of businessUser) {
//     // console.log('usr=====');
//     const isExiststripeAccount:any = await StripeAccount.findOne({
//       userId: user._id,
//       isCompleted: true,
//     });
//     // console.log('isExiststripeAccount', isExiststripeAccount);
//     if (!isExiststripeAccount) {
//       throw new AppError(httpStatus.BAD_REQUEST, 'Account not found');
//     }
//      // console.log('=====1')
//     await transferBalanceService(
//       isExiststripeAccount.accountId,
//       0,
//       isExiststripeAccount.userId,
//     );
//     // console.log('=====2');
//   }
//   // await transferBalanceService();
// });
exports.paymentService = {
    addPaymentService,
    getAllPaymentService,
    getAllPaymentByPosterService,
    singlePaymentService,
    deleteSinglePaymentService,
    getAllPaymentByCustomerService,
    getAllIncomeRatio,
    getAllIncomeRatiobyDays,
    createCheckout,
    automaticCompletePayment,
    paymentRefundService,
    getAllEarningRatio,
    filterBalanceByPaymentMethod,
    filterWithdrawBalanceByPaymentMethod,
    createStripeAccount,
    refreshAccountConnect,
    // transferBalanceService,
};
