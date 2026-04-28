const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { appointmentCreateRules, appointmentUpdateRules, validate } = require('../middleware/validators');
const {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getBookedSlots,          // ← add this import
} = require('../controllers/appointmentController');

// ── Public routes (no auth required) ────────────────────────────────────────
// MUST be declared BEFORE router.use(protect) so the middleware doesn't block them.

// Returns booked HH:mm times for a doctor on a given date.
// Used by the patient booking page to grey-out taken slots.
// GET /api/appointments/booked-slots?doctorId=<id>&date=<YYYY-MM-DD>
router.get('/booked-slots', getBookedSlots);

// ── Protected routes (auth required for everything below) ───────────────────
router.use(protect);

router
  .route('/')
  .get(getAppointments)
  .post(authorize('patient'), appointmentCreateRules, validate, createAppointment);

router
  .route('/:id')
  .get(getAppointmentById)
  .put(authorize('patient'), appointmentUpdateRules, validate, updateAppointment)
  .delete(authorize('patient', 'admin'), deleteAppointment);

module.exports = router;