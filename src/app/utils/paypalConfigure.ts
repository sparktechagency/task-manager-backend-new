// const paypal = require('paypal-rest-sdk');
import paypal from 'paypal-rest-sdk';

paypal.configure({
  mode: 'sandbox', // Change to 'live' for production
  client_id: 'YOUR_PAYPAL_CLIENT_ID',
  client_secret: 'YOUR_PAYPAL_CLIENT_SECRET',
});

module.exports = paypal;
