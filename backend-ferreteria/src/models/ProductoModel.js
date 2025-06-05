const pool = require('../db');

exports.obtenerTodos = async () => {
  const result = await pool.query("SELECT * FROM producto ORDER BY id_producto ASC");
  return result.rows;
};

exports.obtenerPorBodega = async (id_bodega, id_sucursal) => {
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
     WHERE b.id_bodega = $1 AND s.id_sucursal = $2
     ORDER BY p.id_producto ASC`,
    [id_bodega, id_sucursal]
  );
  return result.rows;
};
