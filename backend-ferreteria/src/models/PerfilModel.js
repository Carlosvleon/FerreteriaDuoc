const pool = require('../db');
const fs = require('fs-extra');
const path = require('path');

exports.obtenerPerfilPorId = async (id) => {
  const result = await pool.query('SELECT * FROM usuarios WHERE id_usuario = $1', [id]);
  return result.rows[0] || null;
};

exports.obtenerUsuarios = async (tipo_usuario) => {
  let query = 'SELECT * FROM usuarios';
  const params = [];
  if (tipo_usuario) {
    query += ' WHERE tipo_usuario_id = $1';
    params.push(tipo_usuario);
  }
  const result = await pool.query(query, params);
  return result.rows.map(user => ({
    id_usuario: user.id_usuario,
    nombre: user.nombre,
    email: user.email,
    tipo_usuario: user.tipo_usuario_id
  }));
};

exports.actualizarImagen = async (rut, file, tipo) => {
  const carpeta = tipo === "perfil" ? "perfil" : "portada";
  const fileName = tipo === "perfil" ? "avatar.jpg" : "portada.jpg";
  const folderPath = path.join(__dirname, '../../GPP', rut, carpeta);
  fs.ensureDirSync(folderPath);

  const filePath = path.join(folderPath, fileName);
  const backupPath = path.join(folderPath, `${tipo}_${Date.now()}.jpg`);

  if (fs.existsSync(filePath)) await fs.rename(filePath, backupPath);
  const dbPath = path.join('GPP', rut, carpeta, fileName);

  await fs.move(file.path, filePath, { overwrite: true });

  const column = tipo === "perfil" ? "foto_perfil" : "portada";
  await pool.query(
    `UPDATE usuarios SET ${column} = $1 WHERE rut = $2`,
    [dbPath, rut]
  );

  return { message: `${tipo.charAt(0).toUpperCase() + tipo.slice(1)} actualizada con éxito` };
};
