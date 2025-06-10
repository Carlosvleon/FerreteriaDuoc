const router = require('express').Router();
const controller = require('../controllers/pagoController');

router.post('/', controller.init);
router.post('/retorno', controller.retorno);

module.exports = router;
