const express = require('express');
const router = express.Router();
const pool = require('../db');

// Ruta para obtener oficios y sus especializaciones
router.get('/oficios', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.id AS oficio_id, o.nombre AS oficio_nombre, e.id AS especializacion_id, e.nombre AS especializacion_nombre
      FROM tipo_oficio o
      JOIN especializacion_oficio e ON o.id = e.oficio_id
    `);

    const oficios = result.rows.reduce((acc, row) => {
      const { oficio_id, oficio_nombre, especializacion_id, especializacion_nombre } = row;
      const oficio = acc.find(o => o.id === oficio_id);

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

    res.status(200).json(oficios);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los oficios y sus especializaciones' });
  }
});

module.exports = router;