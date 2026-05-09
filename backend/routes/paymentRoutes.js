const express = require('express');
const router = express.Router();
const { createCheckoutSession, verifySessionAndBook } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/create-checkout-session', protect, createCheckoutSession);
router.post('/verify-session', protect, verifySessionAndBook);

module.exports = router;
