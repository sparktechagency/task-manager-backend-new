import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import { walletController } from './wallet.controller';


const walletRouter = express.Router();

walletRouter
  .post(
    '/',
    auth(USER_ROLE.TASKER, USER_ROLE.POSTER),
    // validateRequest(videoValidation.VideoSchema),
    walletController.createWallet,
  ) 
  .post(
    '/amount',
    auth(USER_ROLE.POSTER),
    // validateRequest(videoValidation.VideoSchema),
    walletController.addWalletAmount,
  )
  .post(
    '/bank-amount-request',
    auth(USER_ROLE.POSTER),
    // validateRequest(videoValidation.VideoSchema),
    walletController.addWalletAmountConformRequest,
  )
  .patch(
    '/bank-amount-conform/:id',
    // auth(USER_ROLE.ADMIN),
    // validateRequest(videoValidation.VideoSchema),
    walletController.addWalletAmountConform,
  )
  .get(
    '/tasker',
    auth(USER_ROLE.TASKER),
    walletController.getSingleWalletByTasker,
  )
  .get(
    '/',
    auth(USER_ROLE.TASKER, USER_ROLE.POSTER),
    walletController.getSingleWalletByUser,
  )

  .delete(
    '/:id',
    auth(USER_ROLE.TASKER, USER_ROLE.POSTER),
    walletController.deleteWallet,
  );

export default walletRouter;
