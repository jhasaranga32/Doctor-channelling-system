const Appointment = require('../models/Appointment');
const User = require('../models/User');

const isOwnerOrAdmin = (user, appointment) => {
  if (!appointment) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'patient' && appointment.patient.toString() === user._id.toString()) return true;
  if (user.role === 'doctor' && appointment.doctor.toString() === user._id.toString()) return true;
  return false;
};

exports.createAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, appointmentTime, reason } = req.body;
    if (!doctorId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ success: false, message: 'Doctor, date, and time are required.' });
    }

    const doctor = await User.findOne({ _id: doctorId, role: 'doctor', isActive: true });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found or not available.' });
    }

    const date = new Date(appointmentDate);
    if (isNaN(date.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid appointment date.' });
    }
    if (date < new Date().setHours(0, 0, 0, 0)) {
      return res.status(400).json({ success: false, message: 'Appointment date cannot be in the past.' });
    }

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctor._id,
      appointmentDate: date,
      appointmentTime,
      reason: reason?.trim() || '',
    });

    res.status(201).json({ success: true, message: 'Appointment created successfully.', appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'patient') query.patient = req.user._id;
    else if (req.user.role === 'doctor') query.doctor = req.user._id;

    const appointments = await Appointment.find(query)
      .sort({ appointmentDate: -1, appointmentTime: 1 })
      .populate('doctor', 'firstName lastName doctorDetails email phone')
      .populate('patient', 'firstName lastName email phone');

    res.status(200).json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('doctor', 'firstName lastName doctorDetails email phone')
      .populate('patient', 'firstName lastName email phone');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    if (!isOwnerOrAdmin(req.user, appointment)) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this appointment.' });
    }

    res.status(200).json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    if (req.user.role !== 'patient' || appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the booking patient can update this appointment.' });
    }

    if (['completed', 'cancelled'].includes(appointment.status)) {
      return res.status(400).json({ success: false, message: 'Cannot update a completed or cancelled appointment.' });
    }

    const { appointmentDate, appointmentTime, reason } = req.body;
    if (appointmentDate) {
      const date = new Date(appointmentDate);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid appointment date.' });
      }
      if (date < new Date().setHours(0, 0, 0, 0)) {
        return res.status(400).json({ success: false, message: 'Appointment date cannot be in the past.' });
      }
      appointment.appointmentDate = date;
    }
    if (appointmentTime) appointment.appointmentTime = appointmentTime;
    if (reason !== undefined) appointment.reason = reason.trim();

    await appointment.save();
    res.status(200).json({ success: true, message: 'Appointment updated successfully.', appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    if (req.user.role !== 'patient' || appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the booking patient can cancel this appointment.' });
    }

    await appointment.remove();
    res.status(200).json({ success: true, message: 'Appointment cancelled successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── ADD this function to appointmentController.js ───────────────────────────
//
// Returns the list of already-booked HH:mm times for a given doctor + date.
// No authentication required — patients need this before they even log in to
// browse availability, and it exposes no private data (just time strings).
//
// GET /api/appointments/booked-slots?doctorId=<id>&date=<YYYY-MM-DD>

exports.getBookedSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({ success: false, message: 'doctorId and date query params are required.' });
    }

    const parsedDate = new Date(date + 'T00:00:00');
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    // End of the same day
    const nextDay = new Date(parsedDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const appointments = await Appointment.find({
      doctor: doctorId,
      appointmentDate: { $gte: parsedDate, $lt: nextDay },
      status: { $nin: ['cancelled'] }, // cancelled slots are free again
    }).select('appointmentTime -_id');

    const bookedTimes = appointments.map((a) => a.appointmentTime);

    res.status(200).json({ success: true, bookedTimes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};