const pool = require('../db');

exports.obtenerTodos = async () => {
  const productosResult = await pool.query(
    `SELECT p.*, po.precio_online 
     FROM producto p 
     LEFT JOIN precios_online po ON po.id_producto = p.id_producto 
     ORDER BY p.id_producto ASC`
  );

  const productos = productosResult.rows;

  for (const producto of productos) {
    const stockResult = await pool.query(
      `SELECT s.id_sucursal, s.nombre AS nombre_sucursal, bp.stock
       FROM bodega_producto bp
       JOIN bodega b ON bp.id_bodega = b.id_bodega
       JOIN sucursal s ON b.id_sucursal = s.id_sucursal
       WHERE bp.id_producto = $1`,
      [producto.id_producto]
    );

    producto.stock_por_sucursal = stockResult.rows;
  }

  return productos;
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
       po.precio AS "Precio Online"
     FROM bodega_producto bp
     JOIN producto p ON bp.id_producto = p.id_producto
     JOIN bodega b ON bp.id_bodega = b.id_bodega
     JOIN sucursal s ON b.id_sucursal = s.id_sucursal
     LEFT JOIN marca ma ON ma.id_marca = p.id_marca
     LEFT JOIN modelo mo ON mo.id_modelo = p.id_modelo
     LEFT JOIN precios_online po on po.id_producto = p.id_producto
     WHERE b.id_bodega = $1 AND s.id_sucursal = $2
     ORDER BY p.id_producto ASC`,     
    [id_bodega, id_sucursal]
  );
  return result.rows;
};
