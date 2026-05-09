const LeaveRequest = require('../models/LeaveRequest');
const User = require('../models/User');

const getDatesBetween = (start, end) => {
  const dates = [];
  let curr = new Date(start);
  const endD = new Date(end);
  while (curr <= endD) {
    dates.push(curr.toISOString().split('T')[0]);
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
};

// @desc    Create a new leave request
// @route   POST /api/leaves
// @access  Doctor
exports.createLeaveRequest = async (req, res) => {
  try {
    const { startDate, endDate, reason } = req.body;
    
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ success: false, message: 'Only doctors can request leave.' });
    }

    if (!startDate || !endDate || !reason) {
      return res.status(400).json({ success: false, message: 'Start date, end date, and reason are required.' });
    }

    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ success: false, message: 'End date must be after or equal to start date.' });
    }

    const leave = await LeaveRequest.create({
      doctor: req.user._id,
      startDate,
      endDate,
      reason,
    });

    res.status(201).json({ success: true, message: 'Leave request submitted successfully.', leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current doctor's leave requests
// @route   GET /api/leaves/me
// @access  Doctor
exports.getMyLeaves = async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const leaves = await LeaveRequest.find({ doctor: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all leave requests
// @route   GET /api/leaves
// @access  Staff, Admin
exports.getAllLeaves = async (req, res) => {
  try {
    if (req.user.role !== 'staff' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const leaves = await LeaveRequest.find().populate('doctor', 'firstName lastName email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update leave status (Approve/Reject)
// @route   PUT /api/leaves/:id/status
// @access  Staff, Admin
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { status, staffNotes } = req.body;

    if (req.user.role !== 'staff' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found.' });
    }

    // Only process if it was pending
    if (leave.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Leave is already ${leave.status}.` });
    }

    leave.status = status;
    if (staffNotes) leave.staffNotes = staffNotes;
    await leave.save();

    // If approved, add dates to doctor's blockedDates
    if (status === 'approved') {
      const doctor = await User.findById(leave.doctor);
      if (doctor) {
        const datesToBlock = getDatesBetween(leave.startDate, leave.endDate);
        const currentBlocked = doctor.doctorDetails.blockedDates || [];
        
        // Add new unique dates
        const newBlocked = [...new Set([...currentBlocked, ...datesToBlock])];
        doctor.doctorDetails.blockedDates = newBlocked;
        await doctor.save({ validateBeforeSave: false }); // Skip full validation to just update dates
      }
    }

    res.status(200).json({ success: true, message: `Leave ${status} successfully.`, leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
