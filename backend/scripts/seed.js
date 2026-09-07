const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const User = require('../models/User');
const Payment = require('../models/Payment');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/payvault';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for database seeding...');

    // 1. Seed Administrator
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@payvault.com').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';
    const adminUsername = process.env.ADMIN_USERNAME || 'PayVaultAdmin';

    let adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      adminUser = await User.create({
        username: adminUsername,
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
      });
      console.log(`✅ Admin account created: ${adminEmail}`);
    } else {
      adminUser.role = 'admin';
      await adminUser.save();
      console.log(`ℹ️ Admin account already exists: ${adminEmail}`);
    }

    // Helper to seed a user and their payment methods
    const seedUserWithPayments = async (userData, paymentsList) => {
      let user = await User.findOne({ email: userData.email });
      if (!user) {
        user = await User.create({
          username: userData.username,
          email: userData.email,
          password: userData.password,
          role: 'user',
        });
        console.log(`✅ User created: ${userData.email}`);
      }

      const existing = await Payment.countDocuments({ user: user._id });
      if (existing === 0 && paymentsList.length > 0) {
        const toInsert = paymentsList.map((p) => ({ ...p, user: user._id }));
        await Payment.create(toInsert);
        console.log(`✅ Seeded ${paymentsList.length} payments for ${userData.email}`);
      }
      return user;
    };

    // 2. Seed Vivek Nair (Demo User - All 5 types)
    await seedUserWithPayments(
      { username: 'Vivek Nair', email: 'demo@payvault.com', password: 'User@12345' },
      [
        {
          paymentType: 'Bank',
          bankName: 'HDFC Bank',
          branchName: 'Koramangala, Bangalore',
          accountHolderName: 'Vivek Nair',
          accountNumber: '501002348912',
          ifscCode: 'HDFC0001234',
        },
        {
          paymentType: 'UPI',
          upiId: 'viveknair@okhdfcbank',
        },
        {
          paymentType: 'Paytm',
          paytmNumber: '9876543210',
        },
        {
          paymentType: 'PayPal',
          paypalEmail: 'vivek.nair@example.com',
        },
        {
          paymentType: 'USDT',
          usdtAddress: '0x8a9e7F9B22D5d90EeE7f121C75f9bbF9B55072Ba',
        },
      ]
    );

    // 3. Seed Rahul Sharma (Bank & UPI)
    await seedUserWithPayments(
      { username: 'Rahul Sharma', email: 'rahul@payvault.com', password: 'User@12345' },
      [
        {
          paymentType: 'Bank',
          bankName: 'ICICI Bank',
          branchName: 'Cyber City, Gurugram',
          accountHolderName: 'Rahul Sharma',
          accountNumber: '025405006735',
          ifscCode: 'ICIC0000254',
        },
        {
          paymentType: 'UPI',
          upiId: 'rahulsharma@icici',
        },
      ]
    );

    // Remove Priya Patel and Amit Verma if previously seeded
    const removedUsers = await User.find({ email: { $in: ['priya@payvault.com', 'amit@payvault.com'] } });
    if (removedUsers.length > 0) {
      const removedIds = removedUsers.map((u) => u._id);
      await Payment.deleteMany({ user: { $in: removedIds } });
      await User.deleteMany({ _id: { $in: removedIds } });
      console.log('🧹 Cleaned up old demo accounts (Priya Patel, Amit Verma).');
    }

    console.log('\n===========================================');
    console.log('🎉 Database seeding completed successfully!');
    console.log('Demo Credentials for evaluation:');
    console.log(`👑 Admin User  : ${adminEmail} / ${adminPassword}`);
    console.log(`👤 Vivek Nair : demo@payvault.com / User@12345 (5 Methods)`);
    console.log(`👤 Rahul Sharma: rahul@payvault.com / User@12345 (Bank & UPI)`);
    console.log('===========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedData();
