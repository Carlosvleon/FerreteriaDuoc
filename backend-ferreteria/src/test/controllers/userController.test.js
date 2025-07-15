const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
// Mock del modelo para evitar llamadas reales a la BD en tests unitarios
jest.mock('../../../src/models/UserModel'); 
const userModel = require('../../../src/models/UserModel');
const userController = require('../../../src/controllers/userController');

const app = express();
app.use(express.json());
process.env.JWT_SECRET = 'secret';

app.post('/register', userController.register);
app.post('/login', userController.login);
app.post('/logout', userController.logout);

describe('userController', () => {
  // Limpiar mocks después de cada prueba
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('CU03 – Registro de usuario', () => {
    test('debe registrar un nuevo usuario y retornar sus datos', async () => {
      const userData = {
        nombre: 'Test Usuario',
        email: 'usuarioinvalido@ejemplo.com',
        password: 'contrasenaSegura123',
        rut: '12345678-9',
        tipo_usuario_id: 1,
        genero_id: 1
      };

      // Simular que el email no existe y el registro es exitoso
      userModel.findUserByEmail.mockResolvedValue(null);
      userModel.createUser.mockResolvedValue({ id_usuario: 'new-uuid', ...userData });

      const response = await request(app).post('/register').send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id_usuario');
      expect(response.body.email).toBe(userData.email);
    });

    test('retorna 400 si faltan email o password', async () => {
      const res = await request(app).post('/register').send({ nombre: 'SinEmail' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/correo y contrase\u00f1a/i);
    });

    test('retorna 400 si el email ya existe', async () => {
      userModel.register.mockResolvedValue({ status: 400, body: { error: 'El correo ya est\u00e1 registrado' } });

      const data = { nombre: 'Juan', email: 'existe@dominio.com', password: '123456', rut: '11-1', tipo_usuario_id: 1, genero_id: 1 };

      const res = await request(app).post('/register').send(data);
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/correo ya est\u00e1 registrado/i);
    });

    test('retorna 400 si el RUT ya existe', async () => {
      userModel.register.mockResolvedValue({ status: 400, body: { error: 'El RUT ya est\u00e1 registrado' } });
      const data = { nombre: 'Juan', email: 'nuevo@dominio.com', password: '123456', rut: '11-1', tipo_usuario_id: 1, genero_id: 1 };

      const res = await request(app).post('/register').send(data);
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/RUT ya est\u00e1 registrado/i);
    });

    test('retorna 500 si ocurre un error en el servidor', async () => {
      userModel.register.mockRejectedValue(new Error('fail'));

      const data = { nombre: 'Juan', email: 'a@b.com', password: '123456', rut: '12-3', tipo_usuario_id: 1, genero_id: 1 };
      const res = await request(app).post('/register').send(data);

      expect(res.status).toBe(500);
      expect(res.body.error).toMatch(/interno al registrar el usuario/i);
    });
  });

  describe('CU01 – Login de usuario', () => {
    test('debe autenticar correctamente a un usuario válido y retornar un token JWT', async () => {
      const loginData = {
        email: 'usuarioinvalido@ejemplo.com',
        password: 'contrasenaSegura123'
      };

      // Simular que el usuario existe y la contraseña es válida
      const mockUser = { email: loginData.email, password: 'hashedPassword' };
      userModel.findUserByEmail.mockResolvedValue(mockUser);
      // Asumimos que tienes un helper o usas bcrypt directamente
      const bcrypt = require('bcryptjs');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const response = await request(app).post('/login').send(loginData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    test('retorna 401 cuando las credenciales son incorrectas', async () => {
      userModel.login.mockResolvedValue({ status: 401, body: { error: 'Correo o contrase\u00f1a incorrectos' } });
      const res = await request(app).post('/login').send({ email: 'a@b.com', password: 'bad' });

      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/incorrectos/);
    });

    test('retorna 400 si faltan datos', async () => {
      const res = await request(app).post('/login').send({ email: 'a@b.com' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/obligatorios/);
    });

    test('retorna 500 si ocurre un error en el servidor', async () => {
      userModel.login.mockRejectedValue(new Error('db fail'));
      const res = await request(app).post('/login').send({ email: 'a@b.com', password: '123456' });
      expect(res.status).toBe(500);
      expect(res.body.error).toMatch(/servidor/);
    });
  });

  describe('CU02 – Logout de usuario', () => {
    test('debe cerrar sesión correctamente con token válido', async () => {
      const token = 'un-token-jwt-valido';
      jest.spyOn(jwt, 'verify').mockReturnValue({ exp: Date.now() / 1000 + 60 });
      userModel.invalidateToken.mockResolvedValue();

      const response = await request(app)
        .post('/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Sesión cerrada correctamente' });
    });

    test('retorna 400 si el token es inválido', async () => {
      jest.spyOn(jwt, 'verify').mockImplementation(() => { throw new Error('bad'); });
      const response = await request(app)
        .post('/logout')
        .set('Authorization', 'Bearer invalido');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Token no válido.');
    });

    test('retorna 401 si no se envía token', async () => {
      const response = await request(app).post('/logout');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('No se proporcionó token.');
    });
  });
});
