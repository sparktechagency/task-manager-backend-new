import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import { reportController } from './report.controller';

const reportRouter = express.Router();

reportRouter
  .post(
    '/',
    auth(USER_ROLE.TASKER),
    // validateRequest(videoValidation.VideoSchema),
    reportController.createReport,
  )

  .get(
    '/tasker',
    auth(USER_ROLE.TASKER),
    reportController.getAllReportByTasker,
  )
  .get('/', 
    auth(USER_ROLE.ADMIN), 
    reportController.getAllReports);


export default reportRouter;
