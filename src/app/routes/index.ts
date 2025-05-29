import { Router } from 'express';
import { otpRoutes } from '../modules/otp/otp.routes';
import { userRoutes } from '../modules/user/user.route';
import { authRoutes } from '../modules/auth/auth.route';
import settingsRouter from '../modules/settings/setting.route';
import notificationRoutes from '../modules/notification/notification.route';
import paymentRouter from '../modules/payment/payment.route';
// import walletRouter from '../modules/wallet/wallet.route';
import withdrawRouter from '../modules/withdraw/withdraw.route';
// import cencelBookingRoutes from '../modules/cencelBooking/cencelBooking.route';
import reviewRouter from '../modules/ratings/ratings.route';
import chatRouter from '../modules/chat/chat.route';
import messageRouter from '../modules/message/message.route';
import taskRouter from '../modules/taskPost/taskPost.route';
import walletRouter from '../modules/wallet/wallet.route';
import adminBankInfoRouter from '../modules/adminBankInfo/adminBankInfo.route';
import reportRouter from '../modules/report/report.route';

const router = Router();

const moduleRoutes = [
  {
    path: '/users',
    route: userRoutes,
  },
  {
    path: '/auth',
    route: authRoutes,
  },
  {
    path: '/otp',
    route: otpRoutes,
  },

  {
    path: '/setting',
    route: settingsRouter,
  },
  {
    path: '/notification',
    route: notificationRoutes,
  },
  {
    path: '/wallet',
    route: walletRouter,
  },
  {
    path: '/payment',
    route: paymentRouter,
  },
  {
    path: '/withdraw',
    route: withdrawRouter,
  },
  
  {
    path: '/review',
    route: reviewRouter,
  },
  {
    path: '/chat',
    route: chatRouter,
  },
  {
    path: '/message',
    route: messageRouter,
  },
  {
    path: '/task',
    route: taskRouter,
  },
  {
    path: '/admin-bank-info',
    route: adminBankInfoRouter,
  },
  {
    path: '/report',
    route: reportRouter,
  },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
