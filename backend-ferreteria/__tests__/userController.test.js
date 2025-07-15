const request = require('supertest');
const app = require('../src/app');
const userModel = require('../src/models/UserModel');
const jwt = require('jsonwebtoken');

// Helper de logging
function logCU(cu, descripcion, status, resultado) {
  const now = new Date().toISOString();
  console.log(`[${now}] [${cu}] ${descripcion} => ${resultado} (Status: ${status})`);
}

jest.mock('../src/models/UserModel');
jest.mock('jsonwebtoken');

describe('userController', () => {
  afterEach(() => jest.clearAllMocks());

  // --- LOGIN ---
  test('UC-001: Login exitoso', async () => {
    userModel.login.mockResolvedValue({ status: 200, body: { token: 'valid.jwt.token', message: 'Login exitoso' } });
    const res = await request(app).post('/api/usuarios/login').send({ email: 'usuario@test.com', password: '123456' });
    logCU('UC-001', 'Login exitoso', res.statusCode, res.body.message);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('UC-002: Usuario no existe', async () => {
    userModel.login.mockResolvedValue({ status: 401, body: { error: 'Credenciales incorrectas' } });
    const res = await request(app).post('/api/usuarios/login').send({ email: 'noexiste@test.com', password: '123456' });
    logCU('UC-002', 'Usuario no existe', res.statusCode, res.body.error);
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error', 'Credenciales incorrectas');
  });

  test('UC-003: Contraseña incorrecta', async () => {
    userModel.login.mockResolvedValue({ status: 401, body: { error: 'Credenciales incorrectas' } });
    const res = await request(app).post('/api/usuarios/login').send({ email: 'usuario@test.com', password: 'wrong' });
    logCU('UC-003', 'Contraseña incorrecta', res.statusCode, res.body.error);
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error', 'Credenciales incorrectas');
  });

  test('UC-004: Falta email', async () => {
    const res = await request(app).post('/api/usuarios/login').send({ password: '123456' });
    logCU('UC-004', 'Falta email', res.statusCode, res.body.error);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('UC-005: Falta password', async () => {
    const res = await request(app).post('/api/usuarios/login').send({ email: 'usuario@test.com' });
    logCU('UC-005', 'Falta password', res.statusCode, res.body.error);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('UC-006: Body vacío', async () => {
    const res = await request(app).post('/api/usuarios/login').send({});
    logCU('UC-006', 'Body vacío', res.statusCode, res.body.error);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('UC-007: Error interno BD login', async () => {
    userModel.login.mockRejectedValue(new Error('fail'));
    const res = await request(app).post('/api/usuarios/login').send({ email: 'usuario@test.com', password: '123456' });
    logCU('UC-007', 'Error interno BD login', res.statusCode, res.body.error);
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  // --- REGISTER ---
  test('UC-008: Registro exitoso', async () => {
    userModel.register.mockResolvedValue({ status: 201, body: { message: 'Usuario registrado' } });
    const res = await request(app).post('/api/usuarios/register').send({ nombre: 'Juan', email: 'juan@test.com', password: '123456', rut: '12345678-9' });
    logCU('UC-008', 'Registro exitoso', res.statusCode, res.body.message);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message');
  });

  test('UC-009: Email duplicado', async () => {
    userModel.register.mockResolvedValue({ status: 400, body: { error: 'El correo ya está registrado' } });
    const res = await request(app).post('/api/usuarios/register').send({ nombre: 'Juan', email: 'juan@test.com', password: '123456', rut: '12345678-9' });
    logCU('UC-009', 'Email duplicado', res.statusCode, res.body.error);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('UC-010: RUT duplicado', async () => {
    userModel.register.mockResolvedValue({ status: 400, body: { error: 'El RUT ya está registrado' } });
    const res = await request(app).post('/api/usuarios/register').send({ nombre: 'Juan', email: 'juan2@test.com', password: '123456', rut: '12345678-9' });
    logCU('UC-010', 'RUT duplicado', res.statusCode, res.body.error);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('UC-011: Password corto', async () => {
    const res = await request(app).post('/api/usuarios/register').send({ nombre: 'Juan', email: 'juan3@test.com', password: '123', rut: '12345678-9' });
    logCU('UC-011', 'Password corto', res.statusCode, res.body.error);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('UC-012: Campos faltantes', async () => {
    const res = await request(app).post('/api/usuarios/register').send({ email: 'juan@test.com', rut: '12345678-9' });
    logCU('UC-012', 'Campos faltantes', res.statusCode, res.body.error);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('UC-013: Error interno BD register', async () => {
    userModel.register.mockRejectedValue(new Error('fail'));
    const res = await request(app).post('/api/usuarios/register').send({ nombre: 'Juan', email: 'juan@test.com', password: '123456', rut: '12345678-9' });
    logCU('UC-013', 'Error interno BD register', res.statusCode, res.body.error);
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  // --- LOGOUT ---
  test('UC-014: Logout exitoso', async () => {
    jwt.verify.mockReturnValue({ exp: 1234567890 });
    userModel.invalidateToken.mockResolvedValue();
    const res = await request(app).post('/api/usuarios/logout').set('Authorization', 'Bearer valid.token');
    logCU('UC-014', 'Logout exitoso', res.statusCode, res.body.message);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  test('UC-015: Token inválido', async () => {
    jwt.verify.mockImplementation(() => { throw new Error('Invalid token'); });
    const res = await request(app).post('/api/usuarios/logout').set('Authorization', 'Bearer invalid.token');
    logCU('UC-015', 'Token inválido', res.statusCode, res.body.error);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('UC-016: Sin token', async () => {
    const res = await request(app).post('/api/usuarios/logout');
    logCU('UC-016', 'Sin token', res.statusCode, res.body.error);
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});
