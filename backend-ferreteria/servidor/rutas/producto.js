const express = require("express");
const router = express.Router();
const pool = require("../db");
const authMiddleware = require("../../middleware/authMiddleware");

// Obtener todos los productos (solo usuarios autenticados)
router.get("/producto", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM producto ORDER BY id_producto ASC");
    res.json(result.rows);
        // Log del usuario y los datos consultados
    console.log(`🛒 Usuario ${req.user.email} consultó los productos:`, result.rows);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ error: "Error al obtener productos desde la base de datos." });
  }
});

module.exports = router;
