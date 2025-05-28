import { Router } from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import { favoriteBusinessController } from './favorite.controller';

const favoriteBusinessRoutes = Router();

favoriteBusinessRoutes.post(
  '',
  auth(USER_ROLE.CUSTOMER),
  //   validateRequest(paymnetValidation),
  favoriteBusinessController.createFavoriteBusiness,
);

favoriteBusinessRoutes.get(
  '',
  auth(USER_ROLE.CUSTOMER),
  favoriteBusinessController.getAllFavoriteBusinessByUser,
);
// saveStoryRoutes.delete(
//   '/:id',
//   auth(USER_ROLE.USER),
//   SaveStoryController.deletedSaveStory,
// );

export default favoriteBusinessRoutes;
