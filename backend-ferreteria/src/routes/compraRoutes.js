const express = require('express');
const router = express.Router();
const compraController = require('../controllers/compraController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/realizar', authMiddleware, compraController.realizarCompra);
router.get('/mis-compras', authMiddleware, compraController.obtenerMisCompras);
module.exports = router;