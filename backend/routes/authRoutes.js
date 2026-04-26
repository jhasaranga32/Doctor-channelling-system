const express = require('express');
const router = express.Router();
const {
  registerPatient, login, getMe, updateProfile, changePassword, logout,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  patientRegisterRules, loginRules, updateProfileRules, changePasswordRules, validate,
} = require('../middleware/validators');

// Public routes
router.post('/register', patientRegisterRules, validate, registerPatient);
router.post('/login', loginRules, validate, login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfileRules, validate, updateProfile);
router.put('/change-password', protect, changePasswordRules, validate, changePassword);
router.post('/logout', protect, logout);

module.exports = router;
