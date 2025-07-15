const request = require('supertest');
const app = require('../src/app');
const oficioModel = require('../src/models/OficioModel');

// Mock de todas las funciones del model
jest.mock('../src/models/OficioModel');

// Mock global de req.user para todas las rutas protegidas
jest.mock('../src/middleware/authMiddleware', () => (req, res, next) => {
  req.user = { id_usuario: 1 };
  next();
});

function logCU(codigo, desc, status, body) {
  console.log(`[${new Date().toISOString()}] [${codigo}] ${desc} => ${body} (Status: ${status})`);
}

describe('oficioController', () => {
  afterEach(() => jest.clearAllMocks());

  // OC-001: Lista todos los oficios
  test('OC-001: Lista todos los oficios', async () => {
    const mockOficios = [
      { id: 1, nombre: "Gasfiter", especializaciones: [{ id: 1, nombre: "Domiciliaria" }] },
      { id: 2, nombre: "Electricista", especializaciones: [] }
    ];
    oficioModel.listarOficios.mockResolvedValue(mockOficios);

    const res = await request(app).get('/api/oficios');
    logCU('OC-001', 'Lista todos los oficios', res.statusCode, JSON.stringify(res.body));
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockOficios);
  });

  // OC-002: Error servidor al listar
  test('OC-002: Error de servidor al listar oficios', async () => {
    oficioModel.listarOficios.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/oficios');
    logCU('OC-002', 'Error de servidor al listar', res.statusCode, res.body.error);
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  // OC-003: Agregar oficios a usuario (exitoso)
  test('OC-003: Agrega oficios a usuario', async () => {
    oficioModel.agregarOficiosUsuario.mockResolvedValue();
    const res = await request(app)
      .post('/api/oficios/agregar')
      .send({ oficios: [{ oficio_id: 1, especializacion_id: 2 }] });
    logCU('OC-003', 'Agrega oficios a usuario', res.statusCode, res.body.message);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message');
  });

  // OC-004: Oficios no es array
  test('OC-004: Oficios no es array', async () => {
    const res = await request(app)
      .post('/api/oficios/agregar')
      .send({ oficios: "1,2,3" });
    logCU('OC-004', 'Oficios no es array', res.statusCode, res.body.error);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // OC-005: Oficios faltante
  test('OC-005: Oficios faltante', async () => {
    const res = await request(app)
      .post('/api/oficios/agregar')
      .send({});
    logCU('OC-005', 'Oficios faltante', res.statusCode, res.body.error);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // OC-006: Error servidor al agregar
  test('OC-006: Error de servidor al agregar oficios', async () => {
    oficioModel.agregarOficiosUsuario.mockRejectedValue(new Error('fail'));
    const res = await request(app)
      .post('/api/oficios/agregar')
      .send({ oficios: [{ oficio_id: 1, especializacion_id: 2 }] });
    logCU('OC-006', 'Error de servidor al agregar', res.statusCode, res.body.error);
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

// OC-007: Estado actualizado
test('OC-007: Estado actualizado', async () => {
  oficioModel.actualizarEstado.mockResolvedValue(null);
  const res = await request(app)
    .put('/api/oficios/estado')
    .send({ id: 1, estado: true });
  logCU('OC-007', 'Estado actualizado', res.statusCode, res.body.updated);
  expect(res.statusCode).toBe(404);
  expect(res.body).toEqual({ error: "Oficio no encontrado" });
});



  // OC-008: Datos faltantes al actualizar estado
  test('OC-008: Datos faltantes al actualizar estado', async () => {
    const res = await request(app)
      .put('/api/oficios/estado')
      .send({ });
    logCU('OC-008', 'Datos faltantes al actualizar estado', res.statusCode, res.body.error);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // OC-009: Error de servidor al actualizar estado
  test('OC-009: Error de servidor al actualizar estado', async () => {
    oficioModel.actualizarEstado.mockRejectedValue(new Error('fail'));
    const res = await request(app)
      .put('/api/oficios/estado')
      .send({ id: 1, estado: false });
    logCU('OC-009', 'Error de servidor al actualizar estado', res.statusCode, res.body.error);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
