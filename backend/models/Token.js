const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  userId: { type: String },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  tokenId: String,
  department: String,
  doctor: String,
  status: { type: String, enum: ['Waiting', 'in-progress', 'Completed', 'Cancelled', 'pending', 'no-show'], default: 'pending' },
  position: Number,
  estimatedWait: String,
  bookedTime: String,
  roomNumber: { type: String, default: 'Room 4' },
  date: { type: String, default: () => new Date().toLocaleDateString('en-GB') }
}, { timestamps: true });

module.exports = mongoose.model('Token', tokenSchema);
