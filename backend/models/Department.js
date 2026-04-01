const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  avgConsultTime: { type: Number, default: 15 }
});

module.exports = mongoose.model('Department', departmentSchema);
