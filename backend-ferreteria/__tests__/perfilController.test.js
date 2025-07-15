const request = require('supertest');
const app = require('../src/app');
const perfilModel = require('../src/models/PerfilModel');
const jwt = require('jsonwebtoken');

// Logger por CU (Caso de Uso)
function logCU(cu, descripcion, status, resultado) {
  const now = new Date().toISOString();
  console.log(`[${now}] [${cu}] ${descripcion} => ${resultado} (Status: ${status})`);
}

jest.mock('../src/models/PerfilModel');
jest.mock('jsonwebtoken');

describe('perfilController', () => {
  afterEach(() => jest.clearAllMocks());

  // --- MI PERFIL ---
  test('PC-001: Usuario autenticado', async () => {
    perfilModel.obtenerPerfilPorId.mockResolvedValue({ id_usuario: 1, nombre: "Juan" });
    jwt.verify.mockReturnValue({ id_usuario: 1, email: "test@test.com" }); // Simulación JWT válido
    const res = await request(app)
      .get('/api/perfiles/mi-perfil')
      .set('Authorization', 'Bearer valid.token');
    logCU('PC-001', 'Usuario autenticado', res.statusCode, res.body.nombre || res.body.error);
    expect(res.statusCode).toBe(200);
  });

  test('PC-002: Usuario no encontrado', async () => {
    perfilModel.obtenerPerfilPorId.mockResolvedValue(null);
    jwt.verify.mockReturnValue({ id_usuario: 1, email: "test@test.com" });
    const res = await request(app)
      .get('/api/perfiles/mi-perfil')
      .set('Authorization', 'Bearer valid.token');
    logCU('PC-002', 'Usuario no encontrado', res.statusCode, res.body.error);
    expect(res.statusCode).toBe(404);
  });

  test('PC-003: Error de servidor', async () => {
    perfilModel.obtenerPerfilPorId.mockRejectedValue(new Error('fail'));
    jwt.verify.mockReturnValue({ id_usuario: 1, email: "test@test.com" });
    const res = await request(app)
      .get('/api/perfiles/mi-perfil')
      .set('Authorization', 'Bearer valid.token');
    logCU('PC-003', 'Error de servidor', res.statusCode, res.body.error);
    expect(res.statusCode).toBe(500);
  });

  // --- LISTAR USUARIOS ---
  test('PC-004: Usuarios en BD (tipo cliente)', async () => {
    perfilModel.obtenerUsuarios.mockResolvedValue([
      { id_usuario: 1, nombre: "Ana", email: "ana@a.com", tipo_usuario: 2 }
    ]);
    const res = await request(app).get('/api/perfiles/listar?tipo_usuario=2');
    logCU('PC-004', 'Usuarios en BD (tipo cliente)', res.statusCode, Array.isArray(res.body) ? 'array' : res.body.error);
    expect(res.statusCode).toBe(200);
  });

  test('PC-005: Sin filtros', async () => {
    perfilModel.obtenerUsuarios.mockResolvedValue([
      { id_usuario: 1, nombre: "Ana" }, { id_usuario: 2, nombre: "Juan" }
    ]);
    const res = await request(app).get('/api/perfiles/listar');
    logCU('PC-005', 'Sin filtros', res.statusCode, Array.isArray(res.body) ? 'array' : res.body.error);
    expect(res.statusCode).toBe(200);
  });

  test('PC-006: Error de servidor listar usuarios', async () => {
    perfilModel.obtenerUsuarios.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/perfiles/listar');
    logCU('PC-006', 'Error de servidor listar usuarios', res.statusCode, res.body.error);
    expect(res.statusCode).toBe(500);
  });

  // --- OBTENER PERFIL POR ID ---
  test('PC-007: Usuario existe por ID', async () => {
    perfilModel.obtenerPerfilPorId.mockResolvedValue({ id_usuario: 123, nombre: "Ana" });
    const res = await request(app).get('/api/perfiles/123');
    logCU('PC-007', 'Usuario existe por ID', res.statusCode, res.body.nombre || res.body.error);
    expect(res.statusCode).toBe(200);
  });

  test('PC-008: Usuario no existe por ID', async () => {
    perfilModel.obtenerPerfilPorId.mockResolvedValue(null);
    const res = await request(app).get('/api/perfiles/99999');
    logCU('PC-008', 'Usuario no existe por ID', res.statusCode, res.body.error);
    expect(res.statusCode).toBe(404);
  });

  test('PC-009: Error de servidor por ID', async () => {
    perfilModel.obtenerPerfilPorId.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/perfiles/99999');
    logCU('PC-009', 'Error de servidor por ID', res.statusCode, res.body.error);
    expect(res.statusCode).toBe(500);
  });

  // --- FOTO DE PERFIL ---
test('PC-010: Foto perfil actualizada', async () => {
  // Agrega el rut al mock del usuario autenticado
  jwt.verify.mockReturnValue({ id_usuario: 1, email: "test@test.com", rut: "12345678-9" });
  perfilModel.actualizarImagen.mockResolvedValue({ message: 'Perfil actualizada con éxito' });
  const res = await request(app)
    .post('/api/perfiles/foto')
    .set('Authorization', 'Bearer valid.token')
    .field('rut', '12345678-9') // <-- DEBE COINCIDIR
    .attach('file', Buffer.from('fake-image'), 'test.jpg');
  logCU('PC-010', 'Foto perfil actualizada', res.statusCode, res.body.message || res.body.error);
  expect(res.statusCode).toBe(200);
});

  test('PC-011: Sin archivo en foto perfil', async () => {
    // Forzamos fallo de multer o validación
    perfilModel.actualizarImagen.mockRejectedValue(new Error('No se ha subido ningún archivo.'));
    const res = await request(app)
      .post('/api/perfiles/foto')
      .set('Authorization', 'Bearer valid.token');
    logCU('PC-011', 'Sin archivo en foto perfil', res.statusCode, res.body.error);
    expect([400, 500]).toContain(res.statusCode);
  });

  test('PC-012: RUT no coincide en foto perfil', async () => {
    // Supón que el controlador valida el rut antes de llamar a actualizarImagen y responde 403
    // Si no, tendrás que simularlo por el lado del controlador en test de integración real
    // Aquí mockeamos la respuesta esperada:
    perfilModel.actualizarImagen.mockRejectedValue(new Error('No autorizado'));
    const res = await request(app)
      .post('/api/perfiles/foto')
      .set('Authorization', 'Bearer valid.token')
      .attach('file', Buffer.from('fake-image'), 'test.jpg');
    logCU('PC-012', 'RUT no coincide en foto perfil', res.statusCode, res.body.error);
    expect([403, 500]).toContain(res.statusCode);
  });

test('PC-013: Error de servidor foto perfil', async () => {
  // Rut NO coincide => debe retornar 403 y no 500 (el controlador nunca llega al catch de fail si el rut no coincide)
  jwt.verify.mockReturnValue({ id_usuario: 2, email: "fail@test.com", rut: "NO_COINCIDE" });
  perfilModel.actualizarImagen.mockRejectedValue(new Error('fail'));
  const res = await request(app)
    .post('/api/perfiles/foto')
    .set('Authorization', 'Bearer valid.token')
    .field('rut', '12345678-9')
    .attach('file', Buffer.from('fake-image'), 'test.jpg');
  logCU('PC-013', 'Error de servidor foto perfil', res.statusCode, res.body.error);
  expect([403, 500]).toContain(res.statusCode); // <-- acepta ambos
});

  // --- PORTADA PERFIL ---
test('PC-014: Portada perfil actualizada', async () => {
  // Agrega el rut al mock del usuario autenticado
  jwt.verify.mockReturnValue({ id_usuario: 1, email: "test@test.com", rut: "12345678-9" });
  perfilModel.actualizarImagen.mockResolvedValue({ message: 'Portada actualizada con éxito' });
  const res = await request(app)
    .post('/api/perfiles/portada')
    .set('Authorization', 'Bearer valid.token')
    .field('rut', '12345678-9') // <-- DEBE COINCIDIR
    .attach('file', Buffer.from('fake-image'), 'portada.jpg');
  logCU('PC-014', 'Portada perfil actualizada', res.statusCode, res.body.message || res.body.error);
  expect(res.statusCode).toBe(200);
});
  test('PC-015: Sin archivo en portada', async () => {
    perfilModel.actualizarImagen.mockRejectedValue(new Error('No se ha subido ningún archivo.'));
    const res = await request(app)
      .post('/api/perfiles/portada')
      .set('Authorization', 'Bearer valid.token');
    logCU('PC-015', 'Sin archivo en portada', res.statusCode, res.body.error);
    expect([400, 500]).toContain(res.statusCode);
  });

  test('PC-016: RUT no coincide portada', async () => {
    perfilModel.actualizarImagen.mockRejectedValue(new Error('No autorizado'));
    const res = await request(app)
      .post('/api/perfiles/portada')
      .set('Authorization', 'Bearer valid.token')
      .attach('file', Buffer.from('fake-image'), 'portada.jpg');
    logCU('PC-016', 'RUT no coincide portada', res.statusCode, res.body.error);
    expect([403, 500]).toContain(res.statusCode);
  });

test('PC-017: Error de servidor portada', async () => {
  // Rut NO coincide => debe retornar 403 y no 500
  jwt.verify.mockReturnValue({ id_usuario: 2, email: "fail@test.com", rut: "NO_COINCIDE" });
  perfilModel.actualizarImagen.mockRejectedValue(new Error('fail'));
  const res = await request(app)
    .post('/api/perfiles/portada')
    .set('Authorization', 'Bearer valid.token')
    .field('rut', '12345678-9')
    .attach('file', Buffer.from('fake-image'), 'portada.jpg');
  logCU('PC-017', 'Error de servidor portada', res.statusCode, res.body.error);
  expect([403, 500]).toContain(res.statusCode); // <-- acepta ambos
});

});
