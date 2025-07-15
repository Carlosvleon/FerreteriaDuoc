const express = require('express');
const router = express.Router();
const carritoController = require('../controllers/carritoController');

const isTest = process.env.NODE_ENV === 'test';

if (isTest) {
  // Middleware dinámico para Jest
  router.post('/agregar', function (req, res, next) {
    require('../middleware/authMiddleware')(req, res, function (err) {
      if (err) return next(err);
      carritoController.agregarAlCarrito(req, res, next);
    });
  });
  router.get('/', function (req, res, next) {
    require('../middleware/authMiddleware')(req, res, function (err) {
      if (err) return next(err);
      carritoController.obtenerCarrito(req, res, next);
    });
  });
} else {
  const authMiddleware = require('../middleware/authMiddleware');
  router.post('/agregar', authMiddleware, carritoController.agregarAlCarrito);
  // La siguiente línea está causando el error. Coméntala temporalmente para poder iniciar el proyecto.
  router.get('/', authMiddleware, carritoController.obtenerCarrito);
}

module.exports = router;
