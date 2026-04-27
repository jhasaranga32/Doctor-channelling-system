// controllers/doctorController.js
const { Doctor, SPECIALIZATIONS } = require("../models/Doctor");
const bcrypt = require("bcryptjs");

// ─────────────────────────────────────────────────────────────
//  Helper
// ─────────────────────────────────────────────────────────────
const sendSuccess = (res, data, statusCode = 200, message = "Success") =>
  res.status(statusCode).json({ success: true, message, data });

const sendError = (res, message = "Server error", statusCode = 500) =>
  res.status(statusCode).json({ success: false, message });

// ─────────────────────────────────────────────────────────────
//  @desc    Get all specializations (static list)
//  @route   GET /api/doctors/specializations
//  @access  Public
// ─────────────────────────────────────────────────────────────
exports.getSpecializations = (req, res) => {
  sendSuccess(res, SPECIALIZATIONS);
};

// ─────────────────────────────────────────────────────────────
//  @desc    Get dashboard stats
//  @route   GET /api/doctors/stats
//  @access  Private (Staff)
// ─────────────────────────────────────────────────────────────
exports.getStats = async (req, res) => {
  try {
    const [total, active, inactive, onLeave, bySpec] = await Promise.all([
      Doctor.countDocuments(),
      Doctor.countDocuments({ status: "active" }),
      Doctor.countDocuments({ status: "inactive" }),
      Doctor.countDocuments({ status: "on_leave" }),
      Doctor.aggregate([
        { $group: { _id: "$specialization", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    sendSuccess(res, { total, active, inactive, onLeave, bySpecialization: bySpec });
  } catch (err) {
    sendError(res, err.message);
  }
};

// ─────────────────────────────────────────────────────────────
//  @desc    Get doctors grouped by specialization (public view)
//  @route   GET /api/doctors/by-specialization
//  @access  Public
// ─────────────────────────────────────────────────────────────
exports.getDoctorsBySpecialization = async (req, res) => {
  try {
    const doctors = await Doctor.find({ status: "active" })
      .select("-password -consultationHours")
      .lean();

    const grouped = doctors.reduce((acc, doc) => {
      const key = doc.specialization;
      if (!acc[key]) acc[key] = [];
      acc[key].push(doc);
      return acc;
    }, {});

    sendSuccess(res, grouped);
  } catch (err) {
    sendError(res, err.message);
  }
};

// ─────────────────────────────────────────────────────────────
//  @desc    Get all doctors  (with filters + pagination)
//  @route   GET /api/doctors
//  @access  Private (Staff)
//  @query   search, specialization, status, page, limit
// ─────────────────────────────────────────────────────────────
exports.getAllDoctors = async (req, res) => {
  try {
    const {
      search,
      specialization,
      status,
      page  = 1,
      limit = 20,
    } = req.query;

    const filter = {};

    if (specialization) filter.specialization = specialization;
    if (status)         filter.status = status;
    if (search) {
      filter.$or = [
        { name:       { $regex: search, $options: "i" } },
        { email:      { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [doctors, total] = await Promise.all([
      Doctor.find(filter)
        .select("-password")
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      Doctor.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: doctors,
      pagination: {
        total,
        page:  Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    sendError(res, err.message);
  }
};

// ─────────────────────────────────────────────────────────────
//  @desc    Get single doctor by ID
//  @route   GET /api/doctors/:id
//  @access  Private (Staff)
// ─────────────────────────────────────────────────────────────
exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select("-password");
    if (!doctor) return sendError(res, "Doctor not found", 404);
    sendSuccess(res, doctor);
  } catch (err) {
    sendError(res, err.message);
  }
};

// ─────────────────────────────────────────────────────────────
//  @desc    Create a new doctor
//  @route   POST /api/doctors
//  @access  Private (Admin / Staff)
// ─────────────────────────────────────────────────────────────
exports.createDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body);

    // strip password from response
    const result = doctor.toObject();
    delete result.password;

    sendSuccess(res, result, 201, "Doctor created successfully");
  } catch (err) {
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: "Validation failed", errors });
    }
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return sendError(res, `${field} already exists`, 400);
    }
    sendError(res, err.message);
  }
};

// ─────────────────────────────────────────────────────────────
//  @desc    Update a doctor
//  @route   PUT /api/doctors/:id
//  @access  Private (Admin / Staff)
// ─────────────────────────────────────────────────────────────
exports.updateDoctor = async (req, res) => {
  try {
    const updates = { ...req.body };

    // protect immutable fields
    delete updates.role;
    delete updates._id;

    // if password is being updated, hash it manually
    // (pre-save hook won't fire on findByIdAndUpdate)
    if (updates.password) {
      if (updates.password.length < 8) {
        return sendError(res, "Password must be at least 8 characters", 400);
      }
      updates.password = await bcrypt.hash(updates.password, 12);
    }

    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select("-password");

    if (!doctor) return sendError(res, "Doctor not found", 404);

    sendSuccess(res, doctor, 200, "Doctor updated successfully");
  } catch (err) {
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: "Validation failed", errors });
    }
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return sendError(res, `${field} already exists`, 400);
    }
    sendError(res, err.message);
  }
};

// ─────────────────────────────────────────────────────────────
//  @desc    Delete a doctor
//  @route   DELETE /api/doctors/:id
//  @access  Private (Admin)
// ─────────────────────────────────────────────────────────────
exports.deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) return sendError(res, "Doctor not found", 404);
    sendSuccess(res, null, 200, "Doctor deleted successfully");
  } catch (err) {
    sendError(res, err.message);
  }
};