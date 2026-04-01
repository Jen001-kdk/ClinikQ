const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';

async function verifyDoctorSpecificTokens() {
  try {
    console.log('🚀 Verifying Doctor-Specific Token Ranges...');

    const doctorsRes = await axios.get(`${BASE_URL}/doctors`);
    const doctors = doctorsRes.data;
    
    // Find two doctors in the same department/specialization
    const cardiologyDocs = doctors.filter(d => d.specialization === 'General medicine' || d.specialization === 'Cardiology');
    
    if (cardiologyDocs.length < 2) {
      console.log('Need at least 2 doctors in the same specialization to test full separation.');
    }

    const doc1 = cardiologyDocs[0];
    const doc2 = cardiologyDocs[1];

    const testDate = "10/10/2026"; // Far future date to ensure clean slate

    console.log(`Booking for Doc 1: ${doc1.name}`);
    const r1 = await axios.post(`${BASE_URL}/tokens`, {
      doctorId: doc1._id,
      doctor: doc1.name,
      department: doc1.specialization || 'General medicine',
      date: testDate
    });
    console.log(`Doc 1 Token: ${r1.data.tokenId}`);

    console.log(`\nBooking for Doc 2: ${doc2.name}`);
    const r2 = await axios.post(`${BASE_URL}/tokens`, {
      doctorId: doc2._id,
      doctor: doc2.name,
      department: doc2.specialization || 'General medicine',
      date: testDate
    });
    console.log(`Doc 2 Token: ${r2.data.tokenId}`);

    if (r1.data.tokenId === r2.data.tokenId) {
      console.log('✅ Success: Both doctors started at their own A-001 (or G-001).');
    } else {
      console.log(`❌ Failure: Tokens were shared or sequential across doctors. Doc 1: ${r1.data.tokenId}, Doc 2: ${r2.data.tokenId}`);
    }

  } catch (err) {
    console.error('Test Failed:', err.response ? err.response.data : err.message);
  }
}

verifyDoctorSpecificTokens();
