const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const { decrypt, encrypt, blindIndex, isEncrypted } = require('../utils/paymentCrypto');

const protectedFields = ['accountNumber', 'paytmNumber', 'upiId', 'paypalEmail', 'usdtAddress'];
const oldEncryptionKey = process.env.PAYMENT_ENCRYPTION_OLD_KEY;

const migratePayments = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/payvault');
    const payments = await Payment.find().select('+accountNumberIndex +paytmNumberIndex +upiIdIndex +paypalEmailIndex +usdtAddressIndex');
    let migrated = 0;

    for (const payment of payments) {
      const update = {};
      protectedFields.forEach((field) => {
        const value = payment[field];
        if (value) {
          const plaintext = isEncrypted(value) ? decrypt(value, oldEncryptionKey) : value;
          update[field] = encrypt(plaintext);
          update[`${field}Index`] = blindIndex(plaintext);
        }
      });

      if (Object.keys(update).length > 0) {
        await Payment.updateOne({ _id: payment._id }, { $set: update });
        migrated += 1;
      }
    }

    console.log(`Encrypted ${migrated} payment records.`);
    await mongoose.disconnect();
  } catch (error) {
    console.error(`Payment encryption migration failed: ${error.message}`);
    await mongoose.disconnect().catch(() => {});
    process.exitCode = 1;
  }
};

migratePayments();
