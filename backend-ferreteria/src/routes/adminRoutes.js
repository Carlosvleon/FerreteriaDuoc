const express = require('express');
const router = express.Router();
const adminMiddleware = require('../middleware/adminMiddleware');
const adminCompraController = require('../controllers/admin/adminCompraController');
const adminTransaccionController = require('../controllers/admin/adminTransaccionController');
const authMiddleware = require('../middleware/authMiddleware');

// Compras
router.get('/compras', authMiddleware, adminMiddleware, adminCompraController.listarComprasConFiltros);
router.get('/compras/:id/detalle', authMiddleware, adminMiddleware, adminCompraController.obtenerDetalleCompra);

// Transacciones
router.get('/transacciones', authMiddleware, adminMiddleware, adminTransaccionController.listarTransaccionesConFiltros);

module.exports = router;
