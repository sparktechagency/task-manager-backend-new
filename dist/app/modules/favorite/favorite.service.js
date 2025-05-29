"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.favoriteBusinessService = void 0;
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const favorite_model_1 = __importDefault(require("./favorite.model"));
const createOrDeleteFavoriteBusiness = (payload, customerId) => __awaiter(void 0, void 0, void 0, function* () {
    const { businessId } = payload;
    // Check if a FavoritecreateOrDeleteFavoriteBusiness with the same storyId and userId exists
    const existingFavoriteBusiness = yield favorite_model_1.default.findOne({
        businessId,
        customerId,
    }).populate('businessId');
    if (existingFavoriteBusiness) {
        // If it exists, delete it and return populated data
        yield favorite_model_1.default.findByIdAndDelete(existingFavoriteBusiness._id);
        const favoriteBusiness = Object.assign(Object.assign({}, existingFavoriteBusiness.toObject()), { favoriteBusiness: false });
        return {
            message: 'Favorite Business deleted !!',
            data: favoriteBusiness,
        };
    }
    else {
        // If it does not exist, create a new one
        const newFavoriteBusiness = new favorite_model_1.default(Object.assign(Object.assign({}, payload), { customerId }));
        yield newFavoriteBusiness.save();
        const populatedResult = yield newFavoriteBusiness.populate('businessId');
        const favoriteBusiness = Object.assign(Object.assign({}, populatedResult.toObject()), { favoriteBusiness: true });
        return {
            message: 'Favorite Business successful',
            data: favoriteBusiness,
        };
    }
});
// const createFavoritecreateOrDeleteFavoriteBusiness = async (payload:TFavoritecreateOrDeleteFavoriteBusiness) => {
//   const result = await FavoritecreateOrDeleteFavoriteBusiness.create(payload);
//   return result;
// };
const getAllFavoriteBusinessByUserQuery = (query, customerId) => __awaiter(void 0, void 0, void 0, function* () {
    const favoriteBusinessQuery = new QueryBuilder_1.default(favorite_model_1.default.find({ customerId })
        .populate('customerId')
        .populate('businessId'), query)
        .search([''])
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = yield favoriteBusinessQuery.modelQuery;
    const meta = yield favoriteBusinessQuery.countTotal();
    return { meta, result };
});
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
exports.favoriteBusinessService = {
    createOrDeleteFavoriteBusiness,
    getAllFavoriteBusinessByUserQuery,
    // createFavoritecreateOrDeleteFavoriteBusiness,
    // deleteFavoritecreateOrDeleteFavoriteBusiness,
};
