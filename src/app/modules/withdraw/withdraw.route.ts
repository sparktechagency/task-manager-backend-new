import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import { withdrawController } from './withdraw.controller';


const withdrawRouter = express.Router();

withdrawRouter
  .post('/conform-withdraw', auth(USER_ROLE.TASKER), withdrawController.paypalConformWithdraw)
  .post(
    '/withdraw-request',
    auth(USER_ROLE.TASKER),
    withdrawController.withdrawRequest,
  )
  .get(
    '/',
    // auth(USER_ROLE.ADMIN),
    withdrawController.getAllWithdraw,
  )
  .get(
    '/tasker-withdraw',
    auth(USER_ROLE.TASKER),
    withdrawController.getAllWithdrawByBusinessMan,
  )
  .get('/:id', withdrawController.getSingleWithdraw)
  .patch(
    '/paid/:id',
    auth(USER_ROLE.ADMIN),
    withdrawController.adminPaidBankWithdraw,
  )
  .delete('/:id', withdrawController.deleteSingleWithdraw);

export default withdrawRouter;
