const express = require('express');
const pool = require('../db'); // Conexión a la base de datos
const router = express.Router();

// Ruta para obtener el perfil de un usuario por su ID
router.get('/perfil/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE id_usuario = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = result.rows[0];
    const perfil = {
      id_usuario: user.id_usuario, // UUID
      nombre: user.nombre,
      email: user.email,
      telefono: user.telefono,
      direccion: user.direccion,
      foto_perfil: user.foto_perfil,
      portada: user.portada,
      tipo_usuario: user.tipo_usuario_id,
      rut: user.rut,
      // Otros campos que quieras incluir
    };

    res.status(200).json(perfil);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;