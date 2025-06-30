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
router.put('/productos/:id', authMiddleware, adminMiddleware, adminProductoController.actualizarProducto);
router.post('/marcas', authMiddleware, adminMiddleware, adminProductoController.crearMarca);
router.get('/marcas', authMiddleware, adminMiddleware, adminProductoController.obtenerMarcas);
router.post('/modelos', authMiddleware, adminMiddleware, adminProductoController.crearModelo);
router.get('/modelos', authMiddleware, adminMiddleware, adminProductoController.obtenerModelos);
router.post('/categorias', authMiddleware, adminMiddleware, adminProductoController.crearCategoria);
router.get('/categorias', authMiddleware, adminMiddleware, adminProductoController.obtenerCategorias);



module.exports = router;