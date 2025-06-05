const pool = require('../db');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs-extra');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.login = async (email, password) => {
  const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
  if (result.rows.length === 0) {
    return { status: 401, body: { error: 'Correo o contraseña incorrectos' } };
  }

  const user = result.rows[0];
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return { status: 401, body: { error: 'Correo o contraseña incorrectos' } };
  }

  const token = jwt.sign(
    { id_usuario: user.id_usuario, email: user.email, tipo_usuario: user.tipo_usuario_id, rut: user.rut },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );

  return {
    status: 200,
    body: {
      message: 'Login exitoso',
      token,
      user: { id_usuario: user.id_usuario, nombre: user.nombre, email: user.email, tipo_usuario: user.tipo_usuario_id }
    }
  };
};

exports.register = async (data) => {
  const { nombre, email, password, telefono, direccion, portada, tipo_usuario_id, rut, oficios, genero_id, razon_social, fecha_creacion_empresa } = data;

  if (!nombre || !email || !password || !tipo_usuario_id || !rut || !genero_id) {
    return { status: 400, body: { error: 'Faltan datos obligatorios' } };
  }

  const existsEmail = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
  if (existsEmail.rows.length > 0) return { status: 400, body: { error: 'El correo ya está registrado' } };

  const existsRut = await pool.query('SELECT * FROM usuarios WHERE rut = $1', [rut]);
  if (existsRut.rows.length > 0) return { status: 400, body: { error: 'El RUT ya está registrado' } };

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);
  const userId = uuidv4();

  let avatarFile = genero_id === 1 ? 'avatar_hombre.jpg' : genero_id === 2 ? 'avatar_mujer.jpg' : 'avatar_neutral.jpg';
  const avatarSrc = path.join(__dirname, '../../img/profile_basic', avatarFile);
  const avatarDest = path.join(__dirname, '../../GPP', rut, 'perfil', 'avatar.jpg');
  await fs.copy(avatarSrc, avatarDest);
  const fotoPerfilPath = path.join('GPP', rut, 'perfil', 'avatar.jpg');

  await pool.query(
    'INSERT INTO usuarios (id_usuario, nombre, email, password, telefono, direccion, foto_perfil, portada, tipo_usuario_id, rut, genero_id, razon_social, fecha_creacion_empresa) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',
    [userId, nombre, email, hashedPassword, telefono, direccion, fotoPerfilPath, portada, tipo_usuario_id, rut, genero_id, razon_social, fecha_creacion_empresa]
  );

  const userDir = path.join(__dirname, '../../GPP', rut);
  await fs.ensureDir(path.join(userDir, 'perfil'));
  await fs.ensureDir(path.join(userDir, 'portada'));
  await fs.ensureDir(path.join(userDir, 'galeria'));

  if ((tipo_usuario_id === 1 || tipo_usuario_id === 2) && Array.isArray(oficios)) {
    for (const oficio of oficios) {
      const res = await pool.query(
        'SELECT o.nombre AS oficio_nombre, e.nombre AS especializacion_nombre FROM tipo_oficio o JOIN especializacion_oficio e ON o.id = e.oficio_id WHERE o.id = $1 AND e.id = $2',
        [oficio.oficio_id, oficio.especializacion_id]
      );
      if (res.rows.length > 0) {
        const { oficio_nombre, especializacion_nombre } = res.rows[0];
        await fs.ensureDir(path.join(userDir, 'galeria', `${oficio_nombre}_${especializacion_nombre}`));
      }

      await pool.query(
        'INSERT INTO usuario_oficio (usuario_id, oficio_id, especializacion_id) VALUES ($1, $2, $3)',
        [userId, oficio.oficio_id, oficio.especializacion_id]
      );
    }
  }

  return { status: 201, body: { message: 'Usuario registrado con éxito', userId } };
};

exports.invalidateToken = async (token, exp) => {
  await pool.query(
    'INSERT INTO invalid_tokens (token, fecha_expiracion) VALUES ($1, $2)',
    [token, new Date(exp * 1000)]
  );
};
