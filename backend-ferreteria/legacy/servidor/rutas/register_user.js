const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../db');
const { v4: uuidv4 } = require('uuid'); // Importar uuid
const fs = require('fs-extra'); // Importar fs-extra
const path = require('path'); // Importar path para manejar rutas de archivos

router.post('/register', async (req, res) => {
  const { nombre, email, password, telefono, direccion, portada, tipo_usuario_id, rut, oficios, genero_id, razon_social, fecha_creacion_empresa } = req.body;

  if (!nombre || !email || !password || !tipo_usuario_id || !rut || !genero_id) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  try {
    const existingUser = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    const existingRut = await pool.query('SELECT * FROM usuarios WHERE rut = $1', [rut]);
    if (existingRut.rows.length > 0) {
      return res.status(400).json({ error: 'El RUT ya está registrado' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userId = uuidv4(); // Generar UUID

    // Seleccionar el avatar predeterminado según el genero_id
    let avatarFileName;
    if (genero_id === 1) { // Asumiendo que 1 es hombre
      avatarFileName = 'avatar_hombre.jpg';
    } else if (genero_id === 2) { // Asumiendo que 2 es mujer
      avatarFileName = 'avatar_mujer.jpg';
    } else { // Otros valores para neutral
      avatarFileName = 'avatar_neutral.jpg';
    }

    // Ruta de la foto de perfil en el sistema de archivos
    const avatarSourcePath = path.join(__dirname, '../../img/profile_basic', avatarFileName);
    const avatarDestinationPath = path.join(__dirname, '../../GPP', rut, 'perfil', 'avatar.jpg');

    // Copiar el avatar predeterminado a la carpeta de perfil del usuario
    await fs.copy(avatarSourcePath, avatarDestinationPath);

    // Ruta de la foto de perfil en la base de datos
    const fotoPerfilPath = path.join('GPP', rut, 'perfil', 'avatar.jpg');
    console.log("antes de insertar los datos");
    // Insertar el usuario en la base de datos
    const result = await pool.query(
      'INSERT INTO usuarios (id_usuario, nombre, email, password, telefono, direccion, foto_perfil, portada, tipo_usuario_id, rut, genero_id, razon_social, fecha_creacion_empresa) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id_usuario',
      [userId, nombre, email, hashedPassword, telefono, direccion, fotoPerfilPath, portada, tipo_usuario_id, rut, genero_id, razon_social, fecha_creacion_empresa]
    );
    console.log("ya de insertaron los datos");

    // Crear las carpetas para el usuario
    const userFolder = path.join(__dirname, '../../GPP', rut);
    const profileFolder = path.join(userFolder, 'perfil');
    const coverFolder = path.join(userFolder, 'portada');
    const galleryFolder = path.join(userFolder, 'galeria');

    await fs.ensureDir(profileFolder);
    await fs.ensureDir(coverFolder);
    await fs.ensureDir(galleryFolder);

    // Si el usuario es Maestro Independiente o Empresa, crear carpetas para cada oficio
    if (tipo_usuario_id === 1 || tipo_usuario_id === 2) {
      if (oficios && Array.isArray(oficios)) {
        for (const oficio of oficios) {
          const oficioResult = await pool.query(
            'SELECT o.nombre AS oficio_nombre, e.nombre AS especializacion_nombre FROM tipo_oficio o JOIN especializacion_oficio e ON o.id = e.oficio_id WHERE o.id = $1 AND e.id = $2',
            [oficio.oficio_id, oficio.especializacion_id]
          );

          if (oficioResult.rows.length > 0) {
            const { oficio_nombre, especializacion_nombre } = oficioResult.rows[0];
            const oficioFolder = path.join(galleryFolder, `${oficio_nombre}_${especializacion_nombre}`);
            await fs.ensureDir(oficioFolder);
          }
        }

        // Insertar oficios y especializaciones en la base de datos
        for (const oficio of oficios) {
          await pool.query(
            'INSERT INTO usuario_oficio (usuario_id, oficio_id, especializacion_id) VALUES ($1, $2, $3)',
            [userId, oficio.oficio_id, oficio.especializacion_id]
          );
        }
      }
    }

    res.status(201).json({ message: 'Usuario registrado con éxito', userId: result.rows[0].id_usuario });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar el usuario', details: err.message });
  }
});

module.exports = router;
