import AppError from '../../error/AppError';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import { User } from '../user/user.models';
import { TReview } from './ratings.interface';
import { Review } from './ratings.model';
import TaskPost from '../taskPost/taskPost.model';
// import Business from '../business/business.model';

const createReviewService = async (payload: any, userId: string) => {
  try {

    if (!payload.taskId) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Task ID is required!');
    }
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
    }
    const task = await TaskPost.findById(payload.taskId);

    if (!task) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Task not found!');
    }

    if (task.status !== 'complete') {
      throw new AppError(httpStatus.BAD_REQUEST, 'Task is not completed!');
    }

    if(user.role === 'tasker'){

      if (task.taskerratingStatus === 'complete') {
        throw new AppError(httpStatus.BAD_REQUEST, 'Poster is already rated!');
      }

      const reviewData = {
        taskerId: user._id,
        posterId: task.posterUserId,
        taskId: task._id,
        rating: payload.rating,
      }

      const result = await Review.create(reviewData);

      const poster = await User.findById(task.posterUserId);  

      if (!poster) {
        throw new AppError(httpStatus.NOT_FOUND, 'Poster not found!');
      }


      let { reviews, rating } = poster;

      const newRating = (rating * reviews + result.rating) / (reviews + 1);

      const updatedRegistration = await User.findByIdAndUpdate(
        result.posterId,
        {
          reviews: reviews + 1,
          rating: newRating,
        },
        { new: true },
      );

      const taskUpdate = await TaskPost.findByIdAndUpdate(
        task._id,
        {
          taskerratingStatus: 'complete',
        },
        { new: true },
      );

      if (!updatedRegistration) {
        throw new AppError(
          httpStatus.INTERNAL_SERVER_ERROR,
          'Failed to update Review!',
        );
      }



      return result;

     

    }else{

      if (task.ratingStatus === 'complete') {
        throw new AppError(httpStatus.BAD_REQUEST, 'Tasker is already rated!');
      }

      const reviewData = {
        taskerId: task.taskerUserId,
        posterId: user._id,
        taskId: task._id,
        rating: payload.rating,
      };

      const result = await Review.create(reviewData);

      const tasker = await User.findById(task.taskerUserId);

      if (!tasker) {
        throw new AppError(httpStatus.NOT_FOUND, 'Tasker not found!');
      }

      let { reviews, rating } = tasker;

      const newRating = (rating * reviews + result.rating) / (reviews + 1);

      const updatedRegistration = await User.findByIdAndUpdate(
        result.taskerId,
        {
          reviews: reviews + 1,
          rating: newRating,
        },
        { new: true },
      );

      const taskUpdate = await TaskPost.findByIdAndUpdate(
        task._id,
        {
          ratingStatus: 'complete',
        },
        { new: true },
      );

      if (!updatedRegistration) {
        throw new AppError(
          httpStatus.INTERNAL_SERVER_ERROR,
          'Failed to update Review!',
        );
      }

      return result;

    }
  } catch (error) {
    console.error('Error creating review:', error);

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'An unexpected error occurred while creating the review.',
    );
  }
};

const getAllReviewByBusinessQuery = async (
  query: Record<string, unknown>,
  businessId: string,
) => {
  const reviewQuery = new QueryBuilder(
    Review.find({ businessId }).populate('businessId').populate('customerId'),
    query,
  )
    .search([''])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await reviewQuery.modelQuery;
  const meta = await reviewQuery.countTotal();
  return { meta, result };
};

const getSingleReviewQuery = async (id: string) => {
  const review = await Review.findById(id);
  if (!review) {
    throw new AppError(404, 'Review Not Found!!');
  }
  const result = await Review.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
  ]);
  if (result.length === 0) {
    throw new AppError(404, 'Review not found!');
  }

  return result[0];
};

const updateReviewQuery = async (
  id: string,
  payload: Partial<TReview>,
  customerId: string,
) => {
  if (!id || !customerId) {
    throw new AppError(400, 'Invalid input parameters');
  }

  const result = await Review.findOneAndUpdate(
    { _id: id, customerId: customerId },
    payload,
    { new: true, runValidators: true },
  );

  if (!result) {
    throw new AppError(404, 'Review Not Found or Unauthorized Access!');
  }
  return result;
};

const deletedReviewQuery = async (id: string, customerId: string) => {
  // if (!id || !customerId) {
  //   throw new AppError(400, 'Invalid input parameters');
  // }

  // const result = await Review.findOneAndDelete({
  //   _id: id,
  //   customerId: customerId,
  // });

  // if (!result) {
  //   throw new AppError(404, 'Review Not Found!');
  // }

  // const business = await Business.findById(result.businessId);
  // if (!business) {
  //   throw new AppError(404, 'Business not found!');
  // }

  // const { reviewCount, ratings } = business;
  // // console.log('reviewCount ratingCount', reviewCount, ratings);
  // // console.log('result.rating', result.rating);

  // const newRatingCount = ratings - result.rating;
  // // console.log('newRatingCount', newRatingCount);
  // const newReviewCount = reviewCount - 1;
  // // console.log('newReviewCount', newReviewCount);

  // let newAverageRating = 0;
  // // console.log('newAverageRating', newAverageRating);
  // if (newReviewCount > 0) {
  //   newAverageRating = newRatingCount / newReviewCount;
  // }

  // if (newReviewCount <= 0) {
  //   newAverageRating = 0;
  // }

  // // console.log('newAverageRating-2', newAverageRating);

  // const updateRatings = await Business.findByIdAndUpdate(
  //   business._id,
  //   {
  //     reviewCount: newReviewCount,
  //     ratings: newAverageRating,
  //   },
  //   { new: true },
  // );

  // if (!updateRatings) {
  //   throw new AppError(500, 'Failed to update Business Ratings!');
  // }

  // return result;
};

export const reviewService = {
  createReviewService,
  getAllReviewByBusinessQuery,
  getSingleReviewQuery,
  updateReviewQuery,
  deletedReviewQuery,
};
