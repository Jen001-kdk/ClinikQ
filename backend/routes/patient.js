const express = require('express');
const router = express.Router();
const { getPatientStats, getPatientReports, getAllPatients, getPatientHistory, getRecords, getRecord, getProfile, updateProfile } = require('../controllers/patientController');

router.get('/patient/stats', getPatientStats);
router.get('/patient/reports', getPatientReports);
router.get('/patients', getAllPatients);
router.get('/patients/:id/history', getPatientHistory);
router.get('/records', getRecords);
router.get('/records/:id', getRecord);
router.get('/users/profile', getProfile);
router.put('/users/profile', updateProfile);

module.exports = router;
