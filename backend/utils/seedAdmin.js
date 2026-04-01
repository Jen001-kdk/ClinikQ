const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/clinicq';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'patient' }
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    await mongoose.connect(mongoURI.trim());
    console.log('Connected to MongoDB');

    const adminEmail = 'admin@gmail.com';
    const plainPassword = 'admin'; // User can change this

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const result = await User.findOneAndUpdate(
      { email: adminEmail },
      { 
        name: 'System Admin',
        password: hashedPassword,
        role: 'admin'
      },
      { upsert: true, new: true }
    );

    console.log(`✅ Admin user ${adminEmail} ${result.upserted ? 'created' : 'updated'} with hashed password.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

createAdmin();
