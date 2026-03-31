const mongoose = require('mongoose');
require('dotenv').config();

const DEFAULT_MONGO_URI = 'mongodb://127.0.0.1:27017/clinicq';
const mongoURI = (process.env.MONGO_URI || DEFAULT_MONGO_URI).trim();

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'patient' } 
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function test() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoURI);
    console.log("Connected successfully!");
    
    const count = await User.countDocuments();
    console.log(`Total users: ${count}`);
    
    const users = await User.find({}, 'name email role');
    console.log("Users in DB:");
    users.forEach(u => console.log(`- ${u.name} (${u.email}) [${u.role}]`));
    
    process.exit(0);
  } catch (err) {
    console.error("Connection failed!", err);
    process.exit(1);
  }
}

test();
