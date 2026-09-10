const crypto = require('crypto');

const ENCRYPTED_PREFIX = 'v1';
const TEST_KEY = crypto.createHash('sha256').update('payvault-test-only-encryption-key').digest();

const getKey = (keyValue = process.env.PAYMENT_ENCRYPTION_KEY) => {
  if (keyValue) {
    const key = Buffer.from(keyValue, 'hex');
    if (key.length !== 32) {
      throw new Error('PAYMENT_ENCRYPTION_KEY must be a 64-character hexadecimal value.');
    }
    return key;
  }

  if (process.env.NODE_ENV === 'test') return TEST_KEY;
  throw new Error('PAYMENT_ENCRYPTION_KEY is not configured.');
};

const isEncrypted = (value) => typeof value === 'string' && value.startsWith(`${ENCRYPTED_PREFIX}:`);

const encrypt = (value) => {
  if (value === undefined || value === null || isEncrypted(value)) return value;

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [ENCRYPTED_PREFIX, iv.toString('base64url'), tag.toString('base64url'), ciphertext.toString('base64url')].join(':');
};

const decrypt = (value, keyValue) => {
  if (!isEncrypted(value)) return value;

  const [, ivValue, tagValue, ciphertextValue] = value.split(':');
  const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(keyValue), Buffer.from(ivValue, 'base64url'));
  decipher.setAuthTag(Buffer.from(tagValue, 'base64url'));
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextValue, 'base64url')),
    decipher.final(),
  ]).toString('utf8');
};

const blindIndex = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  return crypto.createHmac('sha256', getKey()).update(String(value).trim().toLowerCase()).digest('hex');
};

module.exports = {
  encrypt,
  decrypt,
  blindIndex,
  isEncrypted,
};
