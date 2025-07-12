import mongoose, { Types } from 'mongoose';
import AppError from '../../error/AppError';
import { User } from '../user/user.models';
import { TWallet } from './wallet.interface';
import { Wallet } from './wallet.model';
import { paymentService } from '../payment/payment.service';
import { Payment } from '../payment/payment.model';

const addWalletService = async (userId: string,) => {
  if (!userId) {
    throw new AppError(400, 'User ID is required!');
  }
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError(400, 'Invalid User ID format!');
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(404, 'user not found!');
  }
  // console.log('user', user);
  if (user.role !== 'tasker' && user.role !== 'poster') {
    throw new AppError(400, 'The user is not valid!');
  }

  const wallet = await Wallet.findOne({ userId: userId});
  if (wallet) {
    throw new AppError(400, 'Wallet already exist!');
  }


  const payload: TWallet = {
    userId: new Types.ObjectId(userId),
    amount: 0,
  };

  const result = await Wallet.create(payload);

  return result;
};


const addWalletAmountService = async (userId: string, walet: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!userId) {
      throw new AppError(400, 'User ID is required!');
    }

    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError(400, 'Invalid User ID format!');
    }

    const user = await User.findById(userId).session(session); 
    if (!user) {
      throw new AppError(404, 'User not found!');
    }

    if (user.role !== 'poster') {
      throw new AppError(400, 'The user is not valid!');
    }

    const wallet = await Wallet.findOne({
      userId: userId
    }).session(session);
    if (!wallet) {
      throw new AppError(400, 'Wallet not found!');
    }

    const paymentData = {
      posterUserId: userId,
      transactionId: walet.transactionId,
      method: walet.method,
      status: 'paid',
      price: walet.amount,
      type: 'diposit',
      transactionDate: new Date(),
    };

    const payment = await paymentService.addPaymentService(paymentData); 
    if (!payment) {
      throw new AppError(400, 'Payment not found!');
    }

    const updatedWallet = await Wallet.findOneAndUpdate(
      { userId: userId},
      { $inc: { amount: walet.amount } },
      { new: true, session }, 
    );

    if (!updatedWallet) {
      throw new AppError(400, 'Failed to update wallet balance');
    }

    await session.commitTransaction();
    session.endSession();

    return updatedWallet; 
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error; 
  }
};



const addWalletAmountConformRequestService = async (userId: string, walet: any) => {
  if (!userId) {
    throw new AppError(400, 'User ID is required!');
  }

  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError(400, 'Invalid User ID format!');
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(404, 'user not found!');
  }
  // console.log('user', user);
  if ( user.role !== 'poster') {
    throw new AppError(400, 'The user is not valid!');
  }

  const wallet = await Wallet.findOne({ userId: userId});
  if (!wallet) {
    throw new AppError(400, 'Wallet not found!');
  }

  if(walet.name !== "bank"){
    throw new AppError(400, 'The payment method is not valid!');

  }

  const paymentData = {
    posterUserId: userId,
    transactionId: walet.transactionId,
    method:walet.name, 
    status:"request",
    price:walet.amount
  };

  const payment = await paymentService.addPaymentService(paymentData);

  if (!payment) {
    throw new AppError(400, 'Payment not found!');
  }


  return payment;
};


const addWalletAmountConformService = async (id: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!id) {
      throw new AppError(400, 'User ID is required!');
    }

    if (!Types.ObjectId.isValid(id)) {
      throw new AppError(400, 'Invalid User ID format!');
    }

    const payment = await Payment.findById(id).session(session);
    if (!payment) {
      throw new AppError(404, 'Payment not found!');
    }

    if (payment.status !== 'request') {
      throw new AppError(400, 'The payment is not valid!');
    }

    if (payment.method !== 'bank') {
      throw new AppError(400, 'The payment method is not valid!');
    }

    const updatePayment = await Payment.findByIdAndUpdate(
      id,
      { $set: { status: 'paid' } },
      { new: true, session }, 
    );

    if (!updatePayment) {
      throw new AppError(400, 'Payment confirm not found!');
    }

    const updatedWallet = await Wallet.findOneAndUpdate(
      { userId: payment.posterUserId},
      { $inc: { amount: payment.price } },
      { new: true, session }, 
    );

    if (!updatedWallet) {
      throw new AppError(400, 'Wallet not found or unable to update balance!');
    }

    await session.commitTransaction();
    session.endSession();

    return updatePayment;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error; 
  }
};



const userWalletGetService = async (userId: string) => {
  if (!userId) {
    throw new AppError(400, 'User ID is required!');
  }

  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError(400, 'Invalid User ID format!');
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(404, 'User not found!');
  }

  if (user.role !== 'tasker' && user.role !== 'poster') {
    throw new AppError(400, 'The user is not valid!');
  }
  const wallet = await Wallet.findOne({ userId });
  return wallet;
};

const userWalletGetByTaskerService = async (userId: string) => {
  if (!userId) {
    throw new AppError(400, 'User ID is required!');
  }

  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError(400, 'Invalid User ID format!');
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(404, 'User not found!');
  }

  if (user.role !== 'tasker') {
    throw new AppError(400, 'The user is not valid!');
  }
  const wallet = await Wallet.findOne({ userId });
  return wallet;
};

const deletedWallet = async (userId: string, id: string) => {
  if (!userId) {
    throw new AppError(400, 'User ID is required!');
  }

  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError(400, 'Invalid User ID format!');
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(404, 'User not found!');
  }

  if (user.role !== 'tasker' && user.role !== 'poster') {
    throw new AppError(400, 'The user is not valid!');
  }

  const wallet = await Wallet.findOne({ userId });
  if (!wallet) {
    throw new AppError(404, 'Wallet not found!');
  }

  const result = await Wallet.findOneAndDelete({ userId, _id: id });
  return result;
};

export const walletService = {
  addWalletService,
  addWalletAmountService,
  addWalletAmountConformRequestService,
  addWalletAmountConformService,
  userWalletGetService,
  userWalletGetByTaskerService,
  deletedWallet,
};
