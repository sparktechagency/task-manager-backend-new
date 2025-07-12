/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { DeleteAccountPayload, TUser, TUserCreate } from './user.interface';
import { User } from './user.models';
import { USER_ROLE } from './user.constants';
import config from '../../config';
import QueryBuilder from '../../builder/QueryBuilder';
import { otpServices } from '../otp/otp.service';
import { generateOptAndExpireTime } from '../otp/otp.utils';
import { TPurposeType } from '../otp/otp.interface';
import { otpSendEmail } from '../../utils/eamilNotifiacation';
import { createToken, verifyToken } from '../../utils/tokenManage';
import { walletService } from '../wallet/wallet.service';
import { Wallet } from '../wallet/wallet.model';

export type IFilter = {
  searchTerm?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export interface OTPVerifyAndCreateUserProps {
  otp: string;
  token: string;
}

const createUserToken = async (payload: TUserCreate) => {
  const { role, email, fullName, password, phone, taxNum, bsnNum } = payload;

  // user role check
  if (!(role === USER_ROLE.POSTER || role === USER_ROLE.TASKER)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User data is not valid !!');
  }

  // user exist check
  const userExist = await userService.getUserByEmail(email);

  if (userExist) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User already exist!!');
  }

  const { isExist, isExpireOtp } = await otpServices.checkOtpByEmail(email);
  // console.log({ isExist });
  // console.log({ isExpireOtp });

  const { otp, expiredAt } = generateOptAndExpireTime();
  // console.log({ otp });
  // console.log({ expiredAt });

  let otpPurpose: TPurposeType = 'email-verification';

  if (isExist && !isExpireOtp) {
    throw new AppError(httpStatus.BAD_REQUEST, 'otp-exist. Check your email.');
  } else if (isExist && isExpireOtp) {
    const otpUpdateData = {
      otp,
      expiredAt,
    };

    await otpServices.updateOtpByEmail(email, otpUpdateData);
  } else if (!isExist) {
    await otpServices.createOtp({
      name: fullName,
      sentTo: email,
      receiverType: 'email',
      purpose: otpPurpose,
      otp,
      expiredAt,
    });
  }

  const otpBody: any = {
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
  process.nextTick(async () => {
    await otpSendEmail({
      sentTo: email,
      subject: 'Your one time otp for email  verification',
      name: fullName,
      otp,
      expiredAt: expiredAt,
    });
    // // console.log({alala})
  });

  // crete token
  const createUserToken = createToken({
    payload: otpBody,
    access_secret: config.jwt_access_secret as string,
    expity_time: config.otp_token_expire_time as string | number,
  });

  return createUserToken;
};

const otpVerifyAndCreateUser = async ({
  otp,
  token,
}: OTPVerifyAndCreateUserProps) => {
  // console.log('otp',otp)
  if (!token) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Token not found');
  }

  const decodeData = verifyToken({
    token,
    access_secret: config.jwt_access_secret as string,
  });
  // // console.log({ decodeData });

  if (!decodeData) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You are not authorised');
  }

  const { password, email, fullName, role, phone, taxNum, bsnNum } = decodeData;

  const isOtpMatch = await otpServices.otpMatch(email, otp);

  if (!isOtpMatch) {
    throw new AppError(httpStatus.BAD_REQUEST, 'OTP did not match');
  }

  process.nextTick(async () => {
    await otpServices.updateOtpByEmail(email, {
      status: 'verified',
    });
  });

  if (!(role === USER_ROLE.TASKER || role === USER_ROLE.POSTER)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User data is not valid !!');
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

  const isExist = await User.isUserExist(email as string);

  if (isExist) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'User already exists with this email',
    );
  }

  const user = await User.create(userData);

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User creation failed');
  }

  const isExistWallet = await Wallet.findOne({
    userId: user._id
  });

  if(!isExistWallet){
    const data = {
      userId: user._id
    };
    const wallet = await Wallet.create(data);
    if(!wallet){
      throw new AppError(httpStatus.BAD_REQUEST, "Wallet Created Failed!!");
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

  return  user;
};

const createAdmin = async (payload:any) => {

  const isExist = await User.isUserExist(payload.email as string);

  if (isExist) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Already exists with this email',
    );
  }

  const user = await User.create(payload);

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User creation failed');
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
};

const userSwichRoleService = async (id: string) => {
  const swichUser = await User.findById(id);

  if (!swichUser) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User not found');
  }

  let swichRole;

  if (swichUser.role === 'tasker') {
    swichRole = 'poster';
  } else {
    swichRole = 'tasker';
  }

  const user = await User.findByIdAndUpdate(
    id,
    { role: swichRole },
    { new: true },
  );

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User swich failed');
  }

  const jwtPayload: {
    userId: string;
    role: string;
    fullName: string;
    email: string;
  } = {
    fullName: user?.fullName,
    email: user.email,
    userId: user?._id?.toString() as string,
    role: user?.role,
  };

  const userToken = createToken({
    payload: jwtPayload,
    access_secret: config.jwt_access_secret as string,
    expity_time: config.jwt_access_expires_in as string | number,
  });

  return userToken;
};

const updateUser = async (id: string, payload: Partial<TUser>) => {
  const { role, email, ...rest } = payload;

  console.log('id', id);
  console.log('payload', payload);
  const user = await User.findByIdAndUpdate(id, rest, { new: true });

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User updating failed');
  }

  return user;
};

// ............................rest

const getAllUserQuery = async (query: Record<string, unknown>) => {
  const userQuery = new QueryBuilder(User.find({}), query)
    .search([''])
    .filter()
    .sort()
    // .paginate()
    .fields();

  const result = await userQuery.modelQuery;
  const meta = await userQuery.countTotal();
  return { meta, result };
};



const getAllUserRatio = async (year: number) => {
  const startOfYear = new Date(year, 0, 1); // January 1st of the given year
  const endOfYear = new Date(year + 1, 0, 1); // January 1st of the next year

  // Create an array with all 12 months to ensure each month appears in the result
  const months = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    userCount: 0, // Default count of 0
  }));

  const userRatios = await User.aggregate([
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
};

const getUserById = async (id: string) => {
  const result = await User.findById(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  return result;
};

const getUserByEmail = async (email: string) => {
  const result = await User.findOne({ email });

  return result;
};

const deleteMyAccount = async (id: string, payload: DeleteAccountPayload) => {
  const user: TUser | null = await User.IsUserExistById(id);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (user?.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted');
  }

  if (!(await User.isPasswordMatched(payload.password, user.password))) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Password does not match');
  }

  const userDeleted = await User.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );

  if (!userDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, 'user deleting failed');
  }

  return userDeleted;
};

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


const blockedUser = async (id: string, userId: string) => {
  const existUser: TUser | null = await User.findById(id);

  if (!existUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const blocker: TUser | null = await User.findById(userId);

  if (!blocker) {
    throw new AppError(httpStatus.NOT_FOUND, 'Admin not found');
  }

  if (existUser.role === blocker.role) {
    throw new AppError(httpStatus.FORBIDDEN, 'You cannot block this Person!!');
  }
  if (existUser.role === 'super_admin') {
    throw new AppError(httpStatus.FORBIDDEN, 'You cannot block this Person!!');
  }

  const blockUnblockSwich = existUser.isActive ? false : true;

  const user = await User.findByIdAndUpdate(
    id,
    { isActive: blockUnblockSwich },
    { new: true },
  );

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'user blocking failed');
  }

  return user;
};


export const userService = {
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
