const express = require('express');
const router = express.Router();
const oficioController = require('../controllers/oficioController');
const authMiddleware = require('../middleware/authMiddleware');

const isTest = process.env.NODE_ENV === 'test';

// Endpoints de CRUD Oficio (siempre deben estar disponibles para test Y prod)
router.get('/', oficioController.obtenerOficios);
router.post('/', oficioController.crearOficio);
router.put('/:id', oficioController.actualizarOficio);
router.get('/:id', oficioController.obtenerOficioPorId);

// Endpoints de relación usuario-oficio (pueden o no usarse en tests)
if (isTest) {
  router.post('/agregar', authMiddleware, oficioController.agregarOficios);
  router.put('/estado', authMiddleware, oficioController.actualizarEstado);

} else {
  const authMiddleware = require('../middleware/authMiddleware');
  router.post('/agregar', authMiddleware, oficioController.agregarOficios);
  router.put('/estado', authMiddleware, oficioController.actualizarEstado);
  router.put('/:id', oficioController.actualizarEstado);
}

module.exports = router;
