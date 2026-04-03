const User = require('../models/User');
const Token = require('../models/Token');

// GET /api/admin/summary
const getSummary = async (req, res) => {
  try {
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const pendingApprovals = await User.countDocuments({ role: 'pending' });
    return res.json({ totalPatients, totalDoctors, totalAdmins, pendingApprovals });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch summary' });
  }
};

// GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'name email role createdAt');
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// PUT /api/admin/users/:id/role
const updateUserRole = async (req, res) => {
  const { role } = req.body;
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update role' });
  }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    return res.json({ message: 'User deleted' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete user' });
  }
};

// GET /api/admin/queue
const getQueue = async (req, res) => {
  try {
    const today = new Date().toLocaleDateString('en-GB');
    const { date } = req.query;
    const queryDate = date || today;

    const tokens = await Token.find({ date: queryDate })
      .populate('patientId', 'name full_name patientId email')
      .populate('doctorId', 'name full_name specialization')
      .sort({ createdAt: -1 });

    const stats = {
      total: tokens.length,
      waiting: tokens.filter(t => t.status === 'Waiting' || t.status === 'pending').length,
      inProgress: tokens.filter(t => t.status === 'in-progress').length,
      completed: tokens.filter(t => t.status === 'Completed').length,
      cancelled: tokens.filter(t => t.status === 'Cancelled').length,
    };

    res.json({ tokens, stats });
  } catch (err) {
    console.error('Admin queue error:', err);
    res.status(500).json({ error: 'Failed to fetch admin queue' });
  }
};

// PATCH /api/admin/queue/:id
const updateQueueStatus = (io) => async (req, res) => {
  try {
    const { status } = req.body;
    const token = await Token.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate('patientId', 'name patientId')
      .populate('doctorId', 'name');
    io.emit('queueUpdate', {});
    res.json(token);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update token' });
  }
};

// POST /api/admin/token
const generateToken = (io) => async (req, res) => {
  try {
    const { patientId, doctorId, department, timeSlot } = req.body;
    if (!patientId || !doctorId || !department) {
      return res.status(400).json({ error: 'patientId, doctorId, and department are required' });
    }

    const patient = await User.findById(patientId);
    const doctor = await User.findById(doctorId);
    if (!patient || !doctor) return res.status(404).json({ error: 'Patient or Doctor not found' });

    const today = new Date().toLocaleDateString('en-GB');
    const count = await Token.countDocuments({ doctorId: doctor._id, date: today, status: { $in: ['Waiting', 'in-progress', 'pending'] } });
    const position = count + 1;
    const avgTime = doctor.avgConsultTime || 15;
    const estimatedMinutes = position * avgTime;
    const estimatedWait = `~${estimatedMinutes} min`;
    const prefix = department.charAt(0).toUpperCase();
    const lastToken = await Token.findOne({ doctorId: doctor._id, date: today }).sort({ createdAt: -1 });
    let nextNumber = 1;
    if (lastToken && lastToken.tokenId) {
      const parts = lastToken.tokenId.split('-');
      if (parts.length > 1) nextNumber = parseInt(parts[1]) + 1;
    }
    const tokenId = `${prefix}-${nextNumber.toString().padStart(3, '0')}`;
    const bookedTimeDate = new Date();
    bookedTimeDate.setMinutes(bookedTimeDate.getMinutes() + estimatedMinutes);
    const bookedTime = timeSlot || bookedTimeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newToken = new Token({
      patientId: patient._id,
      doctorId: doctor._id,
      userName: patient.name,
      tokenId, department,
      doctor: doctor.name,
      status: 'Waiting',
      position, estimatedWait, bookedTime,
      roomNumber: `Room ${Math.floor(Math.random() * 10) + 1}`,
      date: today,
    });
    await newToken.save();
    io.emit('queueUpdate', {});
    res.json(newToken);
  } catch (err) {
    console.error('Admin token error:', err);
    res.status(500).json({ error: 'Failed to generate token' });
  }
};

module.exports = { getSummary, getUsers, updateUserRole, deleteUser, getQueue, updateQueueStatus, generateToken };
