const express = require("express");
const router = express.Router();
const pool = require("../db"); // Conexión a la BD
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Ruta para obtener perfil del usuario
router.get("/perfil", async (req, res) => {
    try {
        const token = req.headers["authorization"];
        if (!token) return res.status(401).json({ error: "Acceso denegado. No hay token." });

        const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);

        const userId = decoded.id_usuario; // Asegurar de que la clave es correcta

        const result = await pool.query("SELECT id_usuario, nombre, email, telefono FROM usuarios WHERE id_usuario = $1", [userId]);

        if (result.rows.length === 0) return res.status(404).json({ error: "Usuario no encontrado." });

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error al obtener perfil:", error);
        res.status(500).json({ error: "Error del servidor." });
    }
});

module.exports = router;
