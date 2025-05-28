import QueryBuilder from '../../builder/QueryBuilder';
import { TReport } from './report.interface';
import Report from './report.model';

const addReportService = async (payload: TReport) => {
  const result = await Report.create(payload);

  return result;
};


const getAllReportsByAdminQuery = async (
    query: Record<string, unknown>,
) => {
  const reviewQuery = new QueryBuilder(
    Report.find({}).populate('taskerId'),
    query
  )
    .search([''])
    .filter()
    .sort()
    // .paginate()
    .fields();

  const result = await reviewQuery.modelQuery;
  const meta = await reviewQuery.countTotal();
  return { meta, result };
};

const getAllReportsByTaskerQuery = async (
  query: Record<string, unknown>,
  taskerId:string,
) => {
  const reviewQuery = new QueryBuilder(
    Report.find({ taskerId }).populate('taskerId'),
    query,
  )
    .search([''])
    .filter()
    .sort()
    // .paginate()
    .fields();

  const result = await reviewQuery.modelQuery;
  const meta = await reviewQuery.countTotal();
  return { meta, result };
};


export const reportService = {
  addReportService,
  getAllReportsByAdminQuery,
  getAllReportsByTaskerQuery,
};
