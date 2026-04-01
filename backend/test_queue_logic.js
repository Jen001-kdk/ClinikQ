const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';

async function testCallNext() {
  try {
    console.log('🚀 Testing "Call Next" with pending status...');

    // 1. Login as Dr. Sarah Johar (get token)
    const loginRes = await axios.post(`${BASE_URL}/login`, {
      email: 'sarah@clinikq.com',
      password: 'password123'
    });
    const token = loginRes.data.token;
    const doctorId = loginRes.data.user._id;

    // 2. Book a "pending" token for her
    const today = new Date().toLocaleDateString('en-GB');
    const bookRes = await axios.post(`${BASE_URL}/tokens`, {
      doctorId: doctorId,
      doctor: 'Dr. Sarah Johar',
      department: 'Cardiology',
      date: today,
      userName: 'Queue Test Patient'
    });
    console.log('Booked Token:', bookRes.data.tokenId, 'Status:', bookRes.data.status);

    // 3. Call Next
    console.log('\n--- Calling Next ---');
    const nextRes = await axios.post(`${BASE_URL}/queue/next`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (nextRes.data.nextPatient && nextRes.data.nextPatient.tokenId === bookRes.data.tokenId) {
       console.log('✅ PASS: Next patient successfully called and status is Now Serving');
       console.log('New Status:', nextRes.data.nextPatient.status);
    } else {
       console.log('❌ FAIL: Failed to call the pending patient.');
       console.log('Response:', nextRes.data);
    }

  } catch (err) {
    console.error('Test Failed:', err.response ? err.response.data : err.message);
  }
}

testCallNext();
