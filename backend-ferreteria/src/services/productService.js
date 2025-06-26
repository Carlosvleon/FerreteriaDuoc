const productoModel = require('../models/admin/adminProductModel');

exports.crearProducto = async (productoData) => {
  if (!productoData || typeof productoData !== 'object') {
    throw new Error('Datos del producto inválidos');
  }

  const {
    codigoProducto,
    nombre,
    idMarca,
    idModelo,
    idCategoria,
    precioOnline
  } = productoData;

  if (!codigoProducto || !nombre || !idMarca || !idModelo || !idCategoria || precioOnline == null) {
    throw new Error('Faltan campos obligatorios');
  }

  return await productoModel.crearProducto({
    codigoProducto,
    nombre,
    idMarca,
    idModelo,
    idCategoria,
    precioOnline
  });
};



exports.obtenerProductosEstructurados = async () => {
  const productos = await productoModel.obtenerProductosConDetalles();

  const estructurado = {};

  productos.forEach(row => {
    if (!estructurado[row.id_producto]) {
      estructurado[row.id_producto] = {
        idProducto: row.id_producto,
        nombre: row.nombre_producto,
        codigoProducto: row.codigo_producto,
        marca: row.marca,
        modelo: row.modelo,
        categoria: row.categoria,
        precioOnline: row.precio_online,
        sedes: {}
      };
    }

    const sede = estructurado[row.id_producto].sedes;

    if (!sede[row.id_sucursal]) {
      sede[row.id_sucursal] = {
        nombreSucursal: row.nombre_sucursal,
        bodegas: []
      };
    }

    sede[row.id_sucursal].bodegas.push({
      idBodega: row.id_bodega,
      nombreBodega: row.nombre_bodega,
      stock: row.stock
    });
  });

  return Object.values(estructurado);
};
exports.listarMarcas = async () => {
  return await productoModel.listarMarcas();
};
exports.listarModelos = async () => {
  return await productoModel.listarModelos();
};
exports.listarCategorias = async () => {
  return await productoModel.listarCategorias();
};

exports.crearMarca = async ({ nombre }) => {
  if (!nombre || typeof nombre !== 'string') {
    throw new Error('Nombre inválido para la marca');
  }
  return await productoModel.crearMarca(nombre);
};


exports.crearModelo = async ({ nombre }) => {
  if (!nombre || typeof nombre !== 'string') {
    throw new Error('Nombre inválido para el modelo');
  }
  return await productoModel.crearModelo(nombre);
};

exports.crearCategoria = async ({ nombre }) => {
  if (!nombre || typeof nombre !== 'string') {
    throw new Error('Nombre inválido para la categoría');
  }
  return await productoModel.crearCategoria(nombre);
};
