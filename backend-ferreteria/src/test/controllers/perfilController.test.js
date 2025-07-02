// tests/controllers/perfilController.test.js

const request = require('supertest');
const express = require('express');
const perfilController = require('../../../src/controllers/perfilController');
const perfilModel = require('../../../src/models/PerfilModel');

// Mock de Express y rutas
const app = express();
app.use(express.json());

// Middleware falso para simular autenticación
app.use((req, res, next) => {
  req.user = { id_usuario: 1, rut: '12345678-9' };
  next();
});

jest.mock('../../../src/models/PerfilModel');

app.get('/perfil', perfilController.getPerfilUsuario);
app.get('/usuarios', perfilController.getTodosLosUsuarios);
app.get('/perfil/:id', perfilController.getPerfilPorId);

describe('perfilController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GET /perfil - perfil encontrado', async () => {
    const fakeProfile = { nombre: 'Juan', rut: '12345678-9' };
    perfilModel.obtenerPerfilPorId.mockResolvedValue(fakeProfile);

    const response = await request(app).get('/perfil');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(fakeProfile);
  });

  test('GET /perfil - perfil no encontrado', async () => {
    perfilModel.obtenerPerfilPorId.mockResolvedValue(null);

    const response = await request(app).get('/perfil');
    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Usuario no encontrado.");
  });

  test('GET /perfil - error inesperado', async () => {
    perfilModel.obtenerPerfilPorId.mockRejectedValue(new Error('DB error'));

    const response = await request(app).get('/perfil');
    expect(response.status).toBe(500);
    expect(response.body.error).toBe("Error al obtener perfil");
  });

  test('GET /usuarios - usuarios encontrados', async () => {
    const fakeUsers = [{ nombre: 'Ana' }, { nombre: 'Luis' }];
    perfilModel.obtenerUsuarios.mockResolvedValue(fakeUsers);

    const response = await request(app).get('/usuarios?tipo_usuario=cliente');
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });

  test('GET /usuarios - error inesperado', async () => {
    perfilModel.obtenerUsuarios.mockRejectedValue(new Error('DB error'));

    const response = await request(app).get('/usuarios');
    expect(response.status).toBe(500);
    expect(response.body.error).toBe("Error al obtener usuarios");
  });

  test('GET /perfil/:id - perfil encontrado por ID', async () => {
    const fakeProfile = { nombre: 'María' };
    perfilModel.obtenerPerfilPorId.mockResolvedValue(fakeProfile);

    const response = await request(app).get('/perfil/2');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(fakeProfile);
  });

  test('GET /perfil/:id - perfil no encontrado por ID', async () => {
    perfilModel.obtenerPerfilPorId.mockResolvedValue(null);

    const response = await request(app).get('/perfil/999');
    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Usuario no encontrado");
  });

  test('GET /perfil/:id - error inesperado', async () => {
    perfilModel.obtenerPerfilPorId.mockRejectedValue(new Error('DB error'));

    const response = await request(app).get('/perfil/2');
    expect(response.status).toBe(500);
    expect(response.body.error).toBe("Error en el servidor");
  });
});
