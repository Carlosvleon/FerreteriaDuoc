const express = require('express');
const router = express.Router();
const pool = require('../db');
const fs = require('fs-extra'); // Importar fs-extra
const path = require('path'); // Importar path para manejar rutas de archivos
const multer = require('multer'); // Importar multer para manejar la subida de archivos
const authMiddleware = require('../../middleware/authMiddleware'); // Importar el middleware de autenticación

// Configurar multer para almacenar los archivos subidos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { rut } = req.body;
    const profileFolder = path.join(__dirname, '../../GPP', rut, 'perfil');
    fs.ensureDirSync(profileFolder); // Asegurarse de que la carpeta exista
    cb(null, profileFolder);
  },
  filename: (req, file, cb) => {
    cb(null, 'avatar.jpg'); // Guardar el archivo como avatar.jpg
  }
});

const upload = multer({ storage });

router.post('/actualizar-foto-perfil', authMiddleware, upload.single('foto_perfil'), async (req, res) => {
  const { rut } = req.body;

  if (!rut) {
    return res.status(400).json({ error: 'RUT es obligatorio' });
  }

  // Verificar que el usuario autenticado está actualizando su propia foto de perfil
  if (req.user.rut !== rut) {
    return res.status(403).json({ error: 'Acceso denegado. No puedes actualizar la foto de perfil de otro usuario.' });
  }

  try {
    const profileFolder = path.join(__dirname, '../../GPP', rut, 'perfil');
    const oldAvatarPath = path.join(profileFolder, 'avatar.jpg');
    const backupAvatarPath = path.join(profileFolder, `avatar_${Date.now()}.jpg`);

    // Renombrar la foto de perfil anterior
    if (fs.existsSync(oldAvatarPath)) {
      await fs.rename(oldAvatarPath, backupAvatarPath);
    }

    // Ruta de la nueva foto de perfil en la base de datos
    const fotoPerfilPath = path.join('GPP', rut, 'perfil', 'avatar.jpg');

    // Actualizar la ruta de la foto de perfil en la base de datos
    await pool.query(
      'UPDATE usuarios SET foto_perfil = $1 WHERE rut = $2',
      [fotoPerfilPath, rut]
    );

    res.status(200).json({ message: 'Foto de perfil actualizada con éxito' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar la foto de perfil', details: err.message });
  }
});

module.exports = router;