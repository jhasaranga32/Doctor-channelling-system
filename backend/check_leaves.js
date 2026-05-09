const mongoose = require('mongoose');
const User = require('./models/User');
const LeaveRequest = require('./models/LeaveRequest');
require('dotenv').config();

const check = async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/doctor_channelling'); 
  const doctors = await User.find({ role: 'doctor' }).select('firstName lastName doctorDetails.blockedDates');
  console.log("Doctors:");
  console.log(JSON.stringify(doctors, null, 2));

  const leaves = await LeaveRequest.find();
  console.log("Leaves:");
  console.log(JSON.stringify(leaves, null, 2));
  
  process.exit();
};

check();
