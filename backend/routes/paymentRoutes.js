const express = require('express');
const router = express.Router();
const {
  createPayment,
  getPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
} = require('../controllers/paymentController');
const { authenticateUser } = require('../middleware/auth');

// All payment routes require authentication
router.use(authenticateUser);

router.route('/')
  .post(createPayment)
  .get(getPayments);

router.route('/:id')
  .get(getPaymentById)
  .put(updatePayment)
  .delete(deletePayment);

module.exports = router;
