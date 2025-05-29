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
exports.reportService = void 0;
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const report_model_1 = __importDefault(require("./report.model"));
const addReportService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield report_model_1.default.create(payload);
    return result;
});
const getAllReportsByAdminQuery = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const reviewQuery = new QueryBuilder_1.default(report_model_1.default.find({}).populate('taskerId'), query)
        .search([''])
        .filter()
        .sort()
        // .paginate()
        .fields();
    const result = yield reviewQuery.modelQuery;
    const meta = yield reviewQuery.countTotal();
    return { meta, result };
});
const getAllReportsByTaskerQuery = (query, taskerId) => __awaiter(void 0, void 0, void 0, function* () {
    const reviewQuery = new QueryBuilder_1.default(report_model_1.default.find({ taskerId }).populate('taskerId'), query)
        .search([''])
        .filter()
        .sort()
        // .paginate()
        .fields();
    const result = yield reviewQuery.modelQuery;
    const meta = yield reviewQuery.countTotal();
    return { meta, result };
});
exports.reportService = {
    addReportService,
    getAllReportsByAdminQuery,
    getAllReportsByTaskerQuery,
};
