import AppError from '../../error/AppError';
import { User } from '../user/user.models';
import QueryBuilder from '../../builder/QueryBuilder';
import { TWithdraw } from './withdraw.interface';
import Withdraw from './withdraw.model';
import { Wallet } from '../wallet/wallet.model';
import mongoose from 'mongoose';
// import { Wallet } from '../wallet/wallet.model';
import paypal from 'paypal-rest-sdk';

paypal.configure({
  mode: 'sandbox', // Change to 'live' for production
  client_id: 'YOUR_PAYPAL_CLIENT_ID',
  client_secret: 'YOUR_PAYPAL_CLIENT_SECRET',
});

const conformPaypalWithdrawService = async (payload: any) => {
  const { taskerUserId, receiverEmail, currency = 'USD' } = payload;
  const amount = Number(payload.amount);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const tasker = await User.findById(taskerUserId).session(session);
    if (!tasker) {
      throw new AppError(400, 'User is not found!');
    }

    if (tasker.role !== 'tasker') {
      throw new AppError(400, 'User is not authorized as a Tasker!!');
    }

    if (!amount || amount <= 0) {
      throw new AppError(
        400,
        'Invalid Withdrawal amount. It must be a positive number.',
      );
    }

    const wallet = await Wallet.findOne({
      userId: taskerUserId,
    }).session(session);
    if (!wallet) {
      throw new AppError(400, 'Wallet not found!');
    }

    if (wallet.amount < amount) {
      throw new AppError(400, 'Insufficient wallet balance!');
    }

    const senderEmail = 'adminpaypal@gmail.com';

    const payoutData = {
      sender_batch_header: {
        email_subject: 'You have a payment',
      },
      items: [
        {
          recipient_type: 'EMAIL',
          amount: {
            value: amount,
            currency: currency,
          },
          receiver: receiverEmail,
          note: `Payment from ${senderEmail}`,
          sender_item_id: `item-${Math.random().toString(36).substring(7)}`,
        },
      ],
    };

    const payout:any = await new Promise((resolve, reject) => {
      paypal.payout.create(payoutData, (error:any, payoutResponse:any) => {
        if (error) {
          reject(new AppError(400, error.message));
        } else {
          resolve(payoutResponse);
        }
      });
    });

    console.log('Payout Response:', payout);

    const withdrawData = {
      taskerUserId: taskerUserId,
      amount: amount,
      method: 'paypal',
      status: 'completed',
      transactionId: payout.batch_header.payout_batch_id,
      transactionDate: new Date(),
      receiverEmail: receiverEmail,
      type: 'withdraw',
    };

    const result = await Withdraw.create([withdrawData], { session });

    wallet.amount = wallet.amount - amount;
    await wallet.save({ session });

    await session.commitTransaction();
    session.endSession();

    return result;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error processing payout:', error);
    throw new AppError(400, 'Payment processing failed!');
  }
};



const withdrawRequestService = async (payload: TWithdraw) => {

  const amount = Number(payload.amount);
  payload.amount = amount;  

  const tasker = await User.findById(payload.taskerUserId);
  if (!tasker) {
    throw new AppError(400, 'User is not found!');
  }

  if (tasker.role !== 'tasker') {
    throw new AppError(400, 'User is not authorized as a tasker!!');
  }

  if (!amount || amount <= 0) {
    throw new AppError(
      400,
      'Invalid Withdrawal amount. It must be a positive number.',
    );
  }

  if(payload.method !== 'bank'){
    throw new AppError(
      400,
      'Invalid withdrawal method. It must be a bank.',
    );
    
  }

  const wallet = await Wallet.findOne({
    userId: payload.taskerUserId
  });
  if (!wallet) {
    throw new AppError(400, 'Wallet not found!');
  }

  if (wallet.amount < amount) {
    throw new AppError(400, 'Insufficient wallet balance!');
  }

  payload.type = 'withdraw';

  const result = await Withdraw.create(payload);

  return result;
};

const getAllWithdrawService = async (query: Record<string, unknown>) => {
  const WithdrawQuery = new QueryBuilder(
    Withdraw.find().populate('taskerUserId'),
    query,
  )
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await WithdrawQuery.modelQuery;
  const meta = await WithdrawQuery.countTotal();
  return { meta, result };
};

const getAllWithdrawBybusinessService = async (
  query: Record<string, unknown>,
  taskerUserId: string,
) => {
  const WithdrawQuery = new QueryBuilder(Withdraw.find({ taskerUserId }), query)
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await WithdrawQuery.modelQuery;
  const meta = await WithdrawQuery.countTotal();
  return { meta, result };
};

const singleWithdrawService = async (id: string) => {
  const task = await Withdraw.findById(id);
  return task;
};


const adminPaidBankWithdrawService = async (id: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const withdraw = await Withdraw.findById(id).session(session);

    if (!withdraw) {
      throw new AppError(400, 'Withdraw not found!');
    }

    if (withdraw.status !== 'request') {
      throw new AppError(400, 'Withdraw is not request!');
    }

    const withdrawUpate = await Withdraw.findByIdAndUpdate(
      id,
      { status: 'completed' },
      { new: true, runValidators: true, session }, 
    );

    if (!withdrawUpate) {
      throw new AppError(400, 'Failed to update withdraw status!');
    }

    const tasker = await User.findById(withdraw.taskerUserId).session(session);

    if (!tasker) {
      throw new AppError(400, 'Tasker not found!');
    }

    if (tasker.role !== 'tasker') {
      throw new AppError(400, 'User is not authorized as a tasker!');
    }

    const wallet = await Wallet.findOne({
      userId: withdraw.taskerUserId
    }).session(session);

    if (!wallet) {
      throw new AppError(400, 'Wallet not found!');
    }

    if (wallet.amount < withdraw.amount) {
      throw new AppError(400, 'Insufficient wallet balance!');
    }

    wallet.amount = wallet.amount - withdraw.amount;

    await wallet.save({ session });

    await session.commitTransaction();
    session.endSession();

    return withdrawUpate;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error; 
  }
};





const deleteSingleWithdrawService = async (id: string) => {
  const result = await Withdraw.deleteOne({ _id: id });
  return result;
};

export const withdrawService = {
  conformPaypalWithdrawService,
  withdrawRequestService,
  getAllWithdrawService,
  singleWithdrawService,
  adminPaidBankWithdrawService,
  getAllWithdrawBybusinessService,
  deleteSingleWithdrawService,
};
