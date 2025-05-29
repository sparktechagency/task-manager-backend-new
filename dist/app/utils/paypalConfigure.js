"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const paypal = require('paypal-rest-sdk');
const paypal_rest_sdk_1 = __importDefault(require("paypal-rest-sdk"));
paypal_rest_sdk_1.default.configure({
    mode: 'sandbox', // Change to 'live' for production
    client_id: 'YOUR_PAYPAL_CLIENT_ID',
    client_secret: 'YOUR_PAYPAL_CLIENT_SECRET',
});
module.exports = paypal_rest_sdk_1.default;
