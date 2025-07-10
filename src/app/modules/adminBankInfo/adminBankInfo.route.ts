import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import { bankInfoController } from './adminBankInfo.controller';

const adminBankInfoRouter = express.Router();

adminBankInfoRouter

  .post(
    '/bank-info',
    auth(USER_ROLE.ADMIN),
    // validateRequest(videoValidation.VideoSchema),
    bankInfoController.addBankInfo,
  )
  .get('/', bankInfoController.getbankInfo)
  .patch('/update', auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN), bankInfoController.updateBankInfo);
  

export default adminBankInfoRouter;
