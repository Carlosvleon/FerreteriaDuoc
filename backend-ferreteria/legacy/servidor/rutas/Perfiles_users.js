const express = require('express');
const pool = require('../db'); // Conexión a la base de datos
const router = express.Router();

// Ruta para obtener todos los usuarios con filtros opcionales
router.get('/usuarios', async (req, res) => {
  const { tipo_usuario } = req.query;

  let query = 'SELECT * FROM usuarios';
  const queryParams = [];

  if (tipo_usuario) {
    query += ' WHERE tipo_usuario_id = $1';
    queryParams.push(tipo_usuario);
  }

  try {
    const result = await pool.query(query, queryParams);
    const usuarios = result.rows.map(user => {
      return {
        id_usuario: user.id_usuario, // UUID
        nombre: user.nombre,
        email: user.email,
        tipo_usuario: user.tipo_usuario_id,
        // Otros campos que quieras incluir
      };
    });
    res.status(200).json(usuarios);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;