const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    paymentType: {
      type: String,
      required: [true, 'Payment type is required'],
      enum: {
        values: ['Bank', 'Paytm', 'UPI', 'PayPal', 'USDT'],
        message: '{VALUE} is not a supported payment type',
      },
      index: true,
    },
    // Bank specific fields
    ifscCode: {
      type: String,
      trim: true,
      uppercase: true,
      index: true,
    },
    branchName: {
      type: String,
      trim: true,
    },
    bankName: {
      type: String,
      trim: true,
      index: true,
    },
    accountNumber: {
      type: String,
      trim: true,
      index: true,
    },
    accountHolderName: {
      type: String,
      trim: true,
    },

    // Paytm specific field
    paytmNumber: {
      type: String,
      trim: true,
      index: true,
    },

    // UPI specific field
    upiId: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },

    // PayPal specific field
    paypalEmail: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },

    // USDT specific field
    usdtAddress: {
      type: String,
      trim: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Clean up irrelevant fields strictly before validation & saving
paymentSchema.pre('validate', function (next) {
  const type = this.paymentType;

  if (type === 'Bank') {
    this.paytmNumber = undefined;
    this.upiId = undefined;
    this.paypalEmail = undefined;
    this.usdtAddress = undefined;
  } else if (type === 'Paytm') {
    this.ifscCode = undefined;
    this.branchName = undefined;
    this.bankName = undefined;
    this.accountNumber = undefined;
    this.accountHolderName = undefined;
    this.upiId = undefined;
    this.paypalEmail = undefined;
    this.usdtAddress = undefined;
  } else if (type === 'UPI') {
    this.ifscCode = undefined;
    this.branchName = undefined;
    this.bankName = undefined;
    this.accountNumber = undefined;
    this.accountHolderName = undefined;
    this.paytmNumber = undefined;
    this.paypalEmail = undefined;
    this.usdtAddress = undefined;
  } else if (type === 'PayPal') {
    this.ifscCode = undefined;
    this.branchName = undefined;
    this.bankName = undefined;
    this.accountNumber = undefined;
    this.accountHolderName = undefined;
    this.paytmNumber = undefined;
    this.upiId = undefined;
    this.usdtAddress = undefined;
  } else if (type === 'USDT') {
    this.ifscCode = undefined;
    this.branchName = undefined;
    this.bankName = undefined;
    this.accountNumber = undefined;
    this.accountHolderName = undefined;
    this.paytmNumber = undefined;
    this.upiId = undefined;
    this.paypalEmail = undefined;
  }

  next();
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
