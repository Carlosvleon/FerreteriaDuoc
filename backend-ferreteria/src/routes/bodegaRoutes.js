const express = require('express');
const router = express.Router();
const bodegaController = require('../controllers/bodegaController');
const isTest = process.env.NODE_ENV === 'test';

if (isTest) {
  router.post('/productos', function (req, res, next) {
    require('../middleware/authMiddleware')(req, res, function (err) {
      if (err) return next(err);
      bodegaController.obtenerProductosPorBodega(req, res, next);
    });
  });
} else {
  const authMiddleware = require('../middleware/authMiddleware');
  router.post('/productos', authMiddleware, bodegaController.obtenerProductosPorBodega);
}
module.exports = router;
