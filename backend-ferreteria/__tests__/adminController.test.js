const request = require('supertest');
const app = require('../src/app');
const fs = require('fs');
const path = require('path');

const adminProductModel = require('../src/models/admin/adminProductModel');
const adminCompraModel = require('../src/models/admin/adminCompraModel');
const adminTransaccionModel = require('../src/models/admin/adminTransaccionModel');

// --- Mocks globales de modelo ---
jest.mock('../src/models/admin/adminProductModel');
jest.mock('../src/models/admin/adminCompraModel');
jest.mock('../src/models/admin/adminTransaccionModel');

// --- Mock de middlewares para siempre dejar pasar ---
jest.mock('../src/middleware/authMiddleware', () => (req, res, next) => next());
jest.mock('../src/middleware/adminMiddleware', () => (req, res, next) => next());

afterEach(() => jest.clearAllMocks());

describe('adminController', () => {
  // =============================
  // Productos
  // =============================
  test('AC-001: GET /api/admin/productos - Exitoso', async () => {
    const productos = [{ id_producto: 1, nombre: 'Taladro', precio_online: 5000 }];
    adminProductModel.obtenerProductosConDetalles.mockResolvedValue(productos);
    const res = await request(app).get('/api/admin/productos');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(productos);
  });

  test('AC-002: GET /api/admin/productos - Error de servidor', async () => {
    adminProductModel.obtenerProductosConDetalles.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/admin/productos');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  test('AC-003: POST /api/admin/productos - Exitoso', async () => {
    adminProductModel.crearProducto.mockResolvedValue(123);
    const body = { nombre: "Taladro", precioOnline: 8000, codigoProducto: "COD123" };
    const res = await request(app).post('/api/admin/productos').send(body);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('idProducto', 123);
  });

  test('AC-004: POST /api/admin/productos - Error de servidor', async () => {
    adminProductModel.crearProducto.mockRejectedValue(new Error('fail'));
    const body = { nombre: "Taladro", precioOnline: 8000, codigoProducto: "COD123" };
    const res = await request(app).post('/api/admin/productos').send(body);
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  test('AC-005: PUT /api/admin/productos/:idProducto - Exitoso', async () => {
    adminProductModel.actualizarProducto.mockResolvedValue();
    const res = await request(app).put('/api/admin/productos/1').send({ nombre: "Nuevo Nombre", precioOnline: 5000 });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  test('AC-006: PUT /api/admin/productos/:idProducto - Error de servidor', async () => {
    adminProductModel.actualizarProducto.mockRejectedValue(new Error('fail'));
    const res = await request(app).put('/api/admin/productos/1').send({ nombre: "Nuevo Nombre", precioOnline: 5000 });
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  test('AC-007: POST /api/admin/productos/:idProducto/imagen - Exitoso', async () => {
    // Mock para la función de actualizar imagen en el modelo de producto
    adminProductModel.actualizarRutaImagen = jest.fn().mockResolvedValue();
    // Para simular el upload, usaremos un buffer pequeño como imagen fake
    const fakeImagePath = path.join(__dirname, 'fake-image.jpg');
    fs.writeFileSync(fakeImagePath, Buffer.from([0xff, 0xd8, 0xff])); // escribe 3 bytes simulando JPEG
    const res = await request(app)
      .post('/api/admin/productos/1/imagen')
      .attach('imagen', fakeImagePath);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    // Limpia el archivo fake
    fs.unlinkSync(fakeImagePath);
  });

  test('AC-008: POST /api/admin/productos/:idProducto/imagen - Sin archivo', async () => {
    const res = await request(app)
      .post('/api/admin/productos/1/imagen');
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('AC-009: POST /api/admin/productos/:idProducto/imagen - Error de servidor', async () => {
    // Fuerza a fallar la función que guarda la imagen
    adminProductModel.actualizarRutaImagen = jest.fn().mockRejectedValue(new Error('fail'));
    // Fake file de nuevo
    const fakeImagePath = path.join(__dirname, 'fake-image.jpg');
    fs.writeFileSync(fakeImagePath, Buffer.from([0xff, 0xd8, 0xff]));
    const res = await request(app)
      .post('/api/admin/productos/1/imagen')
      .attach('imagen', fakeImagePath);
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
    fs.unlinkSync(fakeImagePath);
  });

  // =============================
  // Marcas
  // =============================
  test('AC-010: GET /api/admin/marcas - Exitoso', async () => {
    const marcas = [{ id: 1, nombre: 'Stanley' }];
    adminProductModel.listarMarcas.mockResolvedValue(marcas);
    const res = await request(app).get('/api/admin/marcas');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(marcas);
  });

  test('AC-011: GET /api/admin/marcas - Error de servidor', async () => {
    adminProductModel.listarMarcas.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/admin/marcas');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  test('AC-012: POST /api/admin/marcas - Exitoso', async () => {
    adminProductModel.crearMarca.mockResolvedValue(77);
    const res = await request(app).post('/api/admin/marcas').send({ nombre: "Marca Test" });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('idMarca', 77);
    expect(res.body).toHaveProperty('message');
  });

  test('AC-013: POST /api/admin/marcas - Nombre faltante', async () => {
    const res = await request(app).post('/api/admin/marcas').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('AC-014: POST /api/admin/marcas - Error de servidor', async () => {
    adminProductModel.crearMarca.mockRejectedValue(new Error('fail'));
    const res = await request(app).post('/api/admin/marcas').send({ nombre: "Marca Test" });
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  // =============================
  // Compras
  // =============================
  test('AC-015: GET /api/admin/compras - Exitoso', async () => {
    const data = { resultados: [{ id_compra: 1 }], totalPaginas: 1 };
    adminCompraModel.listarComprasConFiltros.mockResolvedValue(data);
    const res = await request(app).get('/api/admin/compras');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(data);
  });

  test('AC-016: GET /api/admin/compras - Con filtro rut', async () => {
    const data = { resultados: [{ id_compra: 2 }], totalPaginas: 1 };
    adminCompraModel.listarComprasConFiltros.mockResolvedValue(data);
    const res = await request(app).get('/api/admin/compras?rut=12345678-9');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(data);
  });

  test('AC-017: GET /api/admin/compras - Error de servidor', async () => {
    adminCompraModel.listarComprasConFiltros.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/admin/compras');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  test('AC-018: GET /api/admin/compras/:idCompra - Exitoso', async () => {
    const detalle = { compra: { id_compra: 1 }, detalle: [], transaccion: null };
    adminCompraModel.obtenerDetalleCompra.mockResolvedValue(detalle);
    const res = await request(app).get('/api/admin/compras/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(detalle);
  });

  test('AC-019: GET /api/admin/compras/:idCompra - No encontrada', async () => {
    adminCompraModel.obtenerDetalleCompra.mockResolvedValue({ compra: null });
    const res = await request(app).get('/api/admin/compras/999');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  test('AC-020: GET /api/admin/compras/:idCompra - Error de servidor', async () => {
    adminCompraModel.obtenerDetalleCompra.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/admin/compras/1');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  // =============================
  // Transacciones
  // =============================
  test('AC-021: GET /api/admin/transacciones - Exitoso', async () => {
    const data = { resultados: [{ id: 1 }], totalPaginas: 1 };
    adminTransaccionModel.listarTransaccionesConFiltros.mockResolvedValue(data);
    const res = await request(app).get('/api/admin/transacciones');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(data);
  });

  test('AC-022: GET /api/admin/transacciones - Con filtro fecha', async () => {
    const data = { resultados: [{ id: 1 }], totalPaginas: 1 };
    adminTransaccionModel.listarTransaccionesConFiltros.mockResolvedValue(data);
    const res = await request(app).get('/api/admin/transacciones?fecha=2023-01-01');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(data);
  });

  test('AC-023: GET /api/admin/transacciones - Error de servidor', async () => {
    adminTransaccionModel.listarTransaccionesConFiltros.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/admin/transacciones');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});
