const express = require('express');
const router = express.Router();
const compraController = require('../controllers/compraController');

const isTest = process.env.NODE_ENV === 'test';

if (isTest) {
  router.post('/realizar', function (req, res, next) {
    require('../middleware/authMiddleware')(req, res, function (err) {
      if (err) return next(err);
      compraController.realizarCompra(req, res, next);
    });
  });
  router.get('/mis-compras', function (req, res, next) {
    require('../middleware/authMiddleware')(req, res, function (err) {
      if (err) return next(err);
      compraController.obtenerMisCompras(req, res, next);
    });
  });
  router.post('/webpay/iniciar', function (req, res, next) {
    require('../middleware/authMiddleware')(req, res, function (err) {
      if (err) return next(err);
      compraController.pagarConWebpay(req, res, next);
    });
  });
  router.post('/webpay/confirmar', function (req, res, next) {
    require('../middleware/authMiddleware')(req, res, function (err) {
      if (err) return next(err);
      compraController.confirmarPagoWebpay(req, res, next);
    });
  });
} else {
  const authMiddleware = require('../middleware/authMiddleware');
  router.post('/realizar', authMiddleware, compraController.realizarCompra);
  router.get('/mis-compras', authMiddleware, compraController.obtenerMisCompras);
  router.post('/webpay/iniciar', authMiddleware, compraController.pagarConWebpay);
  router.post('/webpay/confirmar', authMiddleware, compraController.confirmarPagoWebpay);
}

module.exports = router;
