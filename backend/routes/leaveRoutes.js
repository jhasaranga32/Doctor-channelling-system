const express = require('express');
const router = express.Router();
const { createLeaveRequest, getMyLeaves, getAllLeaves, updateLeaveStatus } = require('../controllers/leaveController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createLeaveRequest);
router.get('/', protect, getAllLeaves);
router.get('/me', protect, getMyLeaves);
router.put('/:id/status', protect, updateLeaveStatus);

module.exports = router;
