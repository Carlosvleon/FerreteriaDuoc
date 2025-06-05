const pool = require('../db');
const fs = require('fs-extra');
const path = require('path');

exports.listarOficios = async () => {
  const result = await pool.query(`
    SELECT o.id AS oficio_id, o.nombre AS oficio_nombre, e.id AS especializacion_id, e.nombre AS especializacion_nombre
    FROM tipo_oficio o
    JOIN especializacion_oficio e ON o.id = e.oficio_id
  `);

  return result.rows.reduce((acc, row) => {
    const { oficio_id, oficio_nombre, especializacion_id, especializacion_nombre } = row;
    let oficio = acc.find(o => o.id === oficio_id);
    if (oficio) {
      oficio.especializaciones.push({ id: especializacion_id, nombre: especializacion_nombre });
    } else {
      acc.push({
        id: oficio_id,
        nombre: oficio_nombre,
        especializaciones: [{ id: especializacion_id, nombre: especializacion_nombre }]
      });
    }
    return acc;
  }, []);
};

exports.agregarOficiosUsuario = async (usuario_id, oficios) => {
  const userResult = await pool.query('SELECT rut FROM usuarios WHERE id_usuario = $1', [usuario_id]);
  if (userResult.rows.length === 0) throw new Error('Usuario no encontrado');

  const { rut } = userResult.rows[0];
  const galleryFolder = path.join(__dirname, '../../GPP', rut, 'galeria');

  for (const oficio of oficios) {
    const res = await pool.query(
      'SELECT o.nombre AS oficio_nombre, e.nombre AS especializacion_nombre FROM tipo_oficio o JOIN especializacion_oficio e ON o.id = e.oficio_id WHERE o.id = $1 AND e.id = $2',
      [oficio.oficio_id, oficio.especializacion_id]
    );

    if (res.rows.length > 0) {
      const { oficio_nombre, especializacion_nombre } = res.rows[0];
      await fs.ensureDir(path.join(galleryFolder, `${oficio_nombre}_${especializacion_nombre}`));
    }

    await pool.query(
      'INSERT INTO usuario_oficio (usuario_id, oficio_id, especializacion_id, estado_id) VALUES ($1, $2, $3, $4)',
      [usuario_id, oficio.oficio_id, oficio.especializacion_id, 1]
    );
  }
};

exports.actualizarEstadoOficio = async (usuario_id, oficio_id, especializacion_id, estado_id) => {
  const estadoRes = await pool.query('SELECT * FROM tipo_estado_usuoficio WHERE id = $1', [estado_id]);
  if (estadoRes.rows.length === 0) throw new Error('Estado no válido');

  await pool.query(
    'UPDATE usuario_oficio SET estado_id = $1 WHERE usuario_id = $2 AND oficio_id = $3 AND especializacion_id = $4',
    [estado_id, usuario_id, oficio_id, especializacion_id]
  );
};
