const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  full_name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'patient' },
  age: String,
  gender: String,
  bloodType: String,
  contact: String,
  address: String,
  patientId: { type: String, unique: true, sparse: true },
  degree: String,
  specialization: String,
  license: String,
  workingDays: { type: [String], default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  startTime: { type: String, default: '09:00' },
  endTime: { type: String, default: '17:00' },
  maxPatients: { type: Number, default: 30 },
  avgConsultTime: { type: Number, default: 15 }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
