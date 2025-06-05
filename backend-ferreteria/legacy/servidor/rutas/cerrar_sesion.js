const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');
require('dotenv').config();

router.post('/cerrar_sesion', async (req, res) => {
  const token = req.header('Authorization').replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Insertar el token en la tabla de tokens inválidos
    await pool.query(
      'INSERT INTO invalid_tokens (token, fecha_expiracion) VALUES ($1, $2)',
      [token, new Date(decoded.exp * 1000)]
    );

    res.status(200).json({ message: 'Sesión cerrada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Token no válido.' });
  }
});

module.exports = router;