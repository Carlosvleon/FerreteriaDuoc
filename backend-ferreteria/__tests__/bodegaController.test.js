jest.mock('../src/models/BodegaModel', () => ({
  obtenerProductos: jest.fn()
}));

beforeAll(() => {
  jest.resetModules();
});

jest.mock('../src/middleware/authMiddleware', () => (req, res, next) => {
  req.user = { id_usuario: 'mock-user-id', email: 'test@test.com' };
  next();
});



const request = require('supertest');
const app = require('../src/app');
const bodegaModel = require('../src/models/BodegaModel');

// ...el resto de tu código...

describe('bodegaController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/bodegas/productos', () => {
    it('Devuelve 200 y productos de la bodega', async () => {
      const mockProducts = [{ id: 1, name: 'Product A' }];
      bodegaModel.obtenerProductos.mockResolvedValue(mockProducts);
      const res = await request(app)
        .post('/api/bodegas/productos')
        .send({ id_sucursal: 1, id_bodega: 1 });
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockProducts);
    });

    it('Devuelve 400 si falta id_sucursal', async () => {
      const res = await request(app)
        .post('/api/bodegas/productos')
        .send({ id_bodega: 1 });
      expect(res.statusCode).toBe(400);
    });

    it('Devuelve 400 si falta id_bodega', async () => {
      const res = await request(app)
        .post('/api/bodegas/productos')
        .send({ id_sucursal: 1 });
      expect(res.statusCode).toBe(400);
    });

    it('Devuelve 404 si la bodega/sucursal no existe', async () => {
      bodegaModel.obtenerProductos.mockRejectedValue({ code: '23503' });
      const res = await request(app)
        .post('/api/bodegas/productos')
        .send({ id_sucursal: 999, id_bodega: 999 });
      expect(res.statusCode).toBe(404);
    });

    it('Devuelve 404 si no hay productos', async () => {
      bodegaModel.obtenerProductos.mockResolvedValue([]);
      const res = await request(app)
        .post('/api/bodegas/productos')
        .send({ id_sucursal: 1, id_bodega: 1 });
      expect(res.statusCode).toBe(404);
    });

    it('Devuelve 500 en error inesperado', async () => {
      bodegaModel.obtenerProductos.mockRejectedValue(new Error('DB error'));
      const res = await request(app)
        .post('/api/bodegas/productos')
        .send({ id_sucursal: 1, id_bodega: 1 });
      expect(res.statusCode).toBe(500);
    });

    it('Devuelve 401 si no está autenticado', async () => {
      jest.resetModules();
      jest.doMock('../src/middleware/authMiddleware', () => (req, res, next) => {
        res.status(401).json({ error: 'No autenticado' });
      });
      const appTest = require('../src/app');
      const res = await request(appTest)
        .post('/api/bodegas/productos')
        .send({ id_sucursal: 1, id_bodega: 1 });
      expect(res.statusCode).toBe(401);
    });
  });
});
