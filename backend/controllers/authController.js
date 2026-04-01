const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');

// POST /api/register
const register = async (req, res) => {
  try {
    const {
      name, email, password, role,
      age, gender, bloodType, contact, address,
      degree, specialization, license
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

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

    const logEntry = `[${new Date().toISOString()}] Registration error: ${errorMsg}\n${error.stack}\n\n`;
    fs.appendFileSync(path.join(__dirname, '../error.log'), logEntry);

    res.status(500).json({ error: "Registration failed!", details });
  }
};

// POST /api/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password!" });
    }

    res.status(200).json({
      message: "Login successful",
      token: "dummy-jwt-token-" + user._id,
      full_name: user.full_name || user.name,
      role: user.role,
      specialization: user.role === 'doctor' ? user.specialization : undefined
    });
  } catch (error) {
    res.status(500).json({ message: "Server error! Please try again." });
  }
};

module.exports = { register, login };
