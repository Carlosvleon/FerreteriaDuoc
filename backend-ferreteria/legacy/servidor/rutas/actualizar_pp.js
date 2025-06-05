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
    const coverFolder = path.join(__dirname, '../../GPP', rut, 'portada');
    fs.ensureDirSync(coverFolder); // Asegurarse de que la carpeta exista
    cb(null, coverFolder);
  },
  filename: (req, file, cb) => {
    cb(null, 'portada.jpg'); // Guardar el archivo como portada.jpg
  }
});

const upload = multer({ storage });

router.post('/actualizar-portada', authMiddleware, upload.single('portada'), async (req, res) => {
  const { rut } = req.body;

  if (!rut) {
    return res.status(400).json({ error: 'RUT es obligatorio' });
  }

  // Verificar que el usuario autenticado está actualizando su propia portada
  if (req.user.rut !== rut) {
    return res.status(403).json({ error: 'Acceso denegado. No puedes actualizar la portada de otro usuario.' });
  }

  try {
    const coverFolder = path.join(__dirname, '../../GPP', rut, 'portada');
    const oldCoverPath = path.join(coverFolder, 'portada.jpg');
    const backupCoverPath = path.join(coverFolder, `portada_${Date.now()}.jpg`);

    // Renombrar la portada anterior
    if (fs.existsSync(oldCoverPath)) {
      await fs.rename(oldCoverPath, backupCoverPath);
    }

    // Ruta de la nueva portada en la base de datos
    const portadaPath = path.join('GPP', rut, 'portada', 'portada.jpg');

    // Actualizar la ruta de la portada en la base de datos
    await pool.query(
      'UPDATE usuarios SET portada = $1 WHERE rut = $2',
      [portadaPath, rut]
    );

    res.status(200).json({ message: 'Portada actualizada con éxito' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar la portada', details: err.message });
  }
});

module.exports = router;