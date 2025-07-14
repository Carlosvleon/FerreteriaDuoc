// tests/controllers/carritoController.test.js
const request = require('supertest');
const express = require('express');
const carritoController = require('../../../src/controllers/carritoController');
const carritoModel = require('../../../src/models/CarritoModel');

jest.mock('../../../src/models/CarritoModel');

const app = express();
app.use(express.json());

// Middleware de autenticación simulado
app.use((req, res, next) => {
  req.user = { id_usuario: 1 };
  next();
});

app.post('/carrito/agregar', carritoController.agregarAlCarrito);
app.get('/carrito', carritoController.obtenerCarrito);

describe('carritoController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /carrito/agregar', () => {
    test('debe agregar productos correctamente y retornar 200', async () => {
        const mockResultado = { message: 'Productos agregados correctamente' };
      const body = {
        id_sucursal: 1,
        productos: [{ id_producto: 1, cantidad: 2 }],
      };        
      carritoModel.agregarProductosPorSucursal.mockResolvedValue(mockResultado);

const response = await request(app).post('/carrito/agregar').send(body);


      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResultado);
          expect(carritoModel.agregarProductosPorSucursal).toHaveBeenCalledWith(
        1, // req.user.id_usuario
        body.id_sucursal,
        body.productos
      );
    });

    test('debe retornar error 400 por cantidad inválida (cero)', async () => {
      const response = await request(app).post('/carrito/agregar').send({
        id_sucursal: 1,
        productos: [{ id_producto: 1, cantidad: 0 }],
      });

      expect(response.status).toBe(400);
            expect(response.body.error).toBe(
        'Cada producto debe tener un id_producto y una cantidad válida.'
      );
    });

    test('debe retornar error 400 por tipo de dato incorrecto en producto', async () => {
      const response = await request(app).post('/carrito/agregar').send({
        id_sucursal: 1,
        productos: [{ id_producto: '1', cantidad: 2 }], // id_producto es string
      });
      expect(response.status).toBe(400);
      expect(response.body.error).toBe(
        'Cada producto debe tener un id_producto y una cantidad válida.'
      );
    });

    test('debe retornar error 500 del servidor', async () => {
      carritoModel.agregarProductosPorSucursal.mockRejectedValue(
        new Error('Error DB')
      );

      const response = await request(app)
        .post('/carrito/agregar')
        .send({ id_sucursal: 1, productos: [{ id_producto: 1, cantidad: 1 }] });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe(
        'Error interno al agregar productos al carrito.'
      );

    });
  });

  describe('GET /carrito', () => {
    test('debe devolver el carrito correctamente y retornar 200', async () => {
      const carritoMock = {
        id_carrito_compras: 10,
        productos: [{ id_producto: 1, nombre: 'Tornillo', cantidad: 5 }],
      };

      carritoModel.obtenerCarrito.mockResolvedValue(carritoMock);

      const response = await request(app).get('/carrito');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(carritoMock);
      expect(carritoModel.obtenerCarrito).toHaveBeenCalledWith(1);
    });

    test('retorna error al obtener el carrito', async () => {
      carritoModel.obtenerCarrito.mockRejectedValue(new Error('Error al consultar'));

      const response = await request(app).get('/carrito');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Error al obtener el carrito de compras.');

    });
  });
});
