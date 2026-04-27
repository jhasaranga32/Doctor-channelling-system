// routes/doctorRoutes.js
//
// Mount in server.js / app.js:
//   const doctorRoutes = require("./routes/doctorRoutes");
//   app.use("/api/doctors", doctorRoutes);

const express = require("express");
const router  = express.Router();

const {
  getSpecializations,
  getStats,
  getDoctorsBySpecialization,
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} = require("../controllers/doctorController");

// ── If you have auth middleware, import it here ──────
// const { protect, adminOnly } = require("../middleware/authMiddleware");

// ─────────────────────────────────────────────────────────────
//  Static / Utility routes  (must come BEFORE /:id)
// ─────────────────────────────────────────────────────────────

// GET  /api/doctors/specializations   → list of all valid specializations
router.get("/specializations", getSpecializations);

// GET  /api/doctors/stats             → dashboard stats (total, active, by-spec …)
router.get("/stats", /* protect, */ getStats);

// GET  /api/doctors/by-specialization → active doctors grouped by specialization
router.get("/by-specialization", getDoctorsBySpecialization);

// ─────────────────────────────────────────────────────────────
//  Collection routes
// ─────────────────────────────────────────────────────────────

// GET  /api/doctors        → list all (supports ?search= &specialization= &status= &page= &limit=)
// POST /api/doctors        → create new doctor
router
  .route("/")
  .get(  /* protect, */       getAllDoctors)
  .post( /* protect, adminOnly, */ createDoctor);

// ─────────────────────────────────────────────────────────────
//  Single-resource routes
// ─────────────────────────────────────────────────────────────

// GET    /api/doctors/:id  → get one doctor
// PUT    /api/doctors/:id  → update doctor
// DELETE /api/doctors/:id  → delete doctor
router
  .route("/:id")
  .get(    /* protect, */            getDoctorById)
  .put(    /* protect, adminOnly, */ updateDoctor)
  .delete( /* protect, adminOnly, */ deleteDoctor);

module.exports = router;