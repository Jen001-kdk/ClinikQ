const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const mongoURI = 'mongodb://127.0.0.1:27017/clinicq';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'patient' },
  age: String,
  gender: String,
  bloodType: String,
  contact: String,
  address: String,
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

async function debugUpdate() {
  await mongoose.connect(mongoURI);
  console.log("Connected to DB");

  const email = 'dr.test@clinikq.com';
  const user = await User.findOne({ email });
  
  if (!user) {
    console.log("User not found!");
    process.exit(1);
  }

  console.log("Found user:", user.name, "Role:", user.role);
  console.log("Current startTime:", user.startTime);

  // Simulation of PUT logic
  const body = {
    name: "DR. TEST UPDATED",
    startTime: "08:15",
    endTime: "21:45"
  };

  user.name = body.name || user.name;
  if (user.role === 'doctor') {
    if (body.startTime) user.startTime = body.startTime;
    if (body.endTime) user.endTime = body.endTime;
  }

  console.log("Modified local user object. startTime is now:", user.startTime);
  
  await user.save();
  console.log("Called user.save()");

  const refreshedUser = await User.findOne({ email });
  console.log("Refetched user from DB. startTime is:", refreshedUser.startTime);
  console.log("Refetched name is:", refreshedUser.name);

  if (refreshedUser.startTime === "08:15" && refreshedUser.name === "DR. TEST UPDATED") {
    console.log("SUCCESS: Simulation works. The issue is likely in the specific server instance or request handling.");
  } else {
    console.log("FAILURE: Simulation failed to persist!");
  }

  process.exit(0);
}

debugUpdate().catch(err => {
  console.error(err);
  process.exit(1);
});
