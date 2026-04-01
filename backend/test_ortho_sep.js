const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';

async function verifyOrthoDocs() {
  try {
    const doc1 = { _id: "69c79988be456583e4ce1cbf", name: "Dr. Noora Pradhan", specialization: "Orthopedics" };
    const doc2 = { _id: "69c8de99e6bcb69ecf2fb564", name: "Dr. Arvind Mehta", specialization: "Orthopedics" };

    const testDate = "11/11/2026";

    console.log(`Booking for ${doc1.name}...`);
    const r1 = await axios.post(`${BASE_URL}/tokens`, {
      userName: "Test Patient 1",
      doctorId: doc1._id,
      doctor: doc1.name,
      department: doc1.specialization,
      date: testDate
    });
    console.log(`${doc1.name} Token: ${r1.data.tokenId}`);

    console.log(`Booking for ${doc2.name}...`);
    const r2 = await axios.post(`${BASE_URL}/tokens`, {
      userName: "Test Patient 2",
      doctorId: doc2._id,
      doctor: doc2.name,
      department: doc2.specialization,
      date: testDate
    });
    console.log(`${doc2.name} Token: ${r2.data.tokenId}`);

    if (r1.data.tokenId === 'O-001' && r2.data.tokenId === 'O-001') {
      console.log('✅ PASS: Each doctor has their own O-001!');
    } else {
      console.log('❌ FAIL: Tokens are shared or incorrect.');
    }
  } catch (err) {
    console.error('Test Failed:', err.response ? err.response.data : err.message);
  }
}
verifyOrthoDocs();
