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
  console.log("la pasword es",password )
  const user = result.rows[0];
  console.log("User encontrado:", user);
  const match = await bcrypt.compare(password, user.password);
  console.log("correcta? :",match )
  if (!match) {
    return { status: 401, body: { error: 'Correo o contraseña incorrectos' } };
  }

  const token = jwt.sign(
  { 
    id_usuario: user.id_usuario, 
    email: user.email, 
    tipo_usuario_id: user.tipo_usuario_id,
    rut: user.rut 
  },
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
  try {
    const { nombre, email, password, telefono, direccion, portada, rut, oficios, genero_id, razon_social, fecha_creacion_empresa } = data;

    // Forzamos que cualquier usuario creado desde la web sea CLIENTE
    const tipo_usuario_id = 2; // 1 = admin, 2 = cliente

    // Validación inicial
    if (!nombre || !email || !password || !rut || !genero_id) {
      console.log('[REGISTER] Faltan datos obligatorios', data);
      return { status: 400, body: { error: 'Faltan datos obligatorios' } };
    }

    // ¿Email ya existe?
    const existsEmail = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (existsEmail.rows.length > 0) {
      console.log('[REGISTER] Email ya registrado:', email);
      return { status: 400, body: { error: 'El correo ya está registrado' } };
    }

    // ¿Rut ya existe?
    const existsRut = await pool.query('SELECT * FROM usuarios WHERE rut = $1', [rut]);
    if (existsRut.rows.length > 0) {
      console.log('[REGISTER] RUT ya registrado:', rut);
      return { status: 400, body: { error: 'El RUT ya está registrado' } };
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userId = uuidv4();

    let avatarFile = genero_id === 1 ? 'avatar_hombre.jpg' : genero_id === 2 ? 'avatar_mujer.jpg' : 'avatar_neutral.jpg';
    const avatarSrc = path.join(__dirname, '../../img/profile_basic', avatarFile);
    const avatarDest = path.join(__dirname, '../../GPP', rut, 'perfil', 'avatar.jpg');
    await fs.copy(avatarSrc, avatarDest);
    const fotoPerfilPath = path.join('GPP', rut, 'perfil', 'avatar.jpg');

    // INSERT USUARIO (tipo_usuario_id SIEMPRE será 2)
    try {
      await pool.query(
        'INSERT INTO usuarios (id_usuario, nombre, email, password, telefono, direccion, foto_perfil, portada, tipo_usuario_id, rut, genero_id, razon_social, fecha_creacion_empresa) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',
        [userId, nombre, email, hashedPassword, telefono, direccion, fotoPerfilPath, portada, tipo_usuario_id, rut, genero_id, razon_social, fecha_creacion_empresa]
      );
      console.log('[REGISTER] Usuario creado con id:', userId);
    } catch (err) {
      console.error('[REGISTER][ERROR][Usuario]', err);
      return { status: 500, body: { error: 'Error creando usuario', details: err.message } };
    }

    // INSERT CARRITO
    try {
      const resultCarrito = await pool.query(
        'INSERT INTO carrito_compras (id_usuario, total) VALUES ($1, $2) RETURNING *',
        [userId, null]
      );
      console.log('[REGISTER] Carrito creado:', resultCarrito.rows[0]);
    } catch (err) {
      console.error('[REGISTER][ERROR][Carrito]', err);
      return { status: 500, body: { error: 'Error creando carrito', details: err.message } };
    }

    // Fin: usuario + carrito creados
    return { status: 201, body: { message: 'Usuario registrado con éxito', userId } };
  } catch (err) {
    console.error('[REGISTER][ERROR][General]', err);
    return { status: 500, body: { error: "Error al registrar el usuario", details: err.message } };
  }
};


exports.invalidateToken = async (token, exp) => {
  await pool.query(
    'INSERT INTO invalid_tokens (token, fecha_expiracion) VALUES ($1, $2)',
    [token, new Date(exp * 1000)]
  );
};
