// models/Doctor.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const SPECIALIZATIONS = [
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "Gastroenterology",
  "General Practice",
  "Geriatrics",
  "Gynecology & Obstetrics",
  "Hematology",
  "Infectious Disease",
  "Internal Medicine",
  "Nephrology",
  "Neurology",
  "Oncology",
  "Ophthalmology",
  "Orthopedics",
  "Otolaryngology (ENT)",
  "Pathology",
  "Pediatrics",
  "Psychiatry",
  "Pulmonology",
  "Radiology",
  "Rheumatology",
  "Surgery (General)",
  "Surgery (Cardiothoracic)",
  "Surgery (Neurosurgery)",
  "Surgery (Orthopedic)",
  "Surgery (Plastic)",
  "Urology",
];

const doctorSchema = new mongoose.Schema(
  {
    // ── Basic Info ──────────────────────────────────
    name: {
      type: String,
      required: [true, "Doctor name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // excluded from query results by default
    },

    // ── Professional Info ───────────────────────────
    specialization: {
      type: String,
      required: [true, "Specialization is required"],
      enum: {
        values: SPECIALIZATIONS,
        message: "{VALUE} is not a valid specialization",
      },
    },
    licenseNumber: {
      type: String,
      required: [true, "Medical license number is required"],
      unique: true,
      trim: true,
    },
    qualification: {
      type: String,
      required: [true, "Qualification is required"],
      trim: true,
      // e.g. "MBBS, MD" / "MBBS, MS" / "MBBS, DCH"
    },
    experience: {
      type: Number,
      required: [true, "Years of experience is required"],
      min: [0, "Experience cannot be negative"],
      max: [60, "Experience value seems too high"],
    },

    // ── Contact ─────────────────────────────────────
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^\+?[\d\s\-()\\.]{7,15}$/, "Please provide a valid phone number"],
    },
    department: {
      type: String,
      trim: true,
      default: null,
    },

    // ── Schedule ────────────────────────────────────
    availableDays: {
      type: [String],
      enum: {
        values: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        message: "{VALUE} is not a valid day",
      },
      default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    },
    consultationHours: {
      start: { type: String, default: "09:00" },
      end:   { type: String, default: "17:00" },
    },
    consultationFee: {
      type: Number,
      min: [0, "Fee cannot be negative"],
      default: 0,
    },

    // ── Profile ─────────────────────────────────────
    profileImage: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      maxlength: [500, "Bio cannot exceed 500 characters"],
      trim: true,
      default: "",
    },

    // ── Status & Meta ────────────────────────────────
    status: {
      type: String,
      enum: {
        values: ["active", "inactive", "on_leave"],
        message: "{VALUE} is not a valid status",
      },
      default: "active",
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    role: {
      type: String,
      default: "doctor",
      immutable: true,
    },
  },
  {
    timestamps: true,          // adds createdAt & updatedAt
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Virtual ─────────────────────────────────────────
doctorSchema.virtual("displayTitle").get(function () {
  return `Dr. ${this.name}`;
});

// ── Pre-save: hash password ──────────────────────────
doctorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Instance method: verify password ────────────────
doctorSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ── Static: expose specializations list ─────────────
doctorSchema.statics.SPECIALIZATIONS = SPECIALIZATIONS;

const Doctor = mongoose.model("Doctor", doctorSchema);

module.exports = { Doctor, SPECIALIZATIONS };