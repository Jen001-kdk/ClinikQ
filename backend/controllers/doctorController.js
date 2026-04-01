const User = require('../models/User');
const Token = require('../models/Token');
const Report = require('../models/Report');
const { getUserByToken } = require('../middleware/auth');

const dummySummary = {
  doctorName: "Arvind Mehta",
  date: new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
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
  cards: { totalAppointments: 45, avgWait: 14, completionRate: "85%" },
  nextPatient: { name: "Ravi Kumar", time: "10:30 AM", department: "General Checkup", token: "3" }
};

// GET /api/doctor/summary
const getSummary = async (req, res) => {
  try {
    const user = await getUserByToken(req);
    if (!user || user.role !== 'doctor') {
      return res.status(401).json({ error: 'Unauthorized role' });
    }

    const today = new Date().toLocaleDateString('en-GB');
    const [patientsWaiting, completedToday, totalPatients, pendingReports] = await Promise.all([
      Token.countDocuments({ doctorId: user._id, date: today, status: { $in: ['Waiting', 'pending'] } }),
      Token.countDocuments({ doctorId: user._id, date: today, status: 'Completed' }),
      Token.countDocuments({ doctorId: user._id }),
      Report.countDocuments({ doctorId: user._id, status: 'pending' })
    ]);

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
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      })
    };

    return res.json(response);
  } catch (err) {
    console.error('Summary error:', err);
    return res.status(500).json({ error: 'Failed to fetch doctor summary' });
  }
};

// GET /api/doctor/stats
const getStats = (req, res) => {
  const hourlyData = [
    { time: '8 AM', patients: 3 }, { time: '9 AM', patients: 8 },
    { time: '10 AM', patients: 15 }, { time: '11 AM', patients: 22 },
    { time: '12 PM', patients: 18 }, { time: '1 PM', patients: 14 },
    { time: '2 PM', patients: 9 }, { time: '3 PM', patients: 20 },
    { time: '4 PM', patients: 25, peak: true }, { time: '5 PM', patients: 16 },
    { time: '6 PM', patients: 7 }
  ];
  return res.json(hourlyData);
};

module.exports = { getSummary, getStats };
