const User = require('../models/User');
const Token = require('../models/Token');
const Report = require('../models/Report');
const { getUserByToken } = require('../middleware/auth');

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

const dummyHistory = {
  "P-1001": [{ date: "2025-01-15", diagnosis: "Routine physical examination; all vitals normal", prescription: ["Vitamin D 1000IU daily", "Multivitamin once daily"] }],
  "P-1002": [{ date: "2024-12-08", diagnosis: "Mild eczema on arms", prescription: ["Topical hydrocortisone cream twice a day"] }],
  "P-1003": [{ date: "2024-11-22", diagnosis: "Vitamin D deficiency detected in blood work", prescription: ["Cholecalciferol 60000 IU - once weekly for 8 weeks", "Calcium supplement 500mg - once daily", "Increase sun exposure 15 mins daily", "Repeat blood work after 8 weeks"] }],
};

// GET /api/patient/stats
const getPatientStats = async (req, res) => {
  try {
    const { userName } = req.query;
    if (!userName) return res.status(400).json({ error: 'userName required' });
    const totalVisits = await Token.countDocuments({ userName, status: 'Completed' });
    const reportsCount = await Report.countDocuments({ userName });
    const alertsCount = 3;
    res.json({ totalVisits, reportsCount, alertsCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch patient stats' });
  }
};

// GET /api/patient/reports
const getPatientReports = async (req, res) => {
  try {
    const { userName } = req.query;
    const reports = await Report.find({ userName }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};

// GET /api/patients
const getAllPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' }, 'name email age gender contact address patientId createdAt').sort({ createdAt: -1 });
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
};

// GET /api/patients/:id/history
const getPatientHistory = (req, res) => {
  const { id } = req.params;
  const history = dummyHistory[id] || [];
  return res.json(history);
};

// GET /api/records
const getRecords = (req, res) => {
  const { patient, date } = req.query;
  let result = dummyRecords;
  if (patient) result = result.filter(r => r.patient === patient);
  if (date) { const q = date.toLowerCase(); result = result.filter(r => r.date.toLowerCase().includes(q)); }
  return res.json(result);
};

// GET /api/records/:id
const getRecord = (req, res) => {
  const rec = dummyRecords.find(r => r.id === req.params.id);
  if (!rec) return res.status(404).json({ error: 'Not found' });
  return res.json(rec);
};

// GET /api/users/profile
const getProfile = async (req, res) => {
  try {
    const user = await getUserByToken(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    if (user.role === 'patient' && !user.patientId) {
      const randomId = Math.floor(1000 + Math.random() * 9000);
      user.patientId = `PAT-${randomId}`;
      await user.save();
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// PUT /api/users/profile
const updateProfile = async (req, res) => {
  try {
    const user = await getUserByToken(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const {
      name, age, gender, bloodType, contact, address,
      workingDays, specialization, license, degree,
      startTime, endTime, maxPatients, avgConsultTime
    } = req.body;

    if (name) user.name = name;
    user.age = age || user.age;
    user.gender = gender || user.gender;
    user.bloodType = bloodType || user.bloodType;
    user.contact = contact || user.contact;
    user.address = address || user.address;

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
};

module.exports = { getPatientStats, getPatientReports, getAllPatients, getPatientHistory, getRecords, getRecord, getProfile, updateProfile };
