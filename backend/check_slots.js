const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const check = async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/doctor_channelling');
  const doctor = await User.findById('69feb04f8c9fbd86bb8c220f');
  console.log(JSON.stringify(doctor.doctorDetails.availableSlots, null, 2));
  process.exit();
};

check();
