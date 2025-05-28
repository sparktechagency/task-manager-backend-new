import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import { taskPostController } from './taskPost.controller';
import fileUpload from '../../middleware/fileUpload';

const upload = fileUpload('./public/uploads/task');

const taskRouter = express.Router();

taskRouter
  .post(
    '/create-task-post',
    upload.fields([{ name: 'taskImages', maxCount: 5 }]),
    auth(USER_ROLE.POSTER),
    // validateRequest(videoValidation.VideoSchema),
    taskPostController.createTaskPost,
  )

  .get('/', taskPostController.getAllTask)
  .get('/map-task', taskPostController.getAllTaskByMap)
  .get('/task-dashboard-overview', taskPostController.getTaskOverview)
  .get(
    '/task-pending-complete-cancel-overview',
    taskPostController.getAllTaskPendingCompleteCancel,
  )
  .get(
    '/task-overview-poster',
    auth(USER_ROLE.POSTER),
    taskPostController.getAllTaskOverviewPoster,
  )
  .get(
    '/task-overview-tasker-poster',
    auth(USER_ROLE.TASKER, USER_ROLE.POSTER),
    taskPostController.getAllTaskOverviewTaskerPoster,
  )
  .get(
    '/task-complete-income-overview-chart',
    auth(USER_ROLE.TASKER),
    taskPostController.getAllCompleteTaskOverviewChartByTasker,
  )

  .get('/filter', taskPostController.getAllTaskByFilter)
  .get(
    '/poster-tasker',
    auth(USER_ROLE.POSTER, USER_ROLE.TASKER),
    taskPostController.getAllTaskByTaskerPoster,
  )
  // .get('/tasker', auth(USER_ROLE.TASKER), taskPostController.getAllTaskByTasker)
  .get('/:id', taskPostController.getSingleTaskPost)
  .patch(
    '/accept/:id',
    // auth(USER_ROLE.ADMIN),
    taskPostController.taskAcceptByAdmin,
  )
  .patch(
    '/cancel/:id',
    // auth(USER_ROLE.ADMIN),
    taskPostController.taskCancelByAdmin,
  )
  .delete(
    '/:id',
    auth(USER_ROLE.POSTER),
    taskPostController.deleteSingleTaskPost,
  )

  .patch(
    '/tasker-accept-request/:id',
    auth(USER_ROLE.TASKER),
    taskPostController.taskerTaskAcceptRequest,
  )
  .patch(
    '/tasker-offer-request/:id',
    auth(USER_ROLE.TASKER),
    taskPostController.taskerTaskOfferRequest,
  )
  .patch(
    '/poster-again-offer-request/:id',
    auth(USER_ROLE.POSTER),
    taskPostController.posterAgainTaskOfferRequest,
  )
  .patch(
    '/poster-accepted/:id',
    auth(USER_ROLE.POSTER),
    taskPostController.posterTaskAccepted,
  )
  .patch(
    '/poster-canceled/:id',
    auth(USER_ROLE.POSTER),
    taskPostController.posterTaskCanceled,
  )
  .patch(
    '/task-complete/:id',
    auth(USER_ROLE.TASKER),
    taskPostController.taskCompleteByTasker,
  )
  .patch(
    '/task-payment-request/:id',
    auth(USER_ROLE.TASKER),
    taskPostController.taskPaymentRequest,
  )
  .patch(
    '/task-payment-request/:id',
    auth(USER_ROLE.TASKER),
    taskPostController.taskPaymentRequest,
  )
  .patch(
    '/task-payment-confirm/:id',
    auth(USER_ROLE.POSTER),
    taskPostController.taskPaymentConfirm,
  )
  .patch(
    '/task-review-confirm/:id',
    auth(USER_ROLE.POSTER, USER_ROLE.TASKER),
    taskPostController.taskReviewConfirm,
  );

export default taskRouter;
