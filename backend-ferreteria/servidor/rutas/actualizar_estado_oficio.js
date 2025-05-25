const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../../middleware/authMiddleware'); // Importar el middleware de autenticación

// Ruta para actualizar el estado de un oficio
router.put('/actualizar_estado_oficio', authMiddleware, async (req, res) => {
  const { oficio_id, especializacion_id, estado_id } = req.body;
  const usuario_id = req.user.id_usuario; // Obtener el ID del usuario desde el token

  if (!oficio_id || !especializacion_id || !estado_id) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  try {
    // Verificar si el estado es válido
    const estadoResult = await pool.query('SELECT * FROM tipo_estado_usuoficio WHERE id = $1', [estado_id]);
    if (estadoResult.rows.length === 0) {
      return res.status(400).json({ error: 'Estado no válido' });
    }

    // Actualizar el estado del oficio en la base de datos
    await pool.query(
      'UPDATE usuario_oficio SET estado_id = $1 WHERE usuario_id = $2 AND oficio_id = $3 AND especializacion_id = $4',
      [estado_id, usuario_id, oficio_id, especializacion_id]
    );

    res.status(200).json({ message: 'Estado del oficio actualizado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el estado del oficio', details: err.message });
  }
});

module.exports = router;