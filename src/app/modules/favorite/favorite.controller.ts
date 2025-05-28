// import Stripe from "stripe";
import catchAsync from '../../utils/catchAsync';
import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { userService } from '../user/user.service';
import AppError from '../../error/AppError';
import { favoriteBusinessService } from './favorite.service';

const createFavoriteBusiness = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;

  const { message, data } =
    await favoriteBusinessService.createOrDeleteFavoriteBusiness(
      req.body,
      userId,
    );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: data,
    message: message,
  });
});

const getAllFavoriteBusinessByUser = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result =
    await favoriteBusinessService.getAllFavoriteBusinessByUserQuery(
      req.query,
      userId as string,
    );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    meta: result.meta,
    data: result.result,
    message: 'Favorite Business All are requered successful!!',
  });
});

// const deletedFavoriteBusiness = catchAsync(async (req: Request, res: Response) => {
//   const { userId } = req.user;
//   const result = await FavoriteBusinessService.deleteFavoriteBusiness(req.params.id, userId);

//   sendResponse(res, {
//     success: true,
//     statusCode: httpStatus.OK,
//     data: result,
//     message: 'deleted successful',
//   });
// });

export const favoriteBusinessController = {
  createFavoriteBusiness,
  getAllFavoriteBusinessByUser,
  // deletedFavoriteBusiness,
};
