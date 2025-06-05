const express = require('express');
const router = express.Router();
const perfilController = require('../controllers/perfilController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/mi-perfil', authMiddleware, perfilController.getPerfilUsuario);
router.get('/listar', perfilController.getTodosLosUsuarios);
router.get('/:id', perfilController.getPerfilPorId);
router.post('/foto', authMiddleware, perfilController.actualizarFotoPerfil);
router.post('/portada', authMiddleware, perfilController.actualizarPortada);

module.exports = router;
