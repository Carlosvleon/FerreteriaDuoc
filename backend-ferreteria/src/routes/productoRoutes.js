const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Listar productos (para ambos módulos)
router.get('/', productoController.getTodosLosProductos);

// CRUD SOLO ADMIN
router.post('/crear/', authMiddleware, adminMiddleware, productoController.crearProducto);
router.put('/editar/:id', authMiddleware, adminMiddleware, productoController.actualizarProducto);
router.delete('/eliminar/:id', authMiddleware, adminMiddleware, productoController.eliminarProducto);

module.exports = router;
