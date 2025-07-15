const request = require('supertest');
const app = require('../src/app');
const oficioModel = require('../src/models/OficioModel');

jest.mock('../src/models/OficioModel');
jest.mock('../src/middleware/authMiddleware', () => (req, res, next) => {
  req.user = { id_usuario: 'mock-user-id' };
  next();
});

describe('oficioController', () => {
  afterEach(() => jest.clearAllMocks());

  describe('GET /api/oficios', () => {
    it('debe devolver 200 y la lista de oficios', async () => {
      oficioModel.listarOficios.mockResolvedValue([{ id: 1, nombre: 'Albañil', especializaciones: [] }]);
      const res = await request(app).get('/api/oficios');
      expect(res.statusCode).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
    });

    it('debe devolver 500 si hay error', async () => {
      oficioModel.listarOficios.mockRejectedValue(new Error('fail'));
      const res = await request(app).get('/api/oficios');
      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/oficios/agregar', () => {
    it('debe devolver 201 al agregar correctamente', async () => {
      oficioModel.agregarOficiosUsuario.mockResolvedValue();
      const res = await request(app)
        .post('/api/oficios/agregar')
        .send({ oficios: [{ oficio_id: 1, especializacion_id: 1 }] });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message');
    });

    it('debe devolver 400 si falta oficios', async () => {
      const res = await request(app)
        .post('/api/oficios/agregar')
        .send({});
      expect(res.statusCode).toBe(400);
    });

    it('debe devolver 500 en error interno', async () => {
      oficioModel.agregarOficiosUsuario.mockRejectedValue(new Error('fail'));
      const res = await request(app)
        .post('/api/oficios/agregar')
        .send({ oficios: [{ oficio_id: 1, especializacion_id: 1 }] });
      expect(res.statusCode).toBe(500);
    });
  });

  describe('PUT /api/oficios/estado', () => {
    it('debe devolver 200 al actualizar correctamente', async () => {
      oficioModel.actualizarEstadoOficio.mockResolvedValue();
      const res = await request(app)
        .put('/api/oficios/estado')
        .send({ oficio_id: 1, especializacion_id: 2, estado_id: 1 });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message');
    });

    it('debe devolver 400 si faltan campos', async () => {
      const res = await request(app)
        .put('/api/oficios/estado')
        .send({ oficio_id: 1 });
      expect(res.statusCode).toBe(400);
    });

    it('debe devolver 500 en error interno', async () => {
      oficioModel.actualizarEstadoOficio.mockRejectedValue(new Error('fail'));
      const res = await request(app)
        .put('/api/oficios/estado')
        .send({ oficio_id: 1, especializacion_id: 2, estado_id: 1 });
      expect(res.statusCode).toBe(500);
    });
  });
});
