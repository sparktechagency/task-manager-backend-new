/** @format */

import { Router } from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import { chatController } from './chat.controller';


const chatRouter = Router();

// chatRouter.get(
//   '/',
//   auth(USER_ROLE.TASKER, USER_ROLE.POSTER),
//   chatController.getAllChats,
// );

chatRouter.post(
  '/',
  auth(USER_ROLE.TASKER, USER_ROLE.POSTER),
  chatController.createChat,
);

chatRouter.patch(
  '/:id',
  auth(USER_ROLE.TASKER, USER_ROLE.POSTER),
  chatController.updateChat,
);

chatRouter.delete(
  '/:id',
  auth(USER_ROLE.TASKER, USER_ROLE.POSTER),
  chatController.deleteChat,
);

chatRouter.get(
  '/my-chat-list',
  auth(USER_ROLE.TASKER, USER_ROLE.POSTER),
  chatController.getMyChatList,
);

chatRouter.get(
  '/:id',
  auth(USER_ROLE.TASKER, USER_ROLE.POSTER),
  chatController.getChatById,
);

export default chatRouter;
