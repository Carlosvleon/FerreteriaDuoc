const express = require('express');
const router = express.Router();
const adminMiddleware = require('../middleware/adminMiddleware');
const adminCompraController = require('../controllers/admin/adminCompraController');
const adminTransaccionController = require('../controllers/admin/adminTransaccionController');
const authMiddleware = require('../middleware/authMiddleware');
const adminProductoController = require('../controllers/admin/adminProductoController');

// Compras
router.get('/compras', authMiddleware, adminMiddleware, adminCompraController.listarComprasConFiltros);
router.get('/compras/:id/detalle', authMiddleware, adminMiddleware, adminCompraController.obtenerDetalleCompra);

// Transacciones
router.get('/transacciones', authMiddleware, adminMiddleware, adminTransaccionController.listarTransaccionesConFiltros);

// Productos
router.post('/productos', authMiddleware, adminMiddleware, adminProductoController.crearProducto);
router.get('/productos', authMiddleware, adminMiddleware, adminProductoController.listarProductos);
router.get('/marcas', authMiddleware, adminMiddleware, adminProductoController.obtenerMarcas);
router.get('/modelos', authMiddleware, adminMiddleware, adminProductoController.obtenerModelos);
router.get('/categorias', authMiddleware, adminMiddleware, adminProductoController.obtenerCategorias);
router.post('/marcas', authMiddleware, adminMiddleware, adminProductoController.crearMarca);
router.post('/modelos', authMiddleware, adminMiddleware, adminProductoController.crearModelo);
router.post('/categorias', authMiddleware, adminMiddleware, adminProductoController.crearCategoria);



module.exports = router;