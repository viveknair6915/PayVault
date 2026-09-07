const User = require('../models/User');
const Payment = require('../models/Payment');

// @desc    Get all users with their payment counts
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    // Aggregate payment counts per user
    const paymentCounts = await Payment.aggregate([
      {
        $group: {
          _id: '$user',
          total: { $sum: 1 },
          types: { $addToSet: '$paymentType' },
        },
      },
    ]);

    const countMap = {};
    paymentCounts.forEach((item) => {
      countMap[item._id.toString()] = {
        total: item.total,
        types: item.types,
      };
    });

    const usersWithStats = users.map((user) => {
      const stats = countMap[user._id.toString()] || { total: 0, types: [] };
      return {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        totalPayments: stats.total,
        paymentTypes: stats.types,
      };
    });

    res.status(200).json({
      success: true,
      count: usersWithStats.length,
      data: usersWithStats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all payments with search, filters, and pagination
// @route   GET /api/admin/payments
// @access  Private/Admin
const getAllPayments = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const {
      search,
      paymentType,
      bankName,
      ifscCode,
      paytmNumber,
      upiId,
      paypalEmail,
      usdtAddress,
    } = req.query;

    const filterConditions = [];

    // Type filter
    if (paymentType && paymentType !== 'All') {
      filterConditions.push({ paymentType });
    }

    // Specific field filters
    if (bankName) {
      filterConditions.push({ bankName: { $regex: bankName, $options: 'i' } });
    }
    if (ifscCode) {
      filterConditions.push({ ifscCode: { $regex: ifscCode, $options: 'i' } });
    }
    if (paytmNumber) {
      filterConditions.push({ paytmNumber: { $regex: paytmNumber, $options: 'i' } });
    }
    if (upiId) {
      filterConditions.push({ upiId: { $regex: upiId, $options: 'i' } });
    }
    if (paypalEmail) {
      filterConditions.push({ paypalEmail: { $regex: paypalEmail, $options: 'i' } });
    }
    if (usdtAddress) {
      filterConditions.push({ usdtAddress: { $regex: usdtAddress, $options: 'i' } });
    }

    // Comprehensive global search
    if (search && search.trim()) {
      const searchTerm = search.trim();
      const searchRegex = { $regex: searchTerm, $options: 'i' };

      // Find user IDs that match username or email
      const matchingUsers = await User.find({
        $or: [{ username: searchRegex }, { email: searchRegex }],
      }).select('_id');

      const userIds = matchingUsers.map((u) => u._id);

      filterConditions.push({
        $or: [
          { user: { $in: userIds } },
          { bankName: searchRegex },
          { branchName: searchRegex },
          { accountHolderName: searchRegex },
          { ifscCode: searchRegex },
          { accountNumber: searchRegex },
          { paytmNumber: searchRegex },
          { upiId: searchRegex },
          { paypalEmail: searchRegex },
          { usdtAddress: searchRegex },
        ],
      });
    }

    const finalQuery = filterConditions.length > 0 ? { $and: filterConditions } : {};

    const total = await Payment.countDocuments(finalQuery);
    const payments = await Payment.find(finalQuery)
      .populate('user', 'username email role createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1,
      },
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard metrics / stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalPayments = await Payment.countDocuments();

    const typeBreakdown = await Payment.aggregate([
      {
        $group: {
          _id: '$paymentType',
          count: { $sum: 1 },
        },
      },
    ]);

    const breakdown = {
      Bank: 0,
      Paytm: 0,
      UPI: 0,
      PayPal: 0,
      USDT: 0,
    };

    typeBreakdown.forEach((item) => {
      if (item._id) {
        breakdown[item._id] = item.count;
      }
    });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalPayments,
        breakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getAllPayments,
  getAdminStats,
};
