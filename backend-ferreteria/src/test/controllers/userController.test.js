const request = require('supertest');
const express = require('express');
// Mock del modelo para evitar llamadas reales a la BD en tests unitarios
jest.mock('../../../src/models/UserModel'); 
const userModel = require('../../../src/models/UserModel');
const userController = require('../../../src/controllers/userController');

const app = express();
app.use(express.json());

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
  });

  describe('CU02 – Logout de usuario', () => {
    test('debe cerrar sesión correctamente con token válido', async () => {
      const token = 'un-token-jwt-valido'; 

      const response = await request(app)
        .post('/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Logout exitoso' });
    });
  });
});
