const jwt = require('jsonwebtoken');
const pool = require('../db');
require('dotenv').config();

const authMiddleware = async (req, res, next) => {
  const tokenHeader = req.header('Authorization');
  if (!tokenHeader) {
    return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token.' });
  }

  const token = tokenHeader.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verificar si el token está en la lista de tokens inválidos
    const result = await pool.query('SELECT * FROM invalid_tokens WHERE token = $1', [token]);
    if (result.rows.length > 0) {
      return res.status(401).json({ error: 'Token inválido. Por favor, inicie sesión nuevamente.' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Token no válido.' });
  }
};

module.exports = authMiddleware;