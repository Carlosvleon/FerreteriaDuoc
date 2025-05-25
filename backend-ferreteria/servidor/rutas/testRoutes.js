const express = require('express');
const pool = require('../db');  // Importar conexión a la BD

const router = express.Router();

// Ruta para probar la conexión a la BD
router.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: 'Conexión exitosa', time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ error: 'Error en la conexión' });
  }
});

module.exports = router;
