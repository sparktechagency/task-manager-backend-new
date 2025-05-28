import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { reportService } from './report.service';

const createReport = catchAsync(async (req, res, next) => {
  const { userId } = req.user;
  const report = req.body;
  report.taskerId = userId;
  // console.log('userId', userId);
  // console.log('walet', walet);
  const result = await reportService.addReportService(report);

  if (result) {
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Report added Successfull!!',
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

const getAllReportByTasker = catchAsync(async (req, res, next) => {
  const { userId } = req.user;
  const result = await reportService.getAllReportsByTaskerQuery(req.query,userId);

  if (result) {
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Reports are retrived Successfull!!',
      data: result,
    });
  } else {
    sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: true,
      message: 'Failed to add report',
      data: {},
    });
  }
});

const getAllReports = catchAsync(async (req, res, next) => {
  const result =
    await reportService.getAllReportsByAdminQuery(req.query);

  if (result) {
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Reports are retrived Successfull!!',
      data: result,
    });
  } else {
    sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: true,
      message: 'Failed to request report',
      data: {},
    });
  }
});


export const reportController = {
  createReport,
  getAllReportByTasker,
  getAllReports,
};
