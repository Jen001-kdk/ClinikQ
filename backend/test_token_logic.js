const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';

async function verifyTokenFix() {
  try {
    console.log('🚀 Starting Verification of Token Generation Fix...');

    // 1. Fetch Doctors to get valid IDs
    const doctorsRes = await axios.get(`${BASE_URL}/doctors`);
    const doctors = doctorsRes.data;
    if (doctors.length < 1) {
      console.error('❌ No doctors found. Please seed some doctors first.');
      return;
    }

    const doc1 = doctors[0];
    const doc2 = doctors[1] || doctors[0]; // If only 1 doctor, use the same for now or different name

    console.log(`Using Doctor 1: ${doc1.name} (${doc1._id})`);
    if (doctors.length > 1) {
      console.log(`Using Doctor 2: ${doc2.name} (${doc2._id})`);
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toLocaleDateString('en-GB');

    // 2. Book first token for Doc 1
    console.log(`\n--- Booking Token 1 for Doc 1 (Date: ${tomorrowStr}) ---`);
    const res1 = await axios.post(`${BASE_URL}/tokens`, {
      doctorId: doc1._id,
      doctor: doc1.name,
      department: doc1.specialization || 'General medicine',
      date: tomorrowStr,
      userName: 'Patient A'
    });
    console.log('Result 1:', res1.data.tokenId, 'Status:', res1.data.status);

    // 3. Book second token for Doc 1
    console.log('\n--- Booking Token 2 for Doc 1 ---');
    const res2 = await axios.post(`${BASE_URL}/tokens`, {
      doctorId: doc1._id,
      doctor: doc1.name,
      department: doc1.specialization || 'General medicine',
      date: tomorrowStr,
      userName: 'Patient B'
    });
    console.log('Result 2:', res2.data.tokenId);

    // Verify Increment
    const num1 = parseInt(res1.data.tokenId.split('-')[1]);
    const num2 = parseInt(res2.data.tokenId.split('-')[1]);
    if (num2 === num1 + 1) {
      console.log('✅ Token incremented correctly for Doc 1.');
    } else {
      console.error(`❌ Token increment failed. Expected ${num1 + 1}, got ${num2}`);
    }

    // 4. Fetch Today's Schedule for Doc 1
    console.log('\n--- Fetching Schedule for Doc 1 (Tomorrow) ---');
    const scheduleRes = await axios.get(`${BASE_URL}/appointments?doctorId=${doc1._id}&date=${tomorrowStr}`);
    console.log('Schedule items found:', scheduleRes.data.length);
    const lastAppt = scheduleRes.data[0];
    console.log('Last Appointment Token:', lastAppt.tokenId, 'Status:', lastAppt.status);
    
    if (lastAppt.status === 'pending') {
      console.log('✅ Status is correctly "pending" as requested.');
    }

    console.log('\n✅ Verification Script Completed.');
  } catch (err) {
    console.error('❌ Verification Failed:', err.response ? err.response.data : err.message);
  }
}

verifyTokenFix();
