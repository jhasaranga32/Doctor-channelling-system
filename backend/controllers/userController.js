const User = require('../models/User');

// @desc    Get all users with filters & pagination
// @route   GET /api/users
// @access  Admin
exports.getAllUsers = async (req, res) => {
  try {
    const { role, isActive, search, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Admin, Staff (own patients)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create Doctor (Admin only)
// @route   POST /api/users/doctors
// @access  Admin
exports.createDoctor = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, doctorDetails } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const doctor = await User.create({
      firstName, lastName, email, password, phone,
      role: 'doctor',
      doctorDetails: doctorDetails || {},
    });

    doctor.password = undefined;
    res.status(201).json({ success: true, message: 'Doctor created successfully.', user: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create Staff (Admin only)
// @route   POST /api/users/staff
// @access  Admin
exports.createStaff = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, staffDetails } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const staff = await User.create({
      firstName, lastName, email, password, phone,
      role: 'staff',
      staffDetails: staffDetails || {},
    });

    staff.password = undefined;
    res.status(201).json({ success: true, message: 'Staff member created successfully.', user: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create Admin (Super Admin only)
// @route   POST /api/users/admins
// @access  Admin (isSuperAdmin)
exports.createAdmin = async (req, res) => {
  try {
    // Only super admins can create other admins
    if (!req.user.adminDetails?.isSuperAdmin) {
      return res.status(403).json({ success: false, message: 'Only super admins can create admin accounts.' });
    }

    const { firstName, lastName, email, password, phone, adminDetails } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const admin = await User.create({
      firstName, lastName, email, password, phone,
      role: 'admin',
      adminDetails: adminDetails || { permissions: ['manage_users'] },
    });

    admin.password = undefined;
    res.status(201).json({ success: true, message: 'Admin created successfully.', user: admin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update any user (Admin) or Doctor (Staff)
// @route   PUT /api/users/:id
// @access  Admin, Staff (doctors only)
exports.updateUser = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Staff can only update doctors
    if (req.user.role === 'staff' && targetUser.role !== 'doctor') {
      return res.status(403).json({ success: false, message: 'Staff can only update doctor accounts.' });
    }

    const forbiddenFields = ['password', 'email', 'role'];
    forbiddenFields.forEach((f) => delete req.body[f]);

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select('-password');

    res.status(200).json({ success: true, message: 'User updated successfully.', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Activate / Deactivate user
// @route   PATCH /api/users/:id/toggle-status
// @access  Admin
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Admin cannot deactivate themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate your own account.' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully.`,
      isActive: user.isActive,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user (Admin) or Doctor (Staff)
// @route   DELETE /api/users/:id
// @access  Admin, Staff (doctors only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Staff can only delete doctors
    if (req.user.role === 'staff' && user.role !== 'doctor') {
      return res.status(403).json({ success: false, message: 'Staff can only delete doctor accounts.' });
    }

    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account.' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Admin
exports.getUserStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          total: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } },
          inactive: { $sum: { $cond: ['$isActive', 0, 1] } },
        },
      },
    ]);

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const newThisMonth = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().setDate(1)) },
    });

    res.status(200).json({
      success: true,
      stats: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
        newThisMonth,
        byRole: stats,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all doctors (Public - for booking)
// @route   GET /api/users/doctors/public
// @access  Public
exports.getPublicDoctors = async (req, res) => {
  try {
    const { specialization, search, page = 1, limit = 12 } = req.query;

    const query = { role: 'doctor', isActive: true };
    if (specialization) query['doctorDetails.specialization'] = { $regex: specialization, $options: 'i' };
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { 'doctorDetails.specialization': { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const doctors = await User.find(query)
      .select('firstName lastName profileImage doctorDetails.specialization doctorDetails.consultationFee doctorDetails.rating doctorDetails.totalReviews doctorDetails.bio')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({ success: true, total, doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
