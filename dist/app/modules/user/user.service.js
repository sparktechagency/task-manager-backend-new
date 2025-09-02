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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const user_models_1 = require("./user.models");
const user_constants_1 = require("./user.constants");
const config_1 = __importDefault(require("../../config"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const otp_service_1 = require("../otp/otp.service");
const otp_utils_1 = require("../otp/otp.utils");
const eamilNotifiacation_1 = require("../../utils/eamilNotifiacation");
const tokenManage_1 = require("../../utils/tokenManage");
const wallet_model_1 = require("../wallet/wallet.model");
const createUserToken = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { role, email, fullName, password, phone, taxNum, bsnNum } = payload;
    // user role check
    if (!(role === user_constants_1.USER_ROLE.POSTER || role === user_constants_1.USER_ROLE.TASKER)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'User data is not valid !!');
    }
    // user exist check
    const userExist = yield exports.userService.getUserByEmail(email);
    if (userExist) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'User already exist!!');
    }
    const { isExist, isExpireOtp } = yield otp_service_1.otpServices.checkOtpByEmail(email);
    // console.log({ isExist });
    // console.log({ isExpireOtp });
    const { otp, expiredAt } = (0, otp_utils_1.generateOptAndExpireTime)();
    console.log({ otp });
    // console.log({ expiredAt });
    let otpPurpose = 'email-verification';
    if (isExist && !isExpireOtp) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'otp-exist. Check your email.');
    }
    else if (isExist && isExpireOtp) {
        const otpUpdateData = {
            otp,
            expiredAt,
        };
        yield otp_service_1.otpServices.updateOtpByEmail(email, otpUpdateData);
    }
    else if (!isExist) {
        yield otp_service_1.otpServices.createOtp({
            name: fullName,
            sentTo: email,
            receiverType: 'email',
            purpose: otpPurpose,
            otp,
            expiredAt,
        });
    }
    const otpBody = {
        email,
        fullName,
        password,
        role,
        phone,
        taxNum,
        bsnNum,
    };
    // console.log({ otpBody });
    // send email
    process.nextTick(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, eamilNotifiacation_1.otpSendEmail)({
            sentTo: email,
            subject: 'Your one time otp for email  verification',
            name: fullName,
            otp,
            expiredAt: expiredAt,
        });
        // // console.log({alala})
    }));
    // crete token
    const createUserToken = (0, tokenManage_1.createToken)({
        payload: otpBody,
        access_secret: config_1.default.jwt_access_secret,
        expity_time: config_1.default.otp_token_expire_time,
    });
    return createUserToken;
});
const otpVerifyAndCreateUser = (_a) => __awaiter(void 0, [_a], void 0, function* ({ otp, token, }) {
    // console.log('otp',otp)
    if (!token) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Token not found');
    }
    const decodeData = (0, tokenManage_1.verifyToken)({
        token,
        access_secret: config_1.default.jwt_access_secret,
    });
    // // console.log({ decodeData });
    if (!decodeData) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'You are not authorised');
    }
    const { password, email, fullName, role, phone, taxNum, bsnNum } = decodeData;
    const isOtpMatch = yield otp_service_1.otpServices.otpMatch(email, otp);
    if (!isOtpMatch) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'OTP did not match');
    }
    process.nextTick(() => __awaiter(void 0, void 0, void 0, function* () {
        yield otp_service_1.otpServices.updateOtpByEmail(email, {
            status: 'verified',
        });
    }));
    if (!(role === user_constants_1.USER_ROLE.TASKER || role === user_constants_1.USER_ROLE.POSTER)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'User data is not valid !!');
    }
    const userData = {
        password,
        email,
        fullName,
        role,
        phone,
        taxNum,
        bsnNum,
    };
    const isExist = yield user_models_1.User.isUserExist(email);
    if (isExist) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'User already exists with this email');
    }
    const user = yield user_models_1.User.create(userData);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'User creation failed');
    }
    const isExistWallet = yield wallet_model_1.Wallet.findOne({
        userId: user._id
    });
    if (!isExistWallet) {
        const data = {
            userId: user._id
        };
        const wallet = yield wallet_model_1.Wallet.create(data);
        if (!wallet) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Wallet Created Failed!!");
        }
    }
    // const jwtPayload: {
    //   userId: string;
    //   role: string;
    //   fullName: string;
    //   email: string;
    // } = {
    //   fullName: user?.fullName,
    //   email: user.email,
    //   userId: user?._id?.toString() as string,
    //   role: user?.role,
    // };
    // const userToken = createToken({
    //   payload: jwtPayload,
    //   access_secret: config.jwt_access_secret as string,
    //   expity_time: config.jwt_access_expires_in as string | number,
    // });
    return user;
});
const createAdmin = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield user_models_1.User.isUserExist(payload.email);
    if (isExist) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Already exists with this email');
    }
    const user = yield user_models_1.User.create(payload);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'User creation failed');
    }
    // const jwtPayload: {
    //   userId: string;
    //   role: string;
    //   fullName: string;
    //   email: string;
    // } = {
    //   fullName: user?.fullName,
    //   email: user.email,
    //   userId: user?._id?.toString() as string,
    //   role: user?.role,
    // };
    // const userToken = createToken({
    //   payload: jwtPayload,
    //   access_secret: config.jwt_access_secret as string,
    //   expity_time: config.jwt_access_expires_in as string | number,
    // });
    return user;
});
const userSwichRoleService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const swichUser = yield user_models_1.User.findById(id);
    if (!swichUser) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'User not found');
    }
    let swichRole;
    if (swichUser.role === 'tasker') {
        swichRole = 'poster';
    }
    else {
        swichRole = 'tasker';
    }
    const user = yield user_models_1.User.findByIdAndUpdate(id, { role: swichRole }, { new: true });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'User swich failed');
    }
    const jwtPayload = {
        fullName: user === null || user === void 0 ? void 0 : user.fullName,
        email: user.email,
        userId: (_a = user === null || user === void 0 ? void 0 : user._id) === null || _a === void 0 ? void 0 : _a.toString(),
        role: user === null || user === void 0 ? void 0 : user.role,
    };
    const userToken = (0, tokenManage_1.createToken)({
        payload: jwtPayload,
        access_secret: config_1.default.jwt_access_secret,
        expity_time: config_1.default.jwt_access_expires_in,
    });
    return userToken;
});
const updateUser = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { role, email } = payload, rest = __rest(payload, ["role", "email"]);
    console.log('id', id);
    console.log('payload', payload);
    const user = yield user_models_1.User.findByIdAndUpdate(id, rest, { new: true });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'User updating failed');
    }
    return user;
});
// ............................rest
const getAllUserQuery = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const userQuery = new QueryBuilder_1.default(user_models_1.User.find({}), query)
        .search([''])
        .filter()
        .sort()
        // .paginate()
        .fields();
    const result = yield userQuery.modelQuery;
    const meta = yield userQuery.countTotal();
    return { meta, result };
});
const getAllUserRatio = (year) => __awaiter(void 0, void 0, void 0, function* () {
    const startOfYear = new Date(year, 0, 1); // January 1st of the given year
    const endOfYear = new Date(year + 1, 0, 1); // January 1st of the next year
    // Create an array with all 12 months to ensure each month appears in the result
    const months = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        userCount: 0, // Default count of 0
    }));
    const userRatios = yield user_models_1.User.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: startOfYear,
                    $lt: endOfYear,
                },
            },
        },
        {
            $group: {
                _id: { $month: '$createdAt' }, // Group by month (1 = January, 12 = December)
                userCount: { $sum: 1 }, // Count users for each month
            },
        },
        {
            $project: {
                month: '$_id', // Rename the _id field to month
                userCount: 1,
                _id: 0,
            },
        },
        {
            $sort: { month: 1 }, // Sort by month in ascending order (1 = January, 12 = December)
        },
    ]);
    // Merge the months array with the actual data to ensure all months are included
    const fullUserRatios = months.map((monthData) => {
        const found = userRatios.find((data) => data.month === monthData.month);
        return found ? found : monthData; // Use found data or default to 0
    });
    return fullUserRatios;
});
const getUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_models_1.User.findById(id);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    return result;
});
const getUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_models_1.User.findOne({ email });
    return result;
});
const deleteMyAccount = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_models_1.User.IsUserExistById(id);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    if (user === null || user === void 0 ? void 0 : user.isDeleted) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This user is deleted');
    }
    if (!(yield user_models_1.User.isPasswordMatched(payload.password, user.password))) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Password does not match');
    }
    const userDeleted = yield user_models_1.User.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!userDeleted) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'user deleting failed');
    }
    return userDeleted;
});
// const blockedUser = async (id: string) => {
//   const user: TUser | null = await User.IsUserExistById(id);
//   if (!user) {
//     throw new AppError(httpStatus.NOT_FOUND, 'User not found');
//   }
//   const result = await User.findByIdAndUpdate(
//     id,
//     { isActive: user.isActive ? false : true },
//     { new: true },
//   );
//   if (!result) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'user deleting failed');
//   }
//   return result;
// };
const blockedUser = (id, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const existUser = yield user_models_1.User.findById(id);
    if (!existUser) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    const blocker = yield user_models_1.User.findById(userId);
    if (!blocker) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Admin not found');
    }
    if (existUser.role === blocker.role) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You cannot block this Person!!');
    }
    if (existUser.role === 'super_admin') {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You cannot block this Person!!');
    }
    const blockUnblockSwich = existUser.isActive ? false : true;
    const user = yield user_models_1.User.findByIdAndUpdate(id, { isActive: blockUnblockSwich }, { new: true });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'user blocking failed');
    }
    return user;
});
exports.userService = {
    createUserToken,
    otpVerifyAndCreateUser,
    createAdmin,
    userSwichRoleService,
    getUserById,
    getUserByEmail,
    updateUser,
    deleteMyAccount,
    blockedUser,
    getAllUserQuery,
    getAllUserRatio,
};
