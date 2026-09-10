const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Payment = require('../models/Payment');

const TEST_DB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/payvault_test';

describe('PayVault API Test Suite', () => {
  let userAToken;
  let userAId;
  let userBToken;
  let userBId;
  let adminToken;
  let samplePaymentId;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(TEST_DB_URI);
    }
    // Clean up test collections
    await User.deleteMany({});
    await Payment.deleteMany({});

    // Create User A
    const resA = await request(app).post('/api/auth/register').send({
      username: 'User Alpha',
      email: 'alpha@test.com',
      password: 'Password@123',
    });
    userAToken = resA.body.token;
    userAId = resA.body.user._id;

    // Create User B
    const resB = await request(app).post('/api/auth/register').send({
      username: 'User Beta',
      email: 'beta@test.com',
      password: 'Password@123',
    });
    userBToken = resB.body.token;
    userBId = resB.body.user._id;

    // Create Admin User
    const adminUser = await User.create({
      username: 'Admin Test',
      email: 'admintest@payvault.com',
      password: 'AdminPassword@123',
      role: 'admin',
    });

    const resAdmin = await request(app).post('/api/auth/login').send({
      email: 'admintest@payvault.com',
      password: 'AdminPassword@123',
    });
    adminToken = resAdmin.body.token;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Payment.deleteMany({});
    await mongoose.connection.close();
  });

  describe('1. Authentication & Authorization', () => {
    it('should reject duplicate email registration', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: 'Duplicate Alpha',
        email: 'alpha@test.com',
        password: 'Password@123',
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject registration with invalid email', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: 'Bad Email',
        email: 'bademail-no-at-sign',
        password: 'Password@123',
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject registration with short password', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: 'Short Pass',
        email: 'short@test.com',
        password: '123',
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should login successfully with correct credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'alpha@test.com',
        password: 'Password@123',
      });
      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('alpha@test.com');
      expect(res.body.user.password).toBeUndefined();
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'alpha@test.com',
        password: 'WrongPassword',
      });
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should fetch logged-in user profile via /api/auth/me', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${userAToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.user.username).toBe('User Alpha');
    });

    it('should reject unauthenticated request without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
    });

    it('should reject Google sign-in without a verified ID token', async () => {
      const res = await request(app).post('/api/auth/google').send({
        email: 'attacker@example.com',
        username: 'Attacker',
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('2. Payment Validation & Creation', () => {
    it('should add a Bank payment with valid fields', async () => {
      const res = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          paymentType: 'Bank',
          bankName: 'HDFC Bank',
          branchName: 'Indiranagar',
          accountHolderName: 'User Alpha',
          accountNumber: '123456789012',
          ifscCode: 'HDFC0001234',
        });
      expect(res.statusCode).toBe(201);
      expect(res.body.data.paymentType).toBe('Bank');
      expect(res.body.data.bankName).toBe('HDFC Bank');
      samplePaymentId = res.body.data._id;
    });

    it('should reject Bank payment with invalid IFSC code', async () => {
      const res = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          paymentType: 'Bank',
          bankName: 'HDFC Bank',
          branchName: 'Indiranagar',
          accountHolderName: 'User Alpha',
          accountNumber: '123456789012',
          ifscCode: 'INVALIDIFSC',
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.errors.ifscCode).toBeDefined();
    });

    it('should add a UPI payment with valid upiId', async () => {
      const res = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          paymentType: 'UPI',
          upiId: 'alpha@okaxis',
        });
      expect(res.statusCode).toBe(201);
      expect(res.body.data.upiId).toBe('alpha@okaxis');
    });

    it('should reject UPI payment with invalid format', async () => {
      const res = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          paymentType: 'UPI',
          upiId: 'invalid-upi-no-bank',
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.errors.upiId).toBeDefined();
    });

    it('should add a Paytm payment with valid phone', async () => {
      const res = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          paymentType: 'Paytm',
          paytmNumber: '9876543210',
        });
      expect(res.statusCode).toBe(201);
      expect(res.body.data.paytmNumber).toBe('9876543210');
    });

    it('should add a PayPal payment with valid email', async () => {
      const res = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          paymentType: 'PayPal',
          paypalEmail: 'alpha.paypal@test.com',
        });
      expect(res.statusCode).toBe(201);
      expect(res.body.data.paypalEmail).toBe('alpha.paypal@test.com');
    });

    it('should add a USDT payment with valid wallet address', async () => {
      const res = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          paymentType: 'USDT',
          usdtAddress: '0x8a9e7F9B22D5d90EeE7f121C75f9bbF9B55072Ba',
        });
      expect(res.statusCode).toBe(201);
      expect(res.body.data.usdtAddress).toBe('0x8a9e7F9B22D5d90EeE7f121C75f9bbF9B55072Ba');
    });
  });

  describe('3. Payment Retrieval, Update & Type Changing', () => {
    it('should list only logged-in user payments', async () => {
      const res = await request(app)
        .get('/api/payments')
        .set('Authorization', `Bearer ${userAToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.count).toBe(5);
    });

    it('should get a single payment by ID', async () => {
      const res = await request(app)
        .get(`/api/payments/${samplePaymentId}`)
        .set('Authorization', `Bearer ${userAToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.bankName).toBe('HDFC Bank');
    });

    it('should update payment details and purge obsolete fields when type changes', async () => {
      // Change from Bank to UPI
      const res = await request(app)
        .put(`/api/payments/${samplePaymentId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          paymentType: 'UPI',
          upiId: 'converted@upi',
        });
      expect(res.statusCode).toBe(200);
      expect(res.body.data.paymentType).toBe('UPI');
      expect(res.body.data.upiId).toBe('converted@upi');
      expect(res.body.data.bankName).toBeUndefined();
      expect(res.body.data.accountNumber).toBeUndefined();
    });
  });

  describe('4. IDOR / Authorization Security', () => {
    it('should prevent User B from reading User A payment (IDOR protection)', async () => {
      const res = await request(app)
        .get(`/api/payments/${samplePaymentId}`)
        .set('Authorization', `Bearer ${userBToken}`);
      expect(res.statusCode).toBe(403);
    });

    it('should prevent User B from updating User A payment', async () => {
      const res = await request(app)
        .put(`/api/payments/${samplePaymentId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({
          paymentType: 'UPI',
          upiId: 'hacked@upi',
        });
      expect(res.statusCode).toBe(403);
    });

    it('should prevent User B from deleting User A payment', async () => {
      const res = await request(app)
        .delete(`/api/payments/${samplePaymentId}`)
        .set('Authorization', `Bearer ${userBToken}`);
      expect(res.statusCode).toBe(403);
    });

    it('should allow User A to delete their own payment', async () => {
      const res = await request(app)
        .delete(`/api/payments/${samplePaymentId}`)
        .set('Authorization', `Bearer ${userAToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('5. Admin Authorization & Features', () => {
    it('should reject normal user from accessing admin endpoints (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${userAToken}`);
      expect(res.statusCode).toBe(403);
    });

    it('should allow admin to view all users', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.count).toBeGreaterThanOrEqual(2);
    });

    it('should allow admin to view payments with pagination and search', async () => {
      const res = await request(app)
        .get('/api/admin/payments?page=1&limit=10&search=alpha')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.pagination).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should allow admin to get stats breakdown', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.stats.totalUsers).toBeDefined();
      expect(res.body.stats.breakdown).toBeDefined();
    });

    it('should reject an unconfigured production CORS origin', async () => {
      const originalNodeEnv = process.env.NODE_ENV;
      const originalClientUrl = process.env.CLIENT_URL;
      process.env.NODE_ENV = 'production';
      process.env.CLIENT_URL = 'https://payvault.example.com';

      const res = await request(app)
        .get('/api/health')
        .set('Origin', 'https://evil.example.com');

      process.env.NODE_ENV = originalNodeEnv;
      process.env.CLIENT_URL = originalClientUrl;

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toContain('CORS policy');
    });
  });
});
