const Token = require('../models/Token');
const User = require('../models/User');
const Department = require('../models/Department');
const { getUserByToken } = require('../middleware/auth');

// Helper for consistent date formatting DD/MM/YYYY
const getFormattedDate = () => {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

// GET /api/queue/serving/:department
const getServing = async (req, res) => {
  try {
    const { department } = req.params;
    const { doctor, doctorId } = req.query;
    const today = getFormattedDate();
    
    let query = { status: 'in-progress', date: today };
    
    if (doctorId && doctorId !== 'undefined') {
      query.doctorId = doctorId;
    } else {
      query.department = department;
      if (doctor) query.doctor = doctor;
    }
    
    // FETCH AND POPULATE
    const serving = await Token.findOne(query)
      .populate('patientId', 'full_name');
    
    res.json({ servingToken: serving || null });
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
      status: { $in: ['Waiting', 'in-progress'] },
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

    const today = getFormattedDate();

    // 1. Mark existing in-progress tokens as Completed
    await Token.updateMany(
      { doctorId: user._id, date: today, status: 'in-progress' },
      { status: 'Completed', position: 0 }
    );

    // 2. Find and update the next patient in queue
    const nextPatient = await Token.findOne({
      doctorId: user._id,
      date: today,
      status: { $in: ['Waiting', 'pending'] }
    }).sort({ createdAt: 1 });

    if (nextPatient) {
      nextPatient.status = 'in-progress';
      nextPatient.position = 0;
      await nextPatient.save();

      // Populate for response and notification
      await nextPatient.populate('patientId', 'full_name');
      await nextPatient.populate('doctorId', 'name full_name email role specialization');

      io.emit('notification', {
        userId: nextPatient.userName,
        message: 'It is your turn! Please come to the consultation room.',
        type: 'turn'
      });
    }

    // 3. Broadcast queue update to all listeners
    io.emit('queueUpdate', { doctorId: user._id });
    
    res.json({ 
      success: true, 
      currentPatient: nextPatient, 
      doctorInfo: {
        _id: user._id,
        name: user.name,
        full_name: user.full_name,
        role: user.role,
        specialization: user.specialization
      }
    });
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

    const today = getFormattedDate();

    // Mark current in-progress as Completed
    const updatedToken = await Token.findOneAndUpdate(
      { doctorId: user._id, date: today, status: 'in-progress' },
      { status: 'Completed', position: 0 },
      { new: true }
    );

    if (updatedToken) {
      await updatedToken.populate('patientId', 'full_name');
    }

    // Broadcast update using consistent doctorId
    io.emit('queueUpdate', { doctorId: user._id });
    
    res.json({ 
      success: true, 
      modifiedCount: updatedToken ? 1 : 0,
      patientName: updatedToken?.patientId?.full_name || updatedToken?.userName 
    });
  } catch (err) {
    console.error("Mark Done Error:", err);
    res.status(500).json({ error: 'Failed to complete appointment' });
  }
};

// POST /api/queue/no-show
const markNoShow = (io) => async (req, res) => {
  try {
    const user = await getUserByToken(req);
    if (!user || user.role !== 'doctor') return res.status(401).json({ error: 'Unauthorized' });

    const today = getFormattedDate();

    // 1. Try to mark current in-progress as no-show
    let updatedToken = await Token.findOneAndUpdate(
      { doctorId: user._id, date: today, status: 'in-progress' },
      { status: 'no-show', position: 0 },
      { new: true }
    );

    // 2. Fallback: If no one is in-progress, mark the first pending/Waiting as no-show
    if (!updatedToken) {
      updatedToken = await Token.findOneAndUpdate(
        { doctorId: user._id, date: today, status: { $in: ['Waiting', 'pending'] } },
        { status: 'no-show', position: 0 },
        { new: true, sort: { createdAt: 1 } }
      );
    }

    if (updatedToken) {
      await updatedToken.populate('patientId', 'full_name');
    }

    // Broadcast: This clears the serving status immediately for all screens
    io.emit('queueUpdate', { doctorId: user._id });
    
    res.json({ 
      success: true, 
      modifiedCount: updatedToken ? 1 : 0,
      patientName: updatedToken?.patientId?.full_name || updatedToken?.userName
    });
  } catch (err) {
    console.error("Mark No-Show Error:", err);
    res.status(500).json({ error: 'Failed to mark as no-show' });
  }
};

// GET /api/appointments
const getAppointments = async (req, res) => {
  try {
    const user = await getUserByToken(req);
    const { userName, date, doctor, doctorId, status } = req.query;
    let query = {};

    if (user && user.role === 'doctor') {
      // Priority 1: Logged-in Doctor's ID
      query.doctorId = user._id;
    } else if (userName) {
      // Priority 2: Patient's Username
      query.userName = userName;
    }

    // Manual Overrides / Additional Filters
    if (date) query.date = date;
    if (doctor) query.doctor = doctor;
    if (doctorId && !query.doctorId) query.doctorId = doctorId;
    if (status && status !== 'All') query.status = status;

    const tokens = await Token.find(query)
      .populate('patientId', 'name full_name email role')
      .populate('doctorId', 'name full_name email role specialization')
      .sort({ createdAt: -1 });

    res.json(tokens);
  } catch (err) {
    console.error("Fetch appointments error:", err);
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

    const todayStr = getFormattedDate();
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
      status: { $in: ['Waiting', 'in-progress', 'pending'] }
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
      doctor: docUser.full_name || docUser.name,
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

module.exports = { getServing, getPosition, callNext, markDone, markNoShow, getAppointments, createToken, updateAppointment, getDepartments, getDoctors };
