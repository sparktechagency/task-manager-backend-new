"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const payment_controller_1 = require("./payment.controller");
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constants_1 = require("../user/user.constants");
// import { auth } from "../../middlewares/auth.js";
const paymentRouter = express_1.default.Router();
paymentRouter
    .post('/add-payment', (0, auth_1.default)(user_constants_1.USER_ROLE.POSTER), payment_controller_1.paymentController.addPayment)
    .post('/create-stripe-account', (0, auth_1.default)(user_constants_1.USER_ROLE.POSTER), payment_controller_1.paymentController.createStripeAccount)
    .post('/transfer', (0, auth_1.default)(user_constants_1.USER_ROLE.POSTER), payment_controller_1.paymentController.transferBalance)
    //   .post(
    //   '/checkout',
    //   auth(USER_ROLE.CUSTOMER),
    //   paymentController.createCheckout,
    // )
    .post('/refund', payment_controller_1.paymentController.paymentRefund)
    .get('/success', payment_controller_1.paymentController.successPage)
    .get('/cancel', payment_controller_1.paymentController.cancelPage)
    .get('/', (0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN), payment_controller_1.paymentController.getAllPayment)
    .get('/poster', (0, auth_1.default)(user_constants_1.USER_ROLE.POSTER), payment_controller_1.paymentController.getAllPaymentByPoster)
    .get('/all-income-rasio', payment_controller_1.paymentController.getAllIncomeRasio)
    .get('/all-income-rasio-by-days', payment_controller_1.paymentController.getAllIncomeRasioBy7days)
    .get('/all-earning-rasio', (0, auth_1.default)(user_constants_1.USER_ROLE.POSTER), payment_controller_1.paymentController.getAllEarningRasio)
    .get('/all-earning-by-payment-method', (0, auth_1.default)(user_constants_1.USER_ROLE.POSTER), payment_controller_1.paymentController.getAllEarningByPaymentMethod)
    .get('/available-withdraw-earning', (0, auth_1.default)(user_constants_1.USER_ROLE.POSTER), payment_controller_1.paymentController.getAllWithdrawEarningByPaymentMethod)
    .get('/customer', (0, auth_1.default)(user_constants_1.USER_ROLE.POSTER), payment_controller_1.paymentController.getAllPaymentByCustormer)
    .get('/refreshAccountConnect/:id', payment_controller_1.paymentController.refreshAccountConnect)
    .get('/:id', payment_controller_1.paymentController.getSinglePayment)
    .get('/success-account/:id', payment_controller_1.paymentController.successPageAccount)
    .delete('/:id', payment_controller_1.paymentController.deleteSinglePayment);
exports.default = paymentRouter;
