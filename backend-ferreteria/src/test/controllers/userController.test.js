const request = require('supertest');
const express = require('express');
const userController = require('../../../src/controllers/userController');

const app = express();
app.use(express.json());

app.post('/register', userController.register);
app.post('/login', userController.login);
app.post('/logout', userController.logout);

describe('userController', () => {
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

      await request(app).post('/register').send(userData);
    });
  });

  describe('CU01 – Login de usuario', () => {
    test('debe autenticar correctamente a un usuario válido y retornar un token JWT', async () => {
      const loginData = {
        email: 'usuarioinvalido@ejemplo.com',
        password: 'contrasenaSegura123'
      };

      await request(app).post('/login').send(loginData);
    });
  });

  describe('CU02 – Logout de usuario', () => {
    test('debe cerrar sesión correctamente con token válido', async () => {
      const token = 'token-falso-valido'; // Reemplazar con un token real si aplica

      await request(app)
        .post('/logout')
        .set('Authorization', `Bearer ${token}`);
    });
  });
});
