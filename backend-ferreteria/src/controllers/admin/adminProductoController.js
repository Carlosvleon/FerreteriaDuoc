const productoService = require('../../services/productService');

exports.crearProducto = async (req, res) => {
  try {
    console.log('[CREAR PRODUCTO] Body recibido:', req.body);
    if (!req.body) throw new Error('Falta el body del producto');

    const idProducto = await productoService.crearProducto(req.body);
    res.status(201).json({ message: 'Producto creado', idProducto });
  } catch (err) {
    console.error('[CREAR PRODUCTO] Error:', err.message);
    res.status(500).json({ error: 'Error al crear producto', detalle: err.message });
  }
};

exports.listarProductos = async (req, res) => {
  try {
    const productos = await productoService.obtenerProductosEstructurados();
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: 'Error al listar productos', detalle: err.message });
  }
};
exports.obtenerMarcas = async (req, res) => {
  try {
   const marcas = await productoService.listarMarcas();
    res.json(marcas);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener marcas', detalle: err.message });
  }
};
exports.obtenerCategorias = async (req, res) => {
  try {
    const categorias = await productoService.listarCategorias();
    res.json(categorias);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener categorías', detalle: err.message });
  }
};
exports.obtenerModelos = async (req, res) => {
  try {
    const modelos = await productoService.listarModelos();
    res.json(modelos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener modelos', detalle: err.message });
  }
};
exports.crearMarca = async (req, res) => {
  console.log('BODY:', req.body); // <-- Añade esto
  try {
    const idMarca = await productoService.crearMarca(req.body);
    res.status(201).json({ message: 'Marca creada', idMarca });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear marca', detalle: err.message });
  }
};

exports.crearModelo = async (req, res) => {
  try {
    const idModelo = await productoService.crearModelo(req.body); // ✅ pasa el body completo
    res.status(201).json({ message: 'Modelo creado', idModelo });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear modelo', detalle: err.message });
  }
};

exports.crearCategoria = async (req, res) => {
  try {
    const idCategoria = await productoService.crearCategoria(req.body); // ✅ pasa el body completo
    res.status(201).json({ message: 'Categoría creada', idCategoria });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear categoría', detalle: err.message });
  }
};
