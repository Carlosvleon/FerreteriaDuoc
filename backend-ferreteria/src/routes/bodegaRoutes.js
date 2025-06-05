const express = require('express');
const router = express.Router();
const bodegaController = require('../controllers/bodegaController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/productos', authMiddleware, bodegaController.obtenerProductosPorSucursal);

module.exports = router;
