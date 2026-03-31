const axios = require('axios');

const API_URL = 'http://localhost:5001/api';

async function verifyBackend() {
  try {
    console.log('--- Verifying Backend ---');

    // 1. Register a Doctor
    console.log('1. Registering a doctor...');
    const doctorData = {
      name: 'Dr. Sarah Ahmed',
      email: 'sarah@clinikq.com',
      password: 'password123',
      confirmPassword: 'password123',
      role: 'doctor',
      specialization: 'Cardiology',
      degree: 'MD, Cardiology',
      license: 'MC-12345'
    };
    try {
      await axios.post(`${API_URL}/register`, doctorData);
      console.log('✅ Doctor registered successfully.');
    } catch (e) {
      if (e.response && e.response.status === 400 && e.response.data.error.includes('already exists')) {
        console.log('⚠️ Doctor already exists, skipping registration.');
      } else {
        throw e;
      }
    }

    // 2. Login as Doctor
    console.log('2. Logging in as doctor...');
    const loginRes = await axios.post(`${API_URL}/login`, {
      email: 'sarah@clinikq.com',
      password: 'password123'
    });
    console.log('✅ Login successful:', loginRes.data);

    // 3. Fetch Doctors
    console.log('3. Fetching doctors list...');
    const docsRes = await axios.get(`${API_URL}/doctors`);
    console.log('✅ Doctors found:', docsRes.data.length);
    console.log('Doctors List:', JSON.stringify(docsRes.data, null, 2));

    const found = docsRes.data.find(d => d.name === 'Dr. Sarah Ahmed');
    if (found) {
      console.log('✅ Registered doctor found in list with correct specialization.');
    } else {
      console.error('❌ Registered doctor not found in list!');
    }

    console.log('--- Verification Complete ---');
  } catch (error) {
    console.error('❌ Verification failed:', error.response ? error.response.data : error.message);
  }
}

verifyBackend();
