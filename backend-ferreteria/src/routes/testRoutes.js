const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: 'Conexión exitosa', time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ error: 'Error en la conexión' });
  }
});

module.exports = router;
