const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queueController');

module.exports = (io) => {
  router.get('/queue/serving/:department', queueController.getServing);
  router.get('/queue/position/:tokenId', queueController.getPosition);
  router.post('/queue/next', queueController.callNext(io));
  router.post('/queue/done', queueController.markDone(io));
  router.post('/queue/no-show', queueController.markNoShow(io));
  router.get('/appointments', queueController.getAppointments);
  router.patch('/appointments/:id', queueController.updateAppointment(io));
  router.post('/tokens', queueController.createToken(io));
  router.get('/departments', queueController.getDepartments);
  router.get('/doctors', queueController.getDoctors);
  return router;
};
