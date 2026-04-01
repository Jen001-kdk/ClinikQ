const Token = require('../models/Token');
const User = require('../models/User');
const Department = require('../models/Department');
const { getUserByToken } = require('../middleware/auth');

// GET /api/queue/serving/:department
const getServing = async (req, res) => {
  try {
    const { department } = req.params;
    const { doctor } = req.query;
    let query = { department, status: 'Now Serving', date: new Date().toLocaleDateString('en-GB') };
    if (doctor) query.doctor = doctor;
    const serving = await Token.findOne(query).sort({ updatedAt: -1 });
    res.json(serving || { tokenId: '--', position: 0 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch serving status' });
  }
};

// GET /api/queue/position/:tokenId
const getPosition = async (req, res) => {
  try {
    const { tokenId } = req.params;
    const currentToken = await Token.findOne({ tokenId });
    if (!currentToken) return res.status(404).json({ error: 'Token not found' });
    const aheadCount = await Token.countDocuments({
      doctor: currentToken.doctor,
      status: { $in: ['Waiting', 'Now Serving'] },
      createdAt: { $lt: currentToken.createdAt },
      date: currentToken.date
    });
    res.json({ aheadCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate position' });
  }
};

// POST /api/queue/next
const callNext = (io) => async (req, res) => {
  try {
    const user = await getUserByToken(req);
    if (!user || user.role !== 'doctor') return res.status(401).json({ error: 'Unauthorized' });

    const today = new Date().toLocaleDateString('en-GB');

    await Token.updateMany(
      { doctorId: user._id, date: today, status: 'Now Serving' },
      { status: 'Completed', position: 0 }
    );

    const nextPatient = await Token.findOne({
      doctorId: user._id,
      date: today,
      status: { $in: ['Waiting', 'pending'] }
    }).sort({ createdAt: 1 });

    if (nextPatient) {
      nextPatient.status = 'Now Serving';
      nextPatient.position = 0;
      await nextPatient.save();

      io.emit('notification', {
        userId: nextPatient.userName,
        message: 'It is your turn! Please come to the consultation room.',
        type: 'turn'
      });
    }

    io.emit('queueUpdate', { doctorId: user._id });
    res.json({ success: true, nextPatient });
  } catch (err) {
    console.error("Queue Error:", err);
    res.status(500).json({ error: 'Failed to advance queue' });
  }
};

// POST /api/queue/done
const markDone = (io) => async (req, res) => {
  try {
    const user = await getUserByToken(req);
    if (!user || user.role !== 'doctor') return res.status(401).json({ error: 'Unauthorized' });

    const today = new Date().toLocaleDateString('en-GB');

    await Token.updateMany(
      { doctorId: user._id, date: today, status: 'Now Serving' },
      { status: 'Completed', position: 0 }
    );

    io.emit('queueUpdate', { doctor: user.name });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to complete appointment' });
  }
};

// GET /api/appointments
const getAppointments = async (req, res) => {
  try {
    const { userName, date, doctor, doctorId } = req.query;
    let query = {};
    if (userName) query.userName = userName;
    if (date) query.date = date;
    if (doctor) query.doctor = doctor;
    if (doctorId) query.doctorId = doctorId;

    const tokens = await Token.find(query)
      .populate('patientId', 'name email role')
      .sort({ createdAt: -1 });
    res.json(tokens);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
};

// POST /api/tokens
const createToken = (io) => async (req, res) => {
  try {
    const { userName, department, doctor, date, patientId, doctorId } = req.body;
    if (!department || !doctor || !date) {
      return res.status(400).json({ error: 'department, doctor, and date are required' });
    }

    const docUser = doctorId
      ? await User.findById(doctorId)
      : await User.findOne({ name: doctor, role: 'doctor' });

    if (!docUser) {
      return res.status(404).json({ error: `Doctor ${doctor} not found.` });
    }

    const dept = await Department.findOne({ name: department });
    let avgTime = docUser.avgConsultTime || (dept ? dept.avgConsultTime : 15);

    if (docUser.workingDays && docUser.workingDays.length > 0) {
      const parts = date.split('/');
      const d = new Date(parts[2], parts[1] - 1, parts[0]);
      const dayOfWeek = d.toLocaleDateString('en-GB', { weekday: 'short' });
      if (!docUser.workingDays.includes(dayOfWeek)) {
        return res.status(400).json({ error: `Dr. ${doctor} is not available on ${dayOfWeek} (${date}).` });
      }
    }

    const todayStr = new Date().toLocaleDateString('en-GB');
    if (date === todayStr) {
      const now = new Date();
      const currentHHMM = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
      if (docUser.startTime && currentHHMM < docUser.startTime) {
        return res.status(400).json({ error: `Dr. ${doctor}'s shift hasn't started yet. Starts at ${docUser.startTime}.` });
      }
      if (docUser.endTime && currentHHMM > docUser.endTime) {
        return res.status(400).json({ error: `Dr. ${doctor}'s shift has ended for today. It was until ${docUser.endTime}.` });
      }
    }

    const count = await Token.countDocuments({
      doctorId: docUser._id,
      date,
      status: { $in: ['Waiting', 'Now Serving', 'pending'] }
    });

    const position = count + 1;
    const estimatedMinutes = position * avgTime;
    const estimatedWait = `~${estimatedMinutes} min`;

    const prefix = department.charAt(0).toUpperCase();
    const lastToken = await Token.findOne({ doctorId: docUser._id, date }).sort({ createdAt: -1 });

    let nextNumber = 1;
    if (lastToken && lastToken.tokenId) {
      const parts = lastToken.tokenId.split('-');
      if (parts.length > 1) nextNumber = parseInt(parts[1]) + 1;
    }

    const tokenId = `${prefix}-${nextNumber.toString().padStart(3, '0')}`;
    const bookedTimeDate = new Date();
    bookedTimeDate.setMinutes(bookedTimeDate.getMinutes() + estimatedMinutes);
    const bookedTime = bookedTimeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newToken = new Token({
      patientId: patientId || null,
      doctorId: docUser._id,
      userName: userName || "Patient",
      tokenId,
      department,
      doctor: docUser.name,
      status: 'pending',
      position,
      estimatedWait,
      bookedTime,
      roomNumber: `Room ${Math.floor(Math.random() * 10) + 1}`,
      date
    });

    await newToken.save();
    io.emit('queueUpdate', { department, doctor: docUser.name });
    res.json(newToken);
  } catch (err) {
    console.error("Token creation error:", err);
    res.status(500).json({ error: 'Failed to create token' });
  }
};

// PATCH /api/appointments/:id
const updateAppointment = (io) => async (req, res) => {
  try {
    const { status } = req.body;
    const token = await Token.findByIdAndUpdate(req.params.id, { status }, { new: true });
    io.emit('queueUpdate', { department: token.department });
    res.json(token);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update appointment' });
  }
};

// GET /api/departments
const getDepartments = async (req, res) => {
  try {
    const depts = await Department.find();
    res.json(depts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
};

// GET /api/doctors
const getDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }, '_id name specialization degree license workingDays avgConsultTime startTime endTime');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
};

module.exports = { getServing, getPosition, callNext, markDone, getAppointments, createToken, updateAppointment, getDepartments, getDoctors };
