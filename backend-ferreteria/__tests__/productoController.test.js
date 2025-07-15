const request = require('supertest');
const app = require('../src/app');
const productoModel = require('../src/models/ProductoModel');

jest.mock('../src/models/ProductoModel', () => ({
  obtenerActivos: jest.fn(),
  obtenerPorBodega: jest.fn()      // <--- ¡agregado aquí!
}));
jest.mock('../src/middleware/authMiddleware', () => (req, res, next) => {
  req.user = { id_usuario: 'mock-user-id', email: 'test@test.com' };
  next();
});

// ...el resto de tu test


describe('productoController', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- GET /api/productos/ ---
  describe('GET /api/productos/', () => {
    it('PRC-001: retorna 200 y lista de productos activos', async () => {
      const mockProducts = [{ id: 1, name: 'Product A', active: true }];
      productoModel.obtenerActivos.mockResolvedValue(mockProducts);

      const res = await request(app).get('/api/productos/');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockProducts);
    });

    it('PRC-002: retorna 200 y lista vacía si no hay productos', async () => {
      productoModel.obtenerActivos.mockResolvedValue([]);
      const res = await request(app).get('/api/productos/');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('PRC-003: retorna 500 si falla el modelo', async () => {
      productoModel.obtenerActivos.mockRejectedValue(new Error('DB Error'));
      const res = await request(app).get('/api/productos/');
      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('error', 'Error al obtener productos activos desde la base de datos.');
    });
  });

  // --- GET /api/productos/bodega ---
  describe('GET /api/productos/bodega', () => {
    it('PRC-004: retorna 400 si falta id_sucursal', async () => {
      const res = await request(app).get('/api/productos/bodega?id_bodega=1');
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Debe enviar id_sucursal e id_bodega.');
    });

    it('PRC-005: retorna 400 si falta id_bodega', async () => {
      const res = await request(app).get('/api/productos/bodega?id_sucursal=1');
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Debe enviar id_sucursal e id_bodega.');
    });

    it('PRC-006: retorna 404 si no hay productos', async () => {
      productoModel.obtenerPorBodega.mockResolvedValue([]);
      const res = await request(app).get('/api/productos/bodega?id_sucursal=1&id_bodega=2');
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'No se encontraron productos en la bodega');
    });

    it('PRC-007: retorna 200 con productos', async () => {
      const mockProducts = [{ id: 1, nombre: 'A' }];
      productoModel.obtenerPorBodega.mockResolvedValue(mockProducts);
      const res = await request(app).get('/api/productos/bodega?id_sucursal=1&id_bodega=2');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockProducts);
    });

    it('PRC-008: retorna 500 en error inesperado', async () => {
      productoModel.obtenerPorBodega.mockRejectedValue(new Error('DB Error'));
      const res = await request(app).get('/api/productos/bodega?id_sucursal=1&id_bodega=2');
      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('error', 'Error al obtener productos de la bodega.');
    });
  });

  // --- POST /api/productos/bodega ---
  describe('POST /api/productos/bodega', () => {
    it('PRC-009: retorna 400 si falta id_sucursal', async () => {
      const res = await request(app).post('/api/productos/bodega').send({ id_bodega: 1 });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Debe enviar id_sucursal e id_bodega.');
    });

    it('PRC-010: retorna 400 si falta id_bodega', async () => {
      const res = await request(app).post('/api/productos/bodega').send({ id_sucursal: 1 });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Debe enviar id_sucursal e id_bodega.');
    });

    it('PRC-011: retorna 404 si no hay productos', async () => {
      productoModel.obtenerPorBodega.mockResolvedValue([]);
      const res = await request(app).post('/api/productos/bodega').send({ id_sucursal: 1, id_bodega: 2 });
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'No se encontraron productos en la bodega');
    });

    it('PRC-012: retorna 200 con productos', async () => {
      const mockProducts = [{ id: 1, nombre: 'A' }];
      productoModel.obtenerPorBodega.mockResolvedValue(mockProducts);
      const res = await request(app).post('/api/productos/bodega').send({ id_sucursal: 1, id_bodega: 2 });
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockProducts);
    });

    it('PRC-013: retorna 500 en error inesperado', async () => {
      productoModel.obtenerPorBodega.mockRejectedValue(new Error('DB Error'));
      const res = await request(app).post('/api/productos/bodega').send({ id_sucursal: 1, id_bodega: 2 });
      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('error', 'Error al obtener productos de la bodega.');
    });
  });
});
