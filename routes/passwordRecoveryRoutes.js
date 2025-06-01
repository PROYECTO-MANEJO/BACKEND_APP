const express = require('express');
const { forgotPassword, resetPassword, verifyResetToken } = require('../controllers/passwordRecoveryController');

const router = express.Router();

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-reset-token', verifyResetToken);

module.exports = router;