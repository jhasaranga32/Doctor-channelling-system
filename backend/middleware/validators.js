const { body, validationResult } = require('express-validator');

// Handle validation results
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }
  next();
};

// Patient registration validation
exports.patientRegisterRules = [
  body('firstName').trim().notEmpty().withMessage('First name is required').isLength({ max: 50 }),
  body('lastName').trim().notEmpty().withMessage('Last name is required').isLength({ max: 50 }),
  body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional().isMobilePhone().withMessage('Please enter a valid phone number'),
  body('patientDetails.dateOfBirth').optional().isISO8601().withMessage('Invalid date format'),
  body('patientDetails.gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  body('patientDetails.bloodGroup').optional().isIn(['A+','A-','B+','B-','AB+','AB-','O+','O-']).withMessage('Invalid blood group'),
];

// Login validation
exports.loginRules = [
  body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// Doctor creation validation
exports.doctorCreateRules = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('doctorDetails.specialization').notEmpty().withMessage('Specialization is required'),
  body('doctorDetails.licenseNumber').notEmpty().withMessage('License number is required'),
  body('doctorDetails.consultationFee').isNumeric().withMessage('Consultation fee must be a number'),
];

// Staff creation validation
exports.staffCreateRules = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('staffDetails.position').notEmpty().withMessage('Position is required'),
  body('staffDetails.department').notEmpty().withMessage('Department is required'),
];

// Update profile validation
exports.updateProfileRules = [
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('phone').optional().isMobilePhone().withMessage('Please enter a valid phone number'),
];

// Change password validation
exports.changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
];
