require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

const seedData = async () => {
  await connectDB();

  console.log('🌱 Seeding database...');

  // Clear existing users
  await User.deleteMany({});
  console.log('🗑️  Cleared existing users');

  // Create Super Admin
  const admin = await User.create({
    firstName: 'Super',
    lastName: 'Admin',
    email: 'admin@medichannel.lk',
    password: 'admin123',
    role: 'admin',
    phone: '+94 11 234 5678',
    isActive: true,
    adminDetails: {
      isSuperAdmin: true,
      permissions: [
        'manage_users', 'manage_doctors', 'manage_patients',
        'manage_staff', 'manage_appointments', 'view_reports', 'manage_settings',
      ],
    },
  });

  // Create Doctors
  const doctors = await User.create([
    {
      firstName: 'Priya', lastName: 'Fernando', email: 'priya@medichannel.lk',
      password: 'doctor123', role: 'doctor', phone: '+94 77 111 2222', isActive: true,
      doctorDetails: {
        specialization: 'Cardiologist', licenseNumber: 'SLMC-12345',
        yearsOfExperience: 12, department: 'Cardiology',
        consultationFee: 2500, rating: 4.8, totalReviews: 134,
        bio: 'Experienced cardiologist with over 12 years of practice.',
        qualifications: ['MBBS - University of Colombo', 'MD - Cardiology', 'FRCP - London'],
      },
    },
    {
      firstName: 'Rahal', lastName: 'Perera', email: 'rahal@medichannel.lk',
      password: 'doctor123', role: 'doctor', phone: '+94 77 333 4444', isActive: true,
      doctorDetails: {
        specialization: 'Neurologist', licenseNumber: 'SLMC-67890',
        yearsOfExperience: 8, department: 'Neurology',
        consultationFee: 3000, rating: 4.6, totalReviews: 87,
        bio: 'Specialist in neurological disorders and brain health.',
        qualifications: ['MBBS - Kelaniya University', 'MD - Neurology'],
      },
    },
  ]);

  // Create Staff
  const staff = await User.create([
    {
      firstName: 'Nimal', lastName: 'Silva', email: 'nimal@medichannel.lk',
      password: 'staff123', role: 'staff', phone: '+94 71 555 6666', isActive: true,
      staffDetails: {
        position: 'Receptionist', department: 'Front Desk',
        employeeId: 'EMP001', shift: 'morning',
        joiningDate: new Date('2022-01-15'),
      },
    },
    {
      firstName: 'Kamani', lastName: 'Jayawardena', email: 'kamani@medichannel.lk',
      password: 'staff123', role: 'staff', phone: '+94 71 777 8888', isActive: true,
      staffDetails: {
        position: 'Nurse', department: 'General Ward',
        employeeId: 'EMP002', shift: 'afternoon',
        joiningDate: new Date('2021-06-20'),
      },
    },
  ]);

  // Create Patients
  const patients = await User.create([
    {
      firstName: 'Amara', lastName: 'Bandara', email: 'amara@gmail.com',
      password: 'patient123', role: 'patient', phone: '+94 76 123 4567', isActive: true,
      patientDetails: {
        dateOfBirth: new Date('1990-05-15'), gender: 'female', bloodGroup: 'B+',
        address: { street: '45 Temple Road', city: 'Colombo', state: 'Western', postalCode: '00300', country: 'Sri Lanka' },
        emergencyContact: { name: 'Kamal Bandara', phone: '+94 76 987 6543', relationship: 'Spouse' },
        allergies: ['Penicillin'],
      },
    },
    {
      firstName: 'Dinesh', lastName: 'Kumar', email: 'dinesh@gmail.com',
      password: 'patient123', role: 'patient', phone: '+94 70 234 5678', isActive: true,
      patientDetails: {
        dateOfBirth: new Date('1985-11-22'), gender: 'male', bloodGroup: 'O+',
        address: { street: '12 Kandy Road', city: 'Kandy', state: 'Central', postalCode: '20000', country: 'Sri Lanka' },
        emergencyContact: { name: 'Priya Kumar', phone: '+94 70 876 5432', relationship: 'Spouse' },
      },
    },
  ]);

  console.log('\n✅ Seed data created successfully!\n');
  console.log('📋 Login Credentials:');
  console.log('─'.repeat(50));
  console.log('👑 ADMIN');
  console.log('   Email:    admin@medichannel.lk');
  console.log('   Password: admin123');
  console.log('');
  console.log('👨‍⚕️ DOCTORS');
  console.log('   Email:    priya@medichannel.lk    Password: doctor123');
  console.log('   Email:    rahal@medichannel.lk    Password: doctor123');
  console.log('');
  console.log('👩‍💼 STAFF');
  console.log('   Email:    nimal@medichannel.lk    Password: staff123');
  console.log('   Email:    kamani@medichannel.lk   Password: staff123');
  console.log('');
  console.log('🧑‍⚕️ PATIENTS');
  console.log('   Email:    amara@gmail.com         Password: patient123');
  console.log('   Email:    dinesh@gmail.com         Password: patient123');
  console.log('─'.repeat(50));

  mongoose.connection.close();
};

seedData().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
