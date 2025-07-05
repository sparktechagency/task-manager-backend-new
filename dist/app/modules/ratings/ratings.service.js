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
exports.reviewService = void 0;
const AppError_1 = __importDefault(require("../../error/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const mongoose_1 = __importDefault(require("mongoose"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const user_models_1 = require("../user/user.models");
const ratings_model_1 = require("./ratings.model");
const taskPost_model_1 = __importDefault(require("../taskPost/taskPost.model"));
// import Business from '../business/business.model';
const createReviewService = (payload, userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!payload.taskId) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Task ID is required!');
        }
        const user = yield user_models_1.User.findById(userId);
        if (!user) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found!');
        }
        const task = yield taskPost_model_1.default.findById(payload.taskId);
        if (!task) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Task not found!');
        }
        if (task.status !== 'complete') {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Task is not completed!');
        }
        if (user.role === 'tasker') {
            if (task.taskerratingStatus === 'complete') {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Poster is already rated!');
            }
            const reviewData = {
                taskerId: user._id,
                posterId: task.posterUserId,
                taskId: task._id,
                rating: payload.rating,
            };
            const result = yield ratings_model_1.Review.create(reviewData);
            const poster = yield user_models_1.User.findById(task.posterUserId);
            if (!poster) {
                throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Poster not found!');
            }
            let { reviews, rating } = poster;
            const newRating = (rating * reviews + result.rating) / (reviews + 1);
            const updatedRegistration = yield user_models_1.User.findByIdAndUpdate(result.posterId, {
                reviews: reviews + 1,
                rating: newRating,
            }, { new: true });
            const taskUpdate = yield taskPost_model_1.default.findByIdAndUpdate(task._id, {
                taskerratingStatus: 'complete',
            }, { new: true });
            if (!updatedRegistration) {
                throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to update Review!');
            }
            return result;
        }
        else {
            if (task.ratingStatus === 'complete') {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Tasker is already rated!');
            }
            const reviewData = {
                taskerId: task.taskerUserId,
                posterId: user._id,
                taskId: task._id,
                rating: payload.rating,
            };
            const result = yield ratings_model_1.Review.create(reviewData);
            const tasker = yield user_models_1.User.findById(task.taskerUserId);
            if (!tasker) {
                throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Tasker not found!');
            }
            let { reviews, rating } = tasker;
            const newRating = (rating * reviews + result.rating) / (reviews + 1);
            const updatedRegistration = yield user_models_1.User.findByIdAndUpdate(result.taskerId, {
                reviews: reviews + 1,
                rating: newRating,
            }, { new: true });
            const taskUpdate = yield taskPost_model_1.default.findByIdAndUpdate(task._id, {
                ratingStatus: 'complete',
            }, { new: true });
            if (!updatedRegistration) {
                throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to update Review!');
            }
            return result;
        }
    }
    catch (error) {
        console.error('Error creating review:', error);
        if (error instanceof AppError_1.default) {
            throw error;
        }
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'An unexpected error occurred while creating the review.');
    }
});
const getAllReviewByBusinessQuery = (query, businessId) => __awaiter(void 0, void 0, void 0, function* () {
    const reviewQuery = new QueryBuilder_1.default(ratings_model_1.Review.find({ businessId }).populate('businessId').populate('customerId'), query)
        .search([''])
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = yield reviewQuery.modelQuery;
    const meta = yield reviewQuery.countTotal();
    return { meta, result };
});
const getSingleReviewQuery = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const review = yield ratings_model_1.Review.findById(id);
    if (!review) {
        throw new AppError_1.default(404, 'Review Not Found!!');
    }
    const result = yield ratings_model_1.Review.aggregate([
        { $match: { _id: new mongoose_1.default.Types.ObjectId(id) } },
    ]);
    if (result.length === 0) {
        throw new AppError_1.default(404, 'Review not found!');
    }
    return result[0];
});
const updateReviewQuery = (id, payload, customerId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!id || !customerId) {
        throw new AppError_1.default(400, 'Invalid input parameters');
    }
    const result = yield ratings_model_1.Review.findOneAndUpdate({ _id: id, customerId: customerId }, payload, { new: true, runValidators: true });
    if (!result) {
        throw new AppError_1.default(404, 'Review Not Found or Unauthorized Access!');
    }
    return result;
});
const deletedReviewQuery = (id, customerId) => __awaiter(void 0, void 0, void 0, function* () {
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
});
exports.reviewService = {
    createReviewService,
    getAllReviewByBusinessQuery,
    getSingleReviewQuery,
    updateReviewQuery,
    deletedReviewQuery,
};
