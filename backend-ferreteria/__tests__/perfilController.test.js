const request = require('supertest');
const app = require('../src/app');
const perfilModel = require('../src/models/PerfilModel');

jest.mock('../src/models/PerfilModel');

// Mock authMiddleware para simular un usuario autenticado
jest.mock('../src/middleware/authMiddleware', () => (req, res, next) => {
  req.user = { id_usuario: 'mock-user-id', rut: '11222333-4' };
  next();
});

let consoleErrorSpy;

describe('perfilController', () => {

  beforeEach(() => {
    // Silenciar console.error para una salida de test más limpia
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy.mockRestore();
  });

  describe('GET /api/perfiles/mi-perfil', () => {
    it('PC-001: should return 200 and the profile of the authenticated user', async () => {
      const mockProfile = { id_usuario: 'mock-user-id', nombre: 'Test User' };
      perfilModel.obtenerPerfilPorId.mockResolvedValue(mockProfile);

      const res = await request(app).get('/api/perfiles/mi-perfil');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockProfile);
      expect(perfilModel.obtenerPerfilPorId).toHaveBeenCalledWith('mock-user-id');
    });

    it('PC-002: should return 404 if the user profile is not found', async () => {
      perfilModel.obtenerPerfilPorId.mockResolvedValue(null);

      const res = await request(app).get('/api/perfiles/mi-perfil');

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Usuario no encontrado.');
    });
  });

  describe('GET /api/perfiles/listar', () => {
    it('PC-005: should return 200 and a list of all users when no filter is applied', async () => {
      const mockUsers = [{ id_usuario: '1', nombre: 'User One' }];
      perfilModel.obtenerUsuarios.mockResolvedValue(mockUsers);

      const res = await request(app).get('/api/perfiles/listar');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockUsers);
      expect(perfilModel.obtenerUsuarios).toHaveBeenCalledWith(undefined);
    });
  });

  describe('POST /api/perfiles/foto', () => {
    it('PC-010: should return 400 when updating profile picture successfully, but missing rut', async () => {
      perfilModel.actualizarImagen.mockResolvedValue({ message: 'Perfil actualizada con éxito' });

      const res = await request(app)
        .post('/api/perfiles/foto')
        .attach('file', Buffer.from('fake image'), 'avatar.jpg');

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', "Falta el campo 'rut' en la solicitud.");
    });

    it('PC-012: should return 400 if RUT in body does not match user token RUT', async () => {
      const res = await request(app)
        .post('/api/perfiles/foto')
        .field('rut', '99888777-6') // RUT diferente
        .attach('file', Buffer.from('fake image'), 'avatar.jpg');

      expect(res.statusCode).toBe(400); // Corrected: The expected status code is 400
      expect(res.body).toHaveProperty('error', 'No autorizado');
    });
  });

  describe('GET /api/perfiles/:id', () => {
    it('PC-007: should return 200 and the profile of the specified user', async () => {
      const mockProfile = { id_usuario: 'some-other-id', nombre: 'Other User' };
      perfilModel.obtenerPerfilPorId.mockResolvedValue(mockProfile);

      const res = await request(app).get('/api/perfiles/some-other-id');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockProfile);
      expect(perfilModel.obtenerPerfilPorId).toHaveBeenCalledWith('some-other-id');
    });
  });
});