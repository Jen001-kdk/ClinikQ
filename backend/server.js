const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"]
  }
});

app.use(express.json());
app.use(cors());

// Load environment variables (optional). Create a `.env` file with MONGO_URI to override.
require('dotenv').config();

// Default to a local MongoDB instance for easier local development.
// If you want to use an Atlas cluster, set MONGO_URI in a `.env` file.
const DEFAULT_MONGO_URI = 'mongodb://127.0.0.1:27017/clinicq';
const mongoURI = (process.env.MONGO_URI || DEFAULT_MONGO_URI).trim();

// Mongoose connection (Mongoose 9 defaults to the new parser & topology engine).
mongoose.set('strictQuery', false);

mongoose.connect(mongoURI)
  .then(() => {
    const isLocal = mongoURI.includes('127.0.0.1');
    console.log(`✅ Connected to ${isLocal ? 'local' : 'Atlas'} MongoDB`);
    seedDepartments();
  })
  .catch(err => {
    console.error('❌ Database Connection Error Details:', err.message);
  });

// Blueprint for User (with timestamps)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  full_name: String, // Keeping for backward compatibility
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'patient' },
  // Patient Fields
  age: String,
  gender: String,
  bloodType: String,
  contact: String,
  address: String,
  patientId: { type: String, unique: true, sparse: true },
  // Doctor Fields
  degree: String,
  specialization: String,
  license: String,
  workingDays: { type: [String], default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  startTime: { type: String, default: '09:00' },
  endTime: { type: String, default: '17:00' },
  maxPatients: { type: Number, default: 30 },
  avgConsultTime: { type: Number, default: 15 }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  avgConsultTime: { type: Number, default: 15 } // minutes
});
const Department = mongoose.model('Department', departmentSchema);

const tokenSchema = new mongoose.Schema({
  userId: { type: String }, // Keep for backward compatibility if needed
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  tokenId: String, // e.g., A-048
  department: String,
  doctor: String,
  status: { type: String, enum: ['Waiting', 'Now Serving', 'Completed', 'Cancelled', 'pending'], default: 'pending' },
  position: Number,
  estimatedWait: String,
  bookedTime: String,
  roomNumber: { type: String, default: 'Room 4' },
  date: { type: String, default: () => new Date().toLocaleDateString('en-GB') }
}, { timestamps: true });

const Token = mongoose.model('Token', tokenSchema);

const reportSchema = new mongoose.Schema({
  userName: String,
  doctor: String,
  department: String,
  date: { type: String, default: () => new Date().toLocaleDateString('en-GB') },
  type: String,
  status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
  files: { type: Number, default: 1 }
}, { timestamps: true });

const Report = mongoose.model('Report', reportSchema);

async function seedDepartments() {
  const depts = [
    { name: 'General Medicine', avgConsultTime: 15 },
    { name: 'Orthopedics', avgConsultTime: 20 },
    { name: 'Cardiology', avgConsultTime: 25 }
  ];
  try {
    // Delete all existing departments first (Data Reset)
    await Department.deleteMany({});
    console.log('🗑️  Old departments cleared.');

    for (const d of depts) {
      await Department.findOneAndUpdate({ name: d.name }, d, { upsert: true });
    }
    console.log('✅ New departments seeded successfully.');

    // Seed dummy reports for the current user if any
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


//Register API
app.post('/api/register', async (req, res) => {
  try {
    const { 
      name, email, password, role, 
      age, gender, bloodType, contact, address,
      degree, specialization, license 
    } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate a unique patient ID (e.g., PAT-1234)
    let patientId = null;
    if (role === 'patient') {
      const randomId = Math.floor(1000 + Math.random() * 9000);
      patientId = `PAT-${randomId}`;
    }

    const newUser = new User({ 
      name, email, password: hashedPassword, role,
      age, gender, bloodType, contact, address,
      degree, specialization, license,
      patientId
    });
    
    await newUser.save();
    res.status(201).json({ message: "Account created successfully!" });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: "Email already exists!" });
      return;
    }

    const errorMsg = error.message || "Unknown error";
    const isDbDown = error.name === 'MongooseServerSelectionError' || /ECONNREFUSED|buffering timed out/i.test(errorMsg);
    const details = isDbDown
      ? "Database connection failed. Make sure MongoDB is running and MONGO_URI is correct."
      : errorMsg;

    console.error("Registration error:", error);

    // Log to a file we can read
    const logEntry = `[${new Date().toISOString()}] Registration error: ${errorMsg}\n${error.stack}\n\n`;
    fs.appendFileSync(path.join(__dirname, 'error.log'), logEntry);

    res.status(500).json({ 
      error: "Registration failed!", 
      details
    });
  }
});

//Login API
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    //Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found!" });
    }

    //Compare the typed password with the hashed password in DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password!" });
    }

    // 3. If everything is correct, send the user data
    res.status(200).json({
      message: "Login successful",
      token: "dummy-jwt-token-" + user._id, // Placeholder token
      full_name: user.full_name || user.name,
      role: user.role,
      specialization: user.role === 'doctor' ? user.specialization : undefined
    });

  } catch (error) {
    res.status(500).json({ message: "Server error! Please try again." });
  }
});

// --- additional endpoints for dashboard data --------------------------------------------------

// sample in-memory data; replace with real DB queries later
const dummySummary = {
  doctorName: "Arvind Mehta",
  date: new Date().toLocaleDateString('en-GB', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  }),
  stats: {
    patientsSeen: 1218,
    patientsWaiting: 45,
    pendingReports: 12,
    completedReports: 30,
    trends: {
      patientsTrend: "+12 this month",
      appointmentsStatus: "8 remaining",
      reportsUrgency: "! 3 urgent",
      completedBadge: "+5 today"
    }
  },
  cards: {
    totalAppointments: 45,
    avgWait: 14, // minutes
    completionRate: "85%"
  },
  nextPatient: {
    name: "Ravi Kumar",
    time: "10:30 AM",
    department: "General Checkup",
    token: "3"
  }
};

// Admin summary endpoint (uses real DB data when possible)
app.get('/api/admin/summary', async (req, res) => {
  try {
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    // treat any user with role "pending" as pending approval
    const pendingApprovals = await User.countDocuments({ role: 'pending' });

    return res.json({ totalPatients, totalDoctors, totalAdmins, pendingApprovals });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// Return list of all users for admin
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await User.find({}, 'name email role createdAt');
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// update role for a given user
app.put('/api/admin/users/:id/role', async (req, res) => {
  const { role } = req.body;
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update role' });
  }
});

// delete a user
app.delete('/api/admin/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    return res.json({ message: 'User deleted' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete user' });
  }
});

const dummyAppointments = [
  { name: "John Anderson", time: "2:45 PM", token: "#102", status: "In queue" },
  { name: "Sara Lee", time: "3:00 PM", token: "#103", status: "Waiting" },
  { name: "Mark Twain", time: "3:30 PM", token: "#104", status: "Emergency" }
];

app.get('/api/doctor/summary', async (req, res) => {
  try {
    const user = await getUserByToken(req);
    if (!user || user.role !== 'doctor') {
      return res.status(401).json({ error: 'Unauthorized role' });
    }

    // Calculate real stats for this doctor
    const today = new Date().toLocaleDateString('en-GB');
    const [patientsWaiting, completedToday, totalPatients, pendingReports] = await Promise.all([
      Token.countDocuments({ doctorId: user._id, date: today, status: { $in: ['Waiting', 'pending'] } }),
      Token.countDocuments({ doctorId: user._id, date: today, status: 'Completed' }),
      Token.countDocuments({ doctorId: user._id }),
      Report.countDocuments({ doctorId: user._id, status: 'pending' })
    ]);

    // Return the real doctor's information plus summary stats
    const response = {
      ...dummySummary, 
      doctorName: user.name,
      specialization: user.specialization || 'Medical Specialist',
      stats: {
        ...dummySummary.stats,
        patientsWaiting,
        patientsSeen: totalPatients,
        pendingReports,
        completedReports: completedToday
      },
      date: new Date().toLocaleDateString('en-GB', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      })
    };

    return res.json(response);
  } catch (err) {
    console.error('Summary error:', err);
    return res.status(500).json({ error: 'Failed to fetch doctor summary' });
  }
});

// Hourly patient volume for the chart
app.get('/api/doctor/stats', (req, res) => {
  const hourlyData = [
    { time: '8 AM', patients: 3 },
    { time: '9 AM', patients: 8 },
    { time: '10 AM', patients: 15 },
    { time: '11 AM', patients: 22 },
    { time: '12 PM', patients: 18 },
    { time: '1 PM', patients: 14 },
    { time: '2 PM', patients: 9 },
    { time: '3 PM', patients: 20 },
    { time: '4 PM', patients: 25, peak: true },
    { time: '5 PM', patients: 16 },
    { time: '6 PM', patients: 7 }
  ];
  return res.json(hourlyData);
});

// maintain appointments in memory (in real app store in DB)
const appointments = [...dummyAppointments];

// Fetch all registered doctors
app.get('/api/doctors', async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }, '_id name specialization degree license workingDays avgConsultTime startTime endTime');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

app.get('/api/appointments', async (req, res) => {
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
});

app.post('/api/tokens', async (req, res) => {
  try {
    const { userName, department, doctor, date, patientId, doctorId } = req.body;
    if (!department || !doctor || !date) {
      return res.status(400).json({ error: 'department, doctor, and date are required' });
    }

    // Fetch the doctor's document to get their specific settings
    const docUser = doctorId 
      ? await User.findById(doctorId) 
      : await User.findOne({ name: doctor, role: 'doctor' });
      
    if (!docUser) {
      return res.status(404).json({ error: `Doctor ${doctor} not found.` });
    }

    const dept = await Department.findOne({ name: department });
    let avgTime = docUser.avgConsultTime || (dept ? dept.avgConsultTime : 15);

    // Check if it's a working day for the doctor
    if (docUser.workingDays && docUser.workingDays.length > 0) {
       const parts = date.split('/');
       const d = new Date(parts[2], parts[1]-1, parts[0]);
       const dayOfWeek = d.toLocaleDateString('en-GB', { weekday: 'short' });
       
       if (!docUser.workingDays.includes(dayOfWeek)) {
          return res.status(400).json({ error: `Dr. ${doctor} is not available on ${dayOfWeek} (${date}).` });
       }
    }

    // Shift timing check for today
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

    // Count people ahead in the same department/doctor today
    const queryDate = date; 
    const count = await Token.countDocuments({ 
      doctorId: docUser._id, 
      date: queryDate, 
      status: { $in: ['Waiting', 'Now Serving', 'pending'] } 
    });
    
    const position = count + 1;
    const estimatedMinutes = position * avgTime;
    const estimatedWait = `~${estimatedMinutes} min`;

    // Generate tokenId (e.g., A-001) incrementing correctly for the doctor
    const prefix = department.charAt(0).toUpperCase();
    
    // Find the last token for this doctor TODAY
    const lastToken = await Token.findOne({ 
      doctorId: docUser._id, 
      date: queryDate 
    }).sort({ createdAt: -1 });

    let nextNumber = 1;
    if (lastToken && lastToken.tokenId) {
      const parts = lastToken.tokenId.split('-');
      if (parts.length > 1) {
        nextNumber = parseInt(parts[1]) + 1;
      }
    }
    
    const tokenId = `${prefix}-${nextNumber.toString().padStart(3, '0')}`;

    // Token time = now + total estimated minutes for the queue
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
      date: queryDate
    });

    await newToken.save();
    io.emit('queueUpdate', { department, doctor: docUser.name });

    res.json(newToken);
  } catch (err) {
    console.error("Token creation error:", err);
    res.status(500).json({ error: 'Failed to create token' });
  }
});

app.patch('/api/appointments/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const token = await Token.findByIdAndUpdate(req.params.id, { status }, { new: true });
    io.emit('queueUpdate', { department: token.department });
    res.json(token);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

app.get('/api/departments', async (req, res) => {
  try {
    const depts = await Department.find();
    res.json(depts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// Patient Dashboard Stats
app.get('/api/patient/stats', async (req, res) => {
  try {
    const { userName } = req.query;
    if (!userName) return res.status(400).json({ error: 'userName required' });

    const totalVisits = await Token.countDocuments({ userName, status: 'Completed' });
    const reportsCount = await Report.countDocuments({ userName });
    const alertsCount = 3; // Mocking alerts for now

    res.json({ totalVisits, reportsCount, alertsCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch patient stats' });
  }
});

// Patient Reports
app.get('/api/patient/reports', async (req, res) => {
  try {
    const { userName } = req.query;
    const reports = await Report.find({ userName }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Get currently serving token for a department/doctor
app.get('/api/queue/serving/:department', async (req, res) => {
  try {
    const { department } = req.params;
    const { doctor } = req.query; // New search filter
    
    let query = { 
      department, 
      status: 'Now Serving',
      date: new Date().toLocaleDateString('en-GB')
    };
    
    if (doctor) query.doctor = doctor;

    const serving = await Token.findOne(query).sort({ updatedAt: -1 });
    
    res.json(serving || { tokenId: '--', position: 0 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch serving status' });
  }
});

// Calculate how many patients are ahead of a specific token
app.get('/api/queue/position/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;
    const currentToken = await Token.findOne({ tokenId });
    
    if (!currentToken) return res.status(404).json({ error: 'Token not found' });
    
    // Logic: count how many tokens are ahead (status = waiting or in-progress and created before current token)
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
});

// --- Profile Endpoints ---

// Midleware-like helper to get user from dummy token
const getUserByToken = async (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer dummy-jwt-token-')) return null;
  const userId = authHeader.replace('Bearer dummy-jwt-token-', '');
  if (!mongoose.Types.ObjectId.isValid(userId)) return null;
  return await User.findById(userId).select('-password');
};

app.get('/api/users/profile', async (req, res) => {
  try {
    const user = await getUserByToken(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    
    // Ensure patientId exists for older records
    if (user.role === 'patient' && !user.patientId) {
      const randomId = Math.floor(1000 + Math.random() * 9000);
      user.patientId = `PAT-${randomId}`;
      await user.save();
    }
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

app.put('/api/users/profile', async (req, res) => {
  try {
    const user = await getUserByToken(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { 
      name, age, gender, bloodType, contact, address, 
      workingDays, specialization, license, degree,
      startTime, endTime, maxPatients, avgConsultTime
    } = req.body;
    
    // Core fields
    if (name) user.name = name;
    user.age = age || user.age;
    user.gender = gender || user.gender;
    user.bloodType = bloodType || user.bloodType;
    user.contact = contact || user.contact;
    user.address = address || user.address;

    // Doctor specifically
    if (user.role === 'doctor') {
      if (workingDays) user.workingDays = workingDays;
      if (specialization) user.specialization = specialization;
      if (license) user.license = license;
      if (degree) user.degree = degree;
      if (startTime) user.startTime = startTime;
      if (endTime) user.endTime = endTime;
      if (maxPatients) user.maxPatients = maxPatients;
      if (avgConsultTime) user.avgConsultTime = avgConsultTime;
    }

    console.log("Updating profile for user:", user.email, "Data:", req.body);
    await user.save();
    console.log("Profile saved successfully for:", user.email);
    res.json(user);
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// --- Queue Management API ---

app.post('/api/queue/next', async (req, res) => {
  try {
    const user = await getUserByToken(req);
    if (!user || user.role !== 'doctor') return res.status(401).json({ error: 'Unauthorized' });

    const today = new Date().toLocaleDateString('en-GB');

    // 1. Mark current 'Now Serving' as 'Completed'
    await Token.updateMany(
      { doctorId: user._id, date: today, status: 'Now Serving' },
      { status: 'Completed', position: 0 }
    );

    // 2. Find next 'Waiting' or 'pending' patient
    const nextPatient = await Token.findOne({ 
      doctorId: user._id, 
      date: today, 
      status: { $in: ['Waiting', 'pending'] } 
    }).sort({ createdAt: 1 });

    if (nextPatient) {
      nextPatient.status = 'Now Serving';
      nextPatient.position = 0;
      await nextPatient.save();
      
      // Emit socket notification for the specific user
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
});

app.post('/api/queue/done', async (req, res) => {
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
});


// ----- medical records endpoints ----
const dummyRecords = [
  { id: 'R-1001', patient: 'John Doe', date: 'Jan 15, 2025', doctor: 'Dr. Sarah Mitchell', department: 'General Medicine', diagnosis: 'Seasonal flu with mild fever', prescription: ['Paracetamol 500mg', 'Rest at home'] },
  { id: 'R-1002', patient: 'John Doe', date: 'Dec 8, 2024', doctor: 'Dr. Emily Chen', department: 'Dermatology', diagnosis: 'Contact dermatitis on forearms', prescription: ['Hydrocortisone cream'] },
  { id: 'R-1003', patient: 'John Doe', date: 'Nov 22, 2024', doctor: 'Dr. Michael Brown', department: 'General Medicine', diagnosis: 'Vitamin D deficiency detected in blood work', prescription: ['Vitamin D supplements'] },
  { id: 'R-1004', patient: 'John Doe', date: 'Oct 30, 2024', doctor: 'Dr. Raj Patel', department: 'Dermatology', diagnosis: 'Mild eczema flare-up on hands', prescription: ['Moisturizing cream'] },
  { id: 'R-1005', patient: 'John Doe', date: 'Sep 14, 2024', doctor: 'Dr. Sarah Mitchell', department: 'General Medicine', diagnosis: 'Mild hypertension, prescribed ACE inhibitors', prescription: ['Lisinopril'] },
  { id: 'R-1006', patient: 'John Doe', date: 'Aug 3, 2024', doctor: 'Dr. Emily Chen', department: 'Dermatology', diagnosis: 'Acne vulgaris, moderate severity', prescription: ['Topical retinoid'] },
  { id: 'R-1007', patient: 'John Doe', date: 'Jul 19, 2024', doctor: 'Dr. Michael Brown', department: 'General Medicine', diagnosis: 'Upper respiratory tract infection', prescription: ['Ibuprofen', 'Plenty of fluids'] },
  { id: 'R-1008', patient: 'John Doe', date: 'Jun 11, 2024', doctor: 'Dr. Raj Patel', department: 'Dermatology', diagnosis: 'Fungal infection on feet (tinea pedis)', prescription: ['Antifungal cream'] },
];

app.get('/api/records', (req, res) => {
  const { patient, date } = req.query;
  let result = dummyRecords;
  if (patient) {
    result = result.filter(r => r.patient === patient);
  }
  if (date) {
    const q = date.toLowerCase();
    result = result.filter(r => r.date.toLowerCase().includes(q));
  }
  return res.json(result);
});

app.get('/api/records/:id', (req, res) => {
  const rec = dummyRecords.find(r => r.id === req.params.id);
  if (!rec) return res.status(404).json({ error: 'Not found' });
  return res.json(rec);
});


// ---------------------------------------------------------------------------------------------

// dummy patients list for doctor view
const dummyPatients = [
  { name: "Arjun Sharma", id: "P001", age: "34", gender: "Male", contact: "+91 98765 43210", lastVisit: "18 Mar 2026", visitRelative: "4 days ago", addedBy: "Doctor", status: "Completed" },
  { name: "Priya Nair", id: "P002", age: "28", gender: "Female", contact: "+91 87654 32109", lastVisit: "20 Mar 2026", visitRelative: "2 days ago", addedBy: "Admin", status: "Pending" },
  { name: "Ravi Kumar", id: "P003", age: "52", gender: "Male", contact: "+91 76543 21098", lastVisit: "15 Mar 2026", visitRelative: "7 days ago", addedBy: "Admin", status: "Completed" },
  { name: "Sunita Mehta", id: "P004", age: "41", gender: "Female", contact: "+91 65432 10987", lastVisit: "21 Mar 2026", visitRelative: "Yesterday", addedBy: "Doctor", status: "Pending" },
  { name: "David Kumar", id: "P-1005", age: "45", gender: "Male", contact: "+91 54321 09876", lastVisit: "2024-08-03", visitRelative: "7 months ago", addedBy: "Admin", status: "Completed" },
  { name: "Lisa Thompson", id: "P-1006", age: "29", gender: "Female", contact: "+91 43210 98765", lastVisit: "2025-01-10", visitRelative: "2 months ago", addedBy: "Doctor", status: "Pending" },
  { name: "James Martinez", id: "P-1007", age: "38", gender: "Male", contact: "+91 32109 87654", lastVisit: "2024-07-19", visitRelative: "8 months ago", addedBy: "Admin", status: "Completed" },
  { name: "Rachel Green", id: "P-1008", age: "31", gender: "Female", contact: "+91 21098 76543", lastVisit: "2024-06-11", visitRelative: "9 months ago", addedBy: "Doctor", status: "Pending" },
];

// history records keyed by patient ID
const dummyHistory = {
  "P-1001": [
    {
      date: "2025-01-15",
      diagnosis: "Routine physical examination; all vitals normal",
      prescription: ["Vitamin D 1000IU daily", "Multivitamin once daily"],
    },
  ],
  "P-1002": [
    {
      date: "2024-12-08",
      diagnosis: "Mild eczema on arms",
      prescription: ["Topical hydrocortisone cream twice a day"],
    },
  ],
  "P-1003": [
    {
      date: "2024-11-22",
      diagnosis: "Vitamin D deficiency detected in blood work",
      prescription: [
        "Cholecalciferol 60000 IU - once weekly for 8 weeks",
        "Calcium supplement 500mg - once daily",
        "Increase sun exposure 15 mins daily",
        "Repeat blood work after 8 weeks",
      ],
    },
  ],
  // additional sample records could be added here
};

app.get('/api/patients', async (req, res) => {
  try {
    // Return real patients from MongoDB
    const patients = await User.find({ role: 'patient' }, 'name email age gender contact address patientId createdAt').sort({ createdAt: -1 });
    // Map to a shape compatible with both Doctor and Admin dashboards
    const mapped = patients.map(p => ({
      _id: p._id,
      id: p.patientId || p._id.toString(),
      name: p.name,
      email: p.email,
      age: p.age || '--',
      gender: p.gender || '--',
      contact: p.contact || '--',
      address: p.address || '--',
      lastVisit: p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '--',
      status: 'Active',
    }));
    return res.json(mapped);
  } catch (err) {
    console.error('Failed to fetch patients:', err);
    return res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// endpoint to fetch history for a particular patient
app.get('/api/patients/:id/history', (req, res) => {
  const { id } = req.params;
  const history = dummyHistory[id] || [];
  return res.json(history);
});

// ---- Admin Queue endpoint: all tokens with populated patient/doctor names ----
app.get('/api/admin/queue', async (req, res) => {
  try {
    const today = new Date().toLocaleDateString('en-GB');
    const { date } = req.query;
    const queryDate = date || today;

    const tokens = await Token.find({ date: queryDate })
      .populate('patientId', 'name patientId email')
      .populate('doctorId', 'name specialization')
      .sort({ createdAt: -1 });

    const stats = {
      total: tokens.length,
      waiting: tokens.filter(t => t.status === 'Waiting' || t.status === 'pending').length,
      inProgress: tokens.filter(t => t.status === 'Now Serving').length,
      completed: tokens.filter(t => t.status === 'Completed').length,
      cancelled: tokens.filter(t => t.status === 'Cancelled').length,
    };

    res.json({ tokens, stats });
  } catch (err) {
    console.error('Admin queue error:', err);
    res.status(500).json({ error: 'Failed to fetch admin queue' });
  }
});

// Admin: update token status (complete / cancel)
app.patch('/api/admin/queue/:id', async (req, res) => {
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
});

// Admin: generate token on behalf of a patient
app.post('/api/admin/token', async (req, res) => {
  try {
    const { patientId, doctorId, department, timeSlot } = req.body;
    if (!patientId || !doctorId || !department) {
      return res.status(400).json({ error: 'patientId, doctorId, and department are required' });
    }

    const patient = await User.findById(patientId);
    const doctor = await User.findById(doctorId);
    if (!patient || !doctor) return res.status(404).json({ error: 'Patient or Doctor not found' });

    const today = new Date().toLocaleDateString('en-GB');
    const count = await Token.countDocuments({ doctorId: doctor._id, date: today, status: { $in: ['Waiting', 'Now Serving', 'pending'] } });
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
});

server.listen(5001, () => console.log("🚀 Backend Server is running on Port 5001"));