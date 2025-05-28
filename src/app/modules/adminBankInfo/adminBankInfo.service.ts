
import { Types } from 'mongoose';
import AppError from '../../error/AppError';
import { TAdminBankInfo } from './adminBankInfo.interface';
import { BankInfo } from './adminBankInfo.model';

const addBankAcountService = async (payload: TAdminBankInfo) => {
    console.log('payload', payload);
  if (!payload.adminId) {
    throw new AppError(400, 'User ID is required!');
  }

  if (!Types.ObjectId.isValid(payload.adminId)) {
    throw new AppError(400, 'Invalid User ID format!');
  }

  if (!payload.bankName || !payload.accountNumber || !payload.routingNumber) {
    throw new AppError(
      400,
      'Bank name, account number, and SWIFT code are required!',
    );
  }

  const existingBankInfo = await BankInfo.findOne({ adminId: payload.adminId });

  if (existingBankInfo) {
    const updatedBankInfo = await BankInfo.findOneAndUpdate(
      { adminId: payload.adminId },
      { $set: payload },
      { new: true },
    );

    return updatedBankInfo;

  }else{

    const result = await BankInfo.create(payload);
    return result;
  }

//   const updatedBankInfo = await BankInfo.findOneAndUpdate(
//     { adminId: payload.adminId },
//     { $set: payload }, 
//     { new: true }, 
//   );

 
//   return updatedBankInfo;
};


const getBankAcountService = async () => {

  const result = await BankInfo.findOne({});

  return result;
};



const updateBankAcountService = async (payload: TAdminBankInfo) => {
  console.log('payload ------>', payload);
  const result = await BankInfo.findOneAndUpdate(
    {  },
    { $set: payload },
    { new: true },
  )

  return result;
};




export const bankService = {
  addBankAcountService,
  getBankAcountService,
  updateBankAcountService,
};
