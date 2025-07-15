const express = require('express');
const router = express.Router();
const perfilController = require('../controllers/perfilController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.get('/mi-perfil', authMiddleware, perfilController.getPerfilUsuario);
router.get('/listar', perfilController.getTodosLosUsuarios);
router.get('/:id', perfilController.getPerfilPorId);
router.post('/foto', authMiddleware, upload.single('file'), perfilController.actualizarFotoPerfil);
router.post('/portada', authMiddleware, upload.single('file'), perfilController.actualizarPortada);

module.exports = router;
