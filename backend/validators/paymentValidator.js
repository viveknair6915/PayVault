// Regex patterns for validation
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const ACCOUNT_NUMBER_REGEX = /^\d{9,18}$/;
const PAYTM_PHONE_REGEX = /^(?:\+91|91|0)?[6-9]\d{9}$/;
const UPI_ID_REGEX = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z0-9.\-_]{2,64}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USDT_ADDRESS_REGEX = /^(?:0x[a-fA-F0-9]{40}|T[A-Za-z1-9]{33}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})$/;

/**
 * Validates payment payload according to paymentType.
 * Returns { isValid: boolean, errors: Object, cleanData: Object }
 */
const validatePaymentInput = (data) => {
  const errors = {};
  const { paymentType } = data;

  const validTypes = ['Bank', 'Paytm', 'UPI', 'PayPal', 'USDT'];
  if (!paymentType || !validTypes.includes(paymentType)) {
    return {
      isValid: false,
      errors: { paymentType: 'A valid payment type (Bank, Paytm, UPI, PayPal, USDT) is required.' },
      cleanData: {},
    };
  }

  const cleanData = { paymentType };

  if (paymentType === 'Bank') {
    const { ifscCode, branchName, bankName, accountNumber, accountHolderName } = data;

    if (!bankName || !bankName.trim()) {
      errors.bankName = 'Bank name is required.';
    } else {
      cleanData.bankName = bankName.trim();
    }

    if (!branchName || !branchName.trim()) {
      errors.branchName = 'Branch name is required.';
    } else {
      cleanData.branchName = branchName.trim();
    }

    if (!accountHolderName || !accountHolderName.trim()) {
      errors.accountHolderName = 'Account holder name is required.';
    } else {
      cleanData.accountHolderName = accountHolderName.trim();
    }

    if (!accountNumber || !accountNumber.toString().trim()) {
      errors.accountNumber = 'Account number is required.';
    } else {
      const cleanAcc = accountNumber.toString().trim();
      if (!ACCOUNT_NUMBER_REGEX.test(cleanAcc)) {
        errors.accountNumber = 'Account number must be 9 to 18 digits.';
      } else {
        cleanData.accountNumber = cleanAcc;
      }
    }

    if (!ifscCode || !ifscCode.trim()) {
      errors.ifscCode = 'IFSC code is required.';
    } else {
      const cleanIFSC = ifscCode.trim().toUpperCase();
      if (!IFSC_REGEX.test(cleanIFSC)) {
        errors.ifscCode = 'Invalid IFSC code format (e.g. HDFC0001234, 11 alphanumeric characters).';
      } else {
        cleanData.ifscCode = cleanIFSC;
      }
    }
  } else if (paymentType === 'Paytm') {
    const { paytmNumber } = data;
    if (!paytmNumber || !paytmNumber.toString().trim()) {
      errors.paytmNumber = 'Paytm mobile number is required.';
    } else {
      const cleanNumber = paytmNumber.toString().trim();
      if (!PAYTM_PHONE_REGEX.test(cleanNumber)) {
        errors.paytmNumber = 'Enter a valid 10-digit mobile number (with optional +91 or 0 prefix).';
      } else {
        cleanData.paytmNumber = cleanNumber;
      }
    }
  } else if (paymentType === 'UPI') {
    const { upiId } = data;
    if (!upiId || !upiId.trim()) {
      errors.upiId = 'UPI ID is required.';
    } else {
      const cleanUpi = upiId.trim().toLowerCase();
      if (!UPI_ID_REGEX.test(cleanUpi)) {
        errors.upiId = 'Invalid UPI ID format (e.g. username@bank or mobile@upi).';
      } else {
        cleanData.upiId = cleanUpi;
      }
    }
  } else if (paymentType === 'PayPal') {
    const { paypalEmail } = data;
    if (!paypalEmail || !paypalEmail.trim()) {
      errors.paypalEmail = 'PayPal email address is required.';
    } else {
      const cleanEmail = paypalEmail.trim().toLowerCase();
      if (!EMAIL_REGEX.test(cleanEmail)) {
        errors.paypalEmail = 'Enter a valid PayPal email address.';
      } else {
        cleanData.paypalEmail = cleanEmail;
      }
    }
  } else if (paymentType === 'USDT') {
    const { usdtAddress } = data;
    if (!usdtAddress || !usdtAddress.trim()) {
      errors.usdtAddress = 'USDT wallet address is required.';
    } else {
      const cleanAddress = usdtAddress.trim();
      if (cleanAddress.length < 24 || cleanAddress.length > 70) {
        errors.usdtAddress = 'USDT wallet address length is invalid (TRC20, ERC20, or BEP20).';
      } else if (!USDT_ADDRESS_REGEX.test(cleanAddress)) {
        errors.usdtAddress = 'Invalid USDT wallet address format (TRC20 starting with T, or ERC20/BEP20 starting with 0x).';
      } else {
        cleanData.usdtAddress = cleanAddress;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    cleanData,
  };
};

module.exports = {
  validatePaymentInput,
  IFSC_REGEX,
  ACCOUNT_NUMBER_REGEX,
  PAYTM_PHONE_REGEX,
  UPI_ID_REGEX,
  EMAIL_REGEX,
  USDT_ADDRESS_REGEX,
};
