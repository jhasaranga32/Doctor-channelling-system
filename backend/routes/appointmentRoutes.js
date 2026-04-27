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
} = require('../controllers/appointmentController');

router.use(protect);

router.route('/').get(getAppointments).post(authorize('patient'), appointmentCreateRules, validate, createAppointment);
router.route('/:id').get(getAppointmentById).put(authorize('patient'), appointmentUpdateRules, validate, updateAppointment).delete(authorize('patient', 'admin'), deleteAppointment);

module.exports = router;
