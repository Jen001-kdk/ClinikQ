const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';

async function testBackend() {
  try {
    console.log('--- Testing Backend API ---');

    // 1. Fetch Departments
    const deptsRes = await axios.get(`${BASE_URL}/departments`);
    console.log('Departments:', deptsRes.data.map(d => d.name));

    // 2. Book a Token
    const bookingData = {
      userName: 'Test User',
      department: 'General Medicine',
      doctor: 'Dr. Mitchell',
      date: new Date().toLocaleDateString('en-GB')
    };
    const bookRes = await axios.post(`${BASE_URL}/tokens`, bookingData);
    console.log('Token Booked:', bookRes.data.tokenId, 'Position:', bookRes.data.position);

    // 3. Fetch Appointments
    const apptsRes = await axios.get(`${BASE_URL}/appointments?userName=Test User`);
    console.log('Total Appointments for Test User:', apptsRes.data.length);

    // 4. Cancel Appointment
    const tokenId = bookRes.data._id;
    const cancelRes = await axios.patch(`${BASE_URL}/appointments/${tokenId}`, { status: 'Cancelled' });
    console.log('Appointment Cancelled logic status:', cancelRes.data.status);

    console.log('--- Backend Test Completed Successfully ---');
  } catch (err) {
    console.error('Backend Test Failed:', err.response ? err.response.data : err.message);
  }
}

testBackend();
