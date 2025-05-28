import AppError from '../../error/AppError';
import { User } from '../user/user.models';
import { TPayment } from './payment.interface';
import { Payment } from './payment.model';
import QueryBuilder from '../../builder/QueryBuilder';
import moment from 'moment';
// import { serviceBookingService } from '../serviceBooking/serviceBooking.service';
import Stripe from 'stripe';
import httpStatus from 'http-status';
import config from '../../config';
import mongoose from 'mongoose';
import { StripeAccount } from '../stripeAccount/stripeAccount.model';
import { withdrawService } from '../withdraw/withdraw.service';
// import { Withdraw } from '../withdraw/withdraw.model';
import cron from 'node-cron';
import TaskPost from '../taskPost/taskPost.model';

// console.log({ first: config.stripe.stripe_api_secret });

export const stripe = new Stripe(
  config.stripe.stripe_api_secret as string,
  //      {
  //   apiVersion: '2024-09-30.acacia',
  // }
);

const addPaymentService = async (payload: any) => {
  const poster = await User.findById(payload.posterUserId);
  if (!poster) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Poster not found');
  }
  const result = await Payment.create(payload);
  return result;
};

const getAllPaymentService = async (query: Record<string, unknown>) => {
  const PaymentQuery = new QueryBuilder(
    Payment.find({ status : "paid"}).populate('posterUserId'),
    query,
  )
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await PaymentQuery.modelQuery;
  const meta = await PaymentQuery.countTotal();
  return { meta, result };
};


const getAllPaymentByPosterService = async (query: Record<string, unknown>, posterUserId: string) => {
  const PaymentQuery = new QueryBuilder(
    Payment.find({ status: 'paid', posterUserId }).populate({
      path: 'posterUserId',
      select: 'fullName image email role _id phone',
    }),
    query,
  )
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await PaymentQuery.modelQuery;
  const meta = await PaymentQuery.countTotal();
  return { meta, result };
};
const getAllPaymentByCustomerService = async (
  query: Record<string, unknown>,
  customerId: string,
) => {
  const PaymentQuery = new QueryBuilder(Payment.find({ customerId }), query)
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await PaymentQuery.modelQuery;
  const meta = await PaymentQuery.countTotal();
  return { meta, result };
};

const singlePaymentService = async (id: string) => {
  const task = await Payment.findById(id);
  return task;
};

const deleteSinglePaymentService = async (id: string) => {
  const result = await Payment.deleteOne({ _id: id });
  return result;
};

const getAllIncomeRatio = async (year: number) => {
  // console.log('year dashboard====', year);
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year + 1, 0, 1);

  const months = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    totalIncome: 0,
  }));

  // console.log({ months });

  const incomeData = await Payment.aggregate([
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
};

const getAllIncomeRatiobyDays = async (days: string) => {
  const currentDay = new Date();
  let startDate: Date;

  if (days === '7day') {
    startDate = new Date(currentDay.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (days === '24hour') {
    startDate = new Date(currentDay.getTime() - 24 * 60 * 60 * 1000);
  } else {
    throw new Error("Invalid value for 'days'. Use '7day' or '24hour'.");
  }

  // console.log(`Fetching income data from ${startDate} to ${currentDay}`);

  const timeSlots =
    days === '7day'
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

  const incomeData = await Payment.aggregate([
    {
      $match: {
        transactionDate: { $gte: startDate, $lte: currentDay },
      },
    },
    {
      $group: {
        _id:
          days === '7day'
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
      const dayData = timeSlots.find((d: any) => d.date === data.date);
      if (dayData) {
        dayData.totalIncome = data.totalIncome;
      }
    } else if (days === '24hour') {
      const hourData = timeSlots.find((h: any) => h.hour === data.hour);
      if (hourData) {
        hourData.totalIncome = data.totalIncome;
      }
    }
  });

  return timeSlots;
};

const createCheckout = async (userId: any, payload: any) => {
  // console.log('stripe payment', payload);
  let session = {} as { id: string };

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

  const sessionData: any = {
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
    session = await stripe.checkout.sessions.create(sessionData);

    // console.log('session', session.id);
  } catch (error) {
    // console.log('Error', error);
  }

  // // console.log({ session });
  const { id: session_id, url }: any = session || {};

  // console.log({ url });
  // console.log({ url });

  return { url };
};

const automaticCompletePayment = async (event: Stripe.Event): Promise<void> => {
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
};

const paymentRefundService = async (
  amount: number | null,
  payment_intent: string,
) => {
  const refundOptions: Stripe.RefundCreateParams = {
    payment_intent,
  };

  // Conditionally add the `amount` property if provided
  if (amount) {
    refundOptions.amount = Number(amount);
  }

  // console.log('refaund options', refundOptions);

  const result = await stripe.refunds.create(refundOptions);
  // console.log('refund result ', result);
  return result;
};

const getAllEarningRatio = async (year: number, businessId: string) => {
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
};

const filterBalanceByPaymentMethod = async (businessId: string) => {
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
};

const filterWithdrawBalanceByPaymentMethod = async (
  paymentMethod: string,
  businessId: string,
) => {
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
};

const availablewithdrawAmount = async (
  paymentMethod: string,
  businessId: string,
) => {
  // console.log('businessId:', businessId);
  // console.log('paymentMethod:', paymentMethod);

  // Convert businessId to ObjectId
  const businessObjectId = new mongoose.Types.ObjectId(businessId);

  // Aggregate payments
  const payment = await Payment.aggregate([
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
};

const refreshAccountConnect = async (
  id: string,
  host: string,
  protocol: string,
): Promise<string> => {
  const onboardingLink = await stripe.accountLinks.create({
    account: id,
    refresh_url: `${protocol}://${host}/api/v1/payment/refreshAccountConnect/${id}`,
    return_url: `${protocol}://${host}/api/v1/payment/success-account/${id}`,
    type: 'account_onboarding',
  });
  return onboardingLink.url;
};

const createStripeAccount = async (
  user: any,
  host: string,
  protocol: string,
): Promise<any> => {
  // console.log('user',user);
  const existingAccount = await StripeAccount.findOne({
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

    const onboardingLink = await stripe.accountLinks.create({
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

  const account = await stripe.accounts.create({
    type: 'express',
    email: user.email,
    country: 'US',
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });
  // console.log('stripe account', account);

  await StripeAccount.create({ accountId: account.id, userId: user.userId });

  const onboardingLink = await stripe.accountLinks.create({
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
};

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

export const paymentService = {
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
