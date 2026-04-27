const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['patient', 'doctor', 'staff', 'admin'],
      default: 'patient',
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s\-()]{7,15}$/, 'Please enter a valid phone number'],
    },
    profileImage: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    // === PATIENT SPECIFIC ===
    patientDetails: {
      dateOfBirth: Date,
      gender: { type: String, enum: ['male', 'female', 'other'] },
      bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
      address: {
        street: String,
        city: String,
        state: String,
        postalCode: String,
        country: { type: String, default: 'Sri Lanka' },
      },
      emergencyContact: {
        name: String,
        phone: String,
        relationship: String,
      },
      medicalHistory: [String],
      allergies: [String],
      insuranceInfo: {
        provider: String,
        policyNumber: String,
      },
    },

    // === DOCTOR SPECIFIC ===
    doctorDetails: {
      specialization: { type: String },
      qualifications: [String],
      licenseNumber: { type: String },
      yearsOfExperience: { type: Number, min: 0 },
      department: String,
      consultationFee: { type: Number, min: 0 },
      availableSlots: [
        {
          day: { type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'] },
          startTime: String,
          endTime: String,
        },
      ],
      bio: { type: String, maxlength: 1000 },
      rating: { type: Number, default: 0, min: 0, max: 5 },
      totalReviews: { type: Number, default: 0 },
    },

    // === STAFF SPECIFIC ===
    staffDetails: {
      position: String,
      department: String,
      employeeId: String,
      shift: { type: String, enum: ['morning', 'afternoon', 'night'] },
      joiningDate: Date,
    },

    // === ADMIN SPECIFIC ===
    adminDetails: {
      permissions: [
        {
          type: String,
          enum: [
            'manage_users',
            'manage_doctors',
            'manage_patients',
            'manage_staff',
            'manage_appointments',
            'view_reports',
            'manage_settings',
          ],
        },
      ],
      isSuperAdmin: { type: Boolean, default: false },
    },

    lastLogin: Date,
    passwordChangedAt: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Index for performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

module.exports = mongoose.model('User', userSchema);
