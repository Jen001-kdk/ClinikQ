const mongoose = require('mongoose');
const Department = require('../models/Department');
const Report = require('../models/Report');

async function seedDepartments() {
  const depts = [
    { name: 'General Medicine', avgConsultTime: 15 },
    { name: 'Orthopedics', avgConsultTime: 20 },
    { name: 'Cardiology', avgConsultTime: 25 }
  ];
  try {
    await Department.deleteMany({});
    console.log('🗑️  Old departments cleared.');

    for (const d of depts) {
      await Department.findOneAndUpdate({ name: d.name }, d, { upsert: true });
    }
    console.log('✅ New departments seeded successfully.');

    const reports = [
      { userName: 'Patient', doctor: 'Dr. Sarah Ahmed', department: 'Cardiology', type: 'Lipid Profile', status: 'Completed', files: 2 },
      { userName: 'Patient', doctor: 'Dr. John Mathew', department: 'Neurology', type: 'MRI Scan', status: 'Pending', files: 1 }
    ];
    await Report.deleteMany({ userName: 'Patient' });
    await Report.insertMany(reports);
    console.log('✅ Dummy reports seeded for "Patient".');
  } catch (err) {
    console.error('❌ Error seeding data:', err);
  }
}

const connectDB = async () => {
  require('dotenv').config();
  const DEFAULT_MONGO_URI = 'mongodb://127.0.0.1:27017/clinicq';
  const mongoURI = (process.env.MONGO_URI || DEFAULT_MONGO_URI).trim();

  mongoose.set('strictQuery', false);

  await mongoose.connect(mongoURI)
    .then(() => {
      const isLocal = mongoURI.includes('127.0.0.1');
      console.log(`✅ Connected to ${isLocal ? 'local' : 'Atlas'} MongoDB`);
      seedDepartments();
    })
    .catch(err => {
      console.error('❌ Database Connection Error Details:', err.message);
    });
};

module.exports = connectDB;
