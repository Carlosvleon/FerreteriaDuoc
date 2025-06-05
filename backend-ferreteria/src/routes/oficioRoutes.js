const express = require('express');
const router = express.Router();
const oficioController = require('../controllers/oficioController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', oficioController.obtenerOficios);
router.post('/agregar', authMiddleware, oficioController.agregarOficios);
router.put('/estado', authMiddleware, oficioController.actualizarEstado);

module.exports = router;
