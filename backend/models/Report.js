const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  userName: String,
  doctor: String,
  department: String,
  date: { type: String, default: () => new Date().toLocaleDateString('en-GB') },
  type: String,
  status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
  files: { type: Number, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
