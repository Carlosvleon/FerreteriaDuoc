const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db'); // Conexión a la base de datos
require('dotenv').config(); // Cargar variables de entorno
const router = express.Router();

// Clave secreta para JWT (DEBERÍA IR EN UNA VARIABLE DE ENTORNO)
const SECRET_KEY = process.env.JWT_SECRET;

// Ruta de login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validar que los campos no estén vacíos
  if (!email || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
  }

  try {
    // Buscar usuario en la base de datos
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

    // Verificar si el usuario existe
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    const user = result.rows[0];

    // Comparar la contraseña ingresada con la almacenada
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    // Crear token JWT con información segura
    const token = jwt.sign(
      {
        id_usuario: user.id_usuario, // UUID
        email: user.email,
        tipo_usuario: user.tipo_usuario_id, // Puede ser útil para permisos
        rut: user.rut, // Asegúrate de incluir el rut en el token
      },
      SECRET_KEY,
      { expiresIn: '2h' } // Expira en 2 horas
    );

    // Enviar respuesta con el token
    res.status(200).json({
      message: 'Login exitoso',
      token,
      user: {
        id_usuario: user.id_usuario, // UUID
        nombre: user.nombre,
        email: user.email,
        tipo_usuario: user.tipo_usuario_id,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;
