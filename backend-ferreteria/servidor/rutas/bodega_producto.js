const express = require("express");
const router = express.Router();
const pool = require("../db");
const authMiddleware = require("../../middleware/authMiddleware");

// GET /api/bodega_producto?id_bodega=1
router.get("/bodega_producto", authMiddleware, async (req, res) => {
  const idBodega = req.query.id_bodega;

  if (!idBodega) {
    return res.status(400).json({ error: "Debe proporcionar el id_bodega como query param." });
  }

  try {
    const result = await pool.query(
      `SELECT 
         p.codigo_producto AS "Código del producto",
         ma.nombre AS "Marca",
         p.nombre AS "Nombre",
         mo.nombre AS "Modelo",
         bp.stock AS "Stock",
         s.nombre AS "Sucursal",
         b.nombre AS "Bodega",
         bp.fecha_modificacion AS "Fecha",
         bp.ultimo_precio AS "Precio"
       FROM bodega_producto bp
       JOIN producto p ON bp.id_producto = p.id_producto
       JOIN bodega b ON bp.id_bodega = b.id_bodega
       JOIN sucursal s ON b.id_sucursal = s.id_sucursal
       LEFT JOIN marca ma ON ma.id_marca = p.id_marca
       LEFT JOIN modelo mo ON mo.id_modelo = p.id_modelo
       WHERE bp.id_bodega = $1
       ORDER BY p.id_producto ASC`,
      [idBodega]
    );

    console.log(`Usuario ${req.user.email} consultó productos de la bodega ${idBodega}`);
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ error: "Error al obtener productos desde la base de datos." });
  }
});

module.exports = router;
