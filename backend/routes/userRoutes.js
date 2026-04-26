const express = require('express');
const router = express.Router();
const {
  getAllUsers, getUserById, createDoctor, createStaff, createAdmin,
  updateUser, toggleUserStatus, deleteUser, getUserStats, getPublicDoctors,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const { doctorCreateRules, staffCreateRules, validate } = require('../middleware/validators');

// Public routes
router.get('/doctors/public', getPublicDoctors);

// Admin only routes
router.use(protect);

router.get('/stats', authorize('admin'), getUserStats);
router.get('/', authorize('admin', 'staff'), getAllUsers);
router.get('/:id', authorize('admin', 'staff'), getUserById);

router.post('/doctors', authorize('admin'), doctorCreateRules, validate, createDoctor);
router.post('/staff', authorize('admin'), staffCreateRules, validate, createStaff);
router.post('/admins', authorize('admin'), createAdmin);

router.put('/:id', authorize('admin'), updateUser);
router.patch('/:id/toggle-status', authorize('admin'), toggleUserStatus);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
