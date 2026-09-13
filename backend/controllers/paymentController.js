const Payment = require('../models/Payment');
const { validatePaymentInput } = require('../validators/paymentValidator');
const { encrypt, blindIndex } = require('../utils/paymentCrypto');

const protectedFields = ['accountNumber', 'paytmNumber', 'upiId', 'paypalEmail', 'usdtAddress'];

const protectPaymentData = (data) => {
  const protectedData = { ...data };
  protectedFields.forEach((field) => {
    if (protectedData[field] !== undefined) {
      protectedData[`${field}Index`] = blindIndex(protectedData[field]);
      protectedData[field] = encrypt(protectedData[field]);
    }
  });
  return protectedData;
};

const createPayment = async (req, res, next) => {
  try {
    const { isValid, errors, cleanData } = validatePaymentInput(req.body);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed. Please correct the highlighted errors.',
        errors,
      });
    }

    const payment = new Payment({
      user: req.user._id,
      ...protectPaymentData(cleanData),
    });

    const savedPayment = await payment.save();

    res.status(201).json({
      success: true,
      message: `${savedPayment.paymentType} payment method added successfully.`,
      data: savedPayment,
    });
  } catch (error) {
    next(error);
  }
};

const getPayments = async (req, res, next) => {
  try {
    const query = { user: req.user._id };
    if (req.query.paymentType) {
      query.paymentType = req.query.paymentType;
    }

    const payments = await Payment.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

const getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found.',
      });
    }

    if (payment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to view this payment method.',
      });
    }

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

const updatePayment = async (req, res, next) => {
  try {
    const existingPayment = await Payment.findById(req.params.id);

    if (!existingPayment) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found.',
      });
    }

    if (existingPayment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to edit this payment method.',
      });
    }

    const { isValid, errors, cleanData } = validatePaymentInput(req.body);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed. Please correct the highlighted errors.',
        errors,
      });
    }

    existingPayment.ifscCode = undefined;
    existingPayment.branchName = undefined;
    existingPayment.bankName = undefined;
    existingPayment.accountNumber = undefined;
    existingPayment.accountHolderName = undefined;
    existingPayment.paytmNumber = undefined;
    existingPayment.upiId = undefined;
    existingPayment.paypalEmail = undefined;
    existingPayment.usdtAddress = undefined;
    existingPayment.accountNumberIndex = undefined;
    existingPayment.paytmNumberIndex = undefined;
    existingPayment.upiIdIndex = undefined;
    existingPayment.paypalEmailIndex = undefined;
    existingPayment.usdtAddressIndex = undefined;

    existingPayment.paymentType = cleanData.paymentType;
    const protectedData = protectPaymentData(cleanData);
    Object.keys(protectedData).forEach((key) => {
      existingPayment[key] = protectedData[key];
    });

    const updatedPayment = await existingPayment.save();

    res.status(200).json({
      success: true,
      message: 'Payment method updated successfully.',
      data: updatedPayment,
    });
  } catch (error) {
    next(error);
  }
};

const deletePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found.',
      });
    }

    if (payment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to delete this payment method.',
      });
    }

    await Payment.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Payment method deleted successfully.',
      id: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPayment,
  getPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
};
