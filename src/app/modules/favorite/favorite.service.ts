import { Types } from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import { User } from '../user/user.models';
import { TfavoriteBusiness } from './favorite.interface';
import FavoriteBusiness from './favorite.model';

const createOrDeleteFavoriteBusiness = async (payload: TfavoriteBusiness, customerId: string) => {
  const { businessId } = payload;

  // Check if a FavoritecreateOrDeleteFavoriteBusiness with the same storyId and userId exists
  const existingFavoriteBusiness = await FavoriteBusiness.findOne({
    businessId,
    customerId,
  }).populate('businessId');

  if (existingFavoriteBusiness) {
    // If it exists, delete it and return populated data
    await FavoriteBusiness.findByIdAndDelete(existingFavoriteBusiness._id);
    const favoriteBusiness = {
      ...existingFavoriteBusiness.toObject(),
      favoriteBusiness: false,
    };
    return {
      message: 'Favorite Business deleted !!',
      data: favoriteBusiness,
    };

  } else {
    // If it does not exist, create a new one
    const newFavoriteBusiness = new FavoriteBusiness({
      ...payload,
      customerId,
    });
    await newFavoriteBusiness.save();
    const populatedResult = await newFavoriteBusiness.populate('businessId');
    const favoriteBusiness = {
      ...populatedResult.toObject(),
      favoriteBusiness: true,
    };
    return {
      message: 'Favorite Business successful',
      data: favoriteBusiness,
    };

  }
};

// const createFavoritecreateOrDeleteFavoriteBusiness = async (payload:TFavoritecreateOrDeleteFavoriteBusiness) => {
//   const result = await FavoritecreateOrDeleteFavoriteBusiness.create(payload);
//   return result;
// };

const getAllFavoriteBusinessByUserQuery = async (
  query: Record<string, unknown>,
  customerId: string,
) => {
  const favoriteBusinessQuery = new QueryBuilder(
    FavoriteBusiness.find({ customerId })
      .populate('customerId')
      .populate('businessId'),
    query,
  )
    .search([''])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await favoriteBusinessQuery.modelQuery;
  const meta = await favoriteBusinessQuery.countTotal();
  return { meta, result };
};

// const deleteFavoritecreateOrDeleteFavoriteBusiness = async (id: string, userId: string) => {
//   // Fetch the FavoritecreateOrDeleteFavoriteBusiness by ID
//   const FavoritecreateOrDeleteFavoriteBusiness = await FavoritecreateOrDeleteFavoriteBusiness.findById(id);
//   if (!FavoritecreateOrDeleteFavoriteBusiness) {
//     throw new AppError(404, 'FavoritecreateOrDeleteFavoriteBusiness not found!');
//   }

//   // Fetch the user by ID
//   const user = await User.findById(userId);
//   if (!user) {
//     throw new AppError(404, 'User not found!');
//   }

//   // Ensure the FavoritecreateOrDeleteFavoriteBusiness belongs to the user
//   if (FavoritecreateOrDeleteFavoriteBusiness.userId.toString() !== userId) {
//     throw new AppError(403, 'You are not authorized to delete this FavoritecreateOrDeleteFavoriteBusiness!');
//   }

//   // Delete the FavoritecreateOrDeleteFavoriteBusiness
//   const result = await FavoritecreateOrDeleteFavoriteBusiness.findByIdAndDelete(id);
//   if (!result) {
//     throw new AppError(500, 'Error deleting FavoritecreateOrDeleteFavoriteBusiness!');
//   }

//   return result;
// };

export const favoriteBusinessService = {
  createOrDeleteFavoriteBusiness,
  getAllFavoriteBusinessByUserQuery,
  // createFavoritecreateOrDeleteFavoriteBusiness,
  // deleteFavoritecreateOrDeleteFavoriteBusiness,
};
