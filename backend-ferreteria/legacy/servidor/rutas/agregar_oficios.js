const express = require('express');
const router = express.Router();
const pool = require('../db');
const fs = require('fs-extra');
const path = require('path');
const authMiddleware = require('../../middleware/authMiddleware'); // Importar el middleware de autenticación

// Ruta para agregar oficios a un usuario
router.post('/agregar_oficios', authMiddleware, async (req, res) => {
  const { oficios } = req.body;
  const usuario_id = req.user.id_usuario; // Obtener el ID del usuario desde el token

  if (!oficios || !Array.isArray(oficios)) {
    return res.status(400).json({ error: 'Faltan datos obligatorios o los oficios no son válidos' });
  }

  try {
    // Verificar si el usuario existe
    const userResult = await pool.query('SELECT * FROM usuarios WHERE id_usuario = $1', [usuario_id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Obtener el RUT del usuario para crear las carpetas
    const { rut } = userResult.rows[0];
    const galleryFolder = path.join(__dirname, '../../GPP', rut, 'galeria');

    // Crear carpetas para cada oficio
    for (const oficio of oficios) {
      const oficioResult = await pool.query(
        'SELECT o.nombre AS oficio_nombre, e.nombre AS especializacion_nombre FROM tipo_oficio o JOIN especializacion_oficio e ON o.id = e.oficio_id WHERE o.id = $1 AND e.id = $2',
        [oficio.oficio_id, oficio.especializacion_id]
      );

      if (oficioResult.rows.length > 0) {
        const { oficio_nombre, especializacion_nombre } = oficioResult.rows[0];
        const oficioFolder = path.join(galleryFolder, `${oficio_nombre}_${especializacion_nombre}`);
        await fs.ensureDir(oficioFolder);
      }
    }

    // Insertar oficios y especializaciones en la base de datos
    for (const oficio of oficios) {
      await pool.query(
        'INSERT INTO usuario_oficio (usuario_id, oficio_id, especializacion_id, estado_id) VALUES ($1, $2, $3, $4)',
        [usuario_id, oficio.oficio_id, oficio.especializacion_id, 1] // Estado inicial: Activo
      );
    }

    res.status(201).json({ message: 'Oficios agregados correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al agregar los oficios', details: err.message });
  }
});

module.exports = router;