import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { walletService } from './wallet.service';

const createWallet = catchAsync(async (req, res, next) => {
    const { userId } = req.user;
    // console.log('userId', userId);
    // console.log('walet', walet);
  const result = await walletService.addWalletService(userId);

  if (result) {
     sendResponse(res, {
       statusCode: httpStatus.OK,
       success: true,
       message: 'Wallet added Successfull!!',
       data: result,
     });
  } else {
    sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: true,
      message: 'Failed to add Wallet',
      data: {},
    });
  }
});

const addWalletAmount = catchAsync(async (req, res, next) => {
  const { userId } = req.user;
  const walet = req.body;
  // console.log('userId', userId);
  // console.log('walet', walet);
  const result = await walletService.addWalletAmountService(userId, walet);

  if (result) {
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Wallet added Successfull!!',
      data: result,
    });
  } else {
    sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: true,
      message: 'Failed to add Wallet',
      data: {},
    });
  }
});

const addWalletAmountConformRequest = catchAsync(async (req, res, next) => {
  const { userId } = req.user;
  const walet = req.body;
  // console.log('userId', userId);
  // console.log('walet', walet);
  const result = await walletService.addWalletAmountConformRequestService(
    userId,
    walet,
  );

  if (result) {
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Add wallet request Successfull!!',
      data: result,
    });
  } else {
    sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: true,
      message: 'Failed to request Wallet',
      data: {},
    });
  }
});
const addWalletAmountConform = catchAsync(async (req, res, next) => {
const {id} = req.params
  const result = await walletService.addWalletAmountConformService(id);

  if (result) {
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Wallet added Successfull!!',
      data: result,
    });
  } else {
    sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: true,
      message: 'Failed to add Wallet',
      data: {},
    });
  }
});

const getSingleWalletByUser = catchAsync(async (req, res, next) => {
  const { userId } = req.user;
  const result = await walletService.userWalletGetService(userId);

  if (result) {
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Wallet are retrive Successfull!',
      data: result,
    });
  } else {
    sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: true,
      message: 'Data is not found',
      data: {},
    });
  }
});

const getSingleWalletByTasker = catchAsync(async (req, res, next) => {
  const { userId } = req.user;
  const result = await walletService.userWalletGetByTaskerService(userId);

  if (result) {
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Wallet are retrive Successfull!',
      data: result,
    });
  } else {
    sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: true,
      message: 'Data is not found',
      data: {},
    });
  }
});

const deleteWallet = catchAsync(async (req, res, next) => {
  const { userId } = req.user;
  const { id } = req.params
  const result = await walletService.deletedWallet(userId, id);

  if (result) {
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Deleted Wallet are Successfull!',
      data: result,
    });
  } else {
    sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: true,
      message: 'Data is not found',
      data: {},
    });
  }
});

export const walletController = {
  createWallet,
  addWalletAmount,
  addWalletAmountConformRequest,
  addWalletAmountConform,
  getSingleWalletByUser,
  getSingleWalletByTasker,
  deleteWallet,
};
