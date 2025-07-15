const request = require('supertest');
const app = require('../src/app');
const bodegaModel = require('../src/models/BodegaModel');

jest.mock('../src/models/BodegaModel', () => ({
  obtenerProductos: jest.fn()
}));

jest.mock('../src/middleware/authMiddleware', () => (req, res, next) => {
  req.user = { id_usuario: 'mock-user-id', email: 'test@test.com' };
  next();
});

function logCU(code, desc, status, body) {
  console.log(`[${new Date().toISOString()}] [${code}] ${desc} => Status: ${status}, Body: ${JSON.stringify(body)}`);
}

describe('bodegaController', () => {
  afterEach(() => jest.clearAllMocks());

  describe('POST /api/bodegas/productos', () => {

    // BOC-001: Responde 200 con productos válidos
    it('BOC-001: Devuelve 200 y productos de la bodega', async () => {
      const mockProducts = [{ id: 1, name: 'Product A' }];
      bodegaModel.obtenerProductos.mockResolvedValue(mockProducts);
      const res = await request(app)
        .post('/api/bodegas/productos')
        .send({ id_sucursal: 1, id_bodega: 1 });
      logCU('BOC-001', 'Devuelve productos correctamente', res.statusCode, res.body);
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockProducts);
    });

    // BOC-002: Falta id_sucursal
    it('BOC-002: Devuelve 400 si falta id_sucursal', async () => {
      const res = await request(app)
        .post('/api/bodegas/productos')
        .send({ id_bodega: 1 });
      logCU('BOC-002', 'Falta id_sucursal', res.statusCode, res.body);
      expect(res.statusCode).toBe(400);
    });

    // BOC-003: Falta id_bodega
    it('BOC-003: Devuelve 400 si falta id_bodega', async () => {
      const res = await request(app)
        .post('/api/bodegas/productos')
        .send({ id_sucursal: 1 });
      logCU('BOC-003', 'Falta id_bodega', res.statusCode, res.body);
      expect(res.statusCode).toBe(400);
    });

    // BOC-004: Bodega o sucursal no existe (error referencia foránea)
    it('BOC-004: Devuelve 404 si la bodega/sucursal no existe', async () => {
      bodegaModel.obtenerProductos.mockRejectedValue({ code: '23503' });
      const res = await request(app)
        .post('/api/bodegas/productos')
        .send({ id_sucursal: 999, id_bodega: 999 });
      logCU('BOC-004', 'No existe bodega/sucursal', res.statusCode, res.body);
      expect(res.statusCode).toBe(404);
    });

    // BOC-005: No hay productos para esa bodega
    it('BOC-005: Devuelve 404 si no hay productos', async () => {
      bodegaModel.obtenerProductos.mockResolvedValue([]);
      const res = await request(app)
        .post('/api/bodegas/productos')
        .send({ id_sucursal: 1, id_bodega: 1 });
      logCU('BOC-005', 'No hay productos', res.statusCode, res.body);
      expect(res.statusCode).toBe(404);
    });

    // BOC-006: Error inesperado del servidor
    it('BOC-006: Devuelve 500 en error inesperado', async () => {
      bodegaModel.obtenerProductos.mockRejectedValue(new Error('DB error'));
      const res = await request(app)
        .post('/api/bodegas/productos')
        .send({ id_sucursal: 1, id_bodega: 1 });
      logCU('BOC-006', 'Error inesperado', res.statusCode, res.body);
      expect(res.statusCode).toBe(500);
    });

    // BOC-007: No autenticado
    it('BOC-007: Devuelve 401 si no está autenticado', async () => {
      jest.resetModules();
      jest.doMock('../src/middleware/authMiddleware', () => (req, res, next) => {
        res.status(401).json({ error: 'No autenticado' });
      });
      // Re-require el app con el nuevo mock
      const appTest = require('../src/app');
      const res = await request(appTest)
        .post('/api/bodegas/productos')
        .send({ id_sucursal: 1, id_bodega: 1 });
      logCU('BOC-007', 'No autenticado', res.statusCode, res.body);
      expect(res.statusCode).toBe(401);
    });
  });
});
