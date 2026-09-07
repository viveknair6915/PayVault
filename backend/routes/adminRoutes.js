const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getAllPayments,
  getAdminStats,
} = require('../controllers/adminController');
const { authenticateUser } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/requireAdmin');

// All admin routes require authentication and admin role
router.use(authenticateUser, requireAdmin);

router.get('/users', getAllUsers);
router.get('/payments', getAllPayments);
router.get('/stats', getAdminStats);

module.exports = router;
