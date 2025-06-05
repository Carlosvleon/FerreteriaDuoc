const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, productoController.getTodosLosProductos);
router.get('/bodega', authMiddleware, productoController.getProductosPorBodega);
router.post('/bodega', authMiddleware, productoController.getProductosPorBodegaPost);

module.exports = router;
