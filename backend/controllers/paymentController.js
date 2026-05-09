const Stripe = require('stripe');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51R5HvtExh1zjkGxojoAZdK5HIJmzrEQuObpJKFkYm1zeOsOo75OdbadoxVNNrPHGPHmbnVtk4Sw717PG3uz6215Z00qpk8CmOu');

exports.createCheckoutSession = async (req, res) => {
  try {
    const { doctorId, appointmentDate, appointmentTime, reason } = req.body;

    if (!doctorId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ success: false, message: 'Doctor, date, and time are required.' });
    }

    const doctor = await User.findOne({ _id: doctorId, role: 'doctor', isActive: true });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found or not available.' });
    }

    // Usually, the consultation fee would be retrieved from doctor details. For dummy setup, we will use a fixed fee if it's missing.
    const feeInLKR = doctor.doctorDetails?.consultationFee || 1500;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'lkr',
            product_data: {
              name: `Appointment with Dr. ${doctor.firstName} ${doctor.lastName}`,
              description: `Date: ${new Date(appointmentDate).toLocaleDateString()} at ${appointmentTime}`,
            },
            unit_amount: feeInLKR * 100, // Stripe expects amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/payment-cancel`,
      metadata: {
        patientId: req.user._id.toString(),
        doctorId: doctor._id.toString(),
        appointmentDate: appointmentDate,
        appointmentTime: appointmentTime,
        reason: reason || '',
      },
    });

    res.status(200).json({ success: true, url: session.url });
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifySessionAndBook = async (req, res) => {
  try {
    const { session_id } = req.body;

    if (!session_id) {
      return res.status(400).json({ success: false, message: 'Session ID is required' });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === 'paid') {
      const { patientId, doctorId, appointmentDate, appointmentTime, reason } = session.metadata;

      // Check if the appointment already exists to prevent duplicate bookings if the user refreshes the success page
      const existingAppointment = await Appointment.findOne({
        patient: patientId,
        doctor: doctorId,
        appointmentDate: new Date(appointmentDate),
        appointmentTime: appointmentTime,
      });

      if (existingAppointment) {
        return res.status(200).json({ success: true, message: 'Appointment already confirmed.', appointment: existingAppointment });
      }

      const appointment = await Appointment.create({
        patient: patientId,
        doctor: doctorId,
        appointmentDate: new Date(appointmentDate),
        appointmentTime,
        reason,
        status: 'confirmed',
      });

      return res.status(201).json({ success: true, message: 'Payment verified and appointment booked successfully.', appointment });
    } else {
      return res.status(400).json({ success: false, message: 'Payment not completed.' });
    }
  } catch (error) {
    console.error('Stripe Verification Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
