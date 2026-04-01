const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/summary', adminController.getSummary);
router.get('/users', adminController.getUsers);
router.put('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);
router.get('/queue', adminController.getQueue);

// These need io injected — exported as factory from server
module.exports = (io) => {
  router.patch('/queue/:id', adminController.updateQueueStatus(io));
  router.post('/token', adminController.generateToken(io));
  return router;
};
