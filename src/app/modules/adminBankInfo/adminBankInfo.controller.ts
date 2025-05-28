import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { bankService } from './adminBankInfo.service';

const addBankInfo = catchAsync(async (req, res, next) => {
  const { userId } = req.user;
  const bankInfo = req.body;
  bankInfo.adminId = userId;
  // console.log('userId', userId);
  // console.log('walet', walet);
  const result = await bankService.addBankAcountService(bankInfo);

  if (result) {
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'bank info added Successfull!!',
      data: result,
    });
  } else {
    sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: true,
      message: 'Failed to add info',
      data: {},
    });
  }
});

const getbankInfo = catchAsync(async (req, res, next) => {
  const result = await bankService.getBankAcountService();

  if (result) {
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'bank info are retrive Successfull!',
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


const updateBankInfo = catchAsync(async (req, res, next) => {
  const udpateData = req.body;
  const result = await bankService.updateBankAcountService(udpateData);

  if (result) {
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Update bank info Successfull!',
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


export const bankInfoController = {
  addBankInfo,
  getbankInfo,
  updateBankInfo,
};
