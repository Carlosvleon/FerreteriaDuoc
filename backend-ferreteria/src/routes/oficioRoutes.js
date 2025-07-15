const express = require('express');
const router = express.Router();
const oficioController = require('../controllers/oficioController');

const isTest = process.env.NODE_ENV === 'test';

if (isTest) {
  router.get('/', oficioController.obtenerOficios);
  router.post('/agregar', function (req, res, next) {
    require('../middleware/authMiddleware')(req, res, function (err) {
      if (err) return next(err);
      oficioController.agregarOficios(req, res, next);
    });
  });
  router.put('/estado', function (req, res, next) {
    require('../middleware/authMiddleware')(req, res, function (err) {
      if (err) return next(err);
      oficioController.actualizarEstado(req, res, next);
    });
  });
} else {
  const authMiddleware = require('../middleware/authMiddleware');
  router.get('/', oficioController.obtenerOficios);
  router.post('/agregar', authMiddleware, oficioController.agregarOficios);
  router.put('/estado', authMiddleware, oficioController.actualizarEstado);
}

module.exports = router;
