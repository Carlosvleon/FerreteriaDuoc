// tests/controllers/productoController.test.js
const request = require('supertest');
const express = require('express');
const productoController = require('../../../src/controllers/productoController');
const productoModel = require('../../../src/models/ProductoModel');

jest.mock('../../../src/models/ProductoModel');

const app = express();
app.use(express.json());

// Middleware simulado
app.use((req, res, next) => {
  req.user = { email: 'test@correo.com' };
  next();
});

app.get('/productos', productoController.getTodosLosProductos);
app.get('/productos/bodega', productoController.getProductosPorBodega);
app.post('/productos/bodega', productoController.getProductosPorBodegaPost);

describe('productoController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /productos', () => {
    test('devuelve todos los productos', async () => {
      const mockProductos = [
        { id_producto: 1, nombre: 'Sierra', stock_por_sucursal: [] },
        { id_producto: 2, nombre: 'Cemento', stock_por_sucursal: [] }
      ];

      productoModel.obtenerTodos.mockResolvedValue(mockProductos);

      const res = await request(app).get('/productos');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockProductos);
    });

    test('error al obtener productos', async () => {
      productoModel.obtenerTodos.mockRejectedValue(new Error('Error DB'));

      const res = await request(app).get('/productos');
      expect(res.status).toBe(500);
      expect(res.body.error).toMatch(/Error al obtener productos/i);
    });
  });

  describe('GET /productos/bodega', () => {
    test('devuelve productos por bodega y sucursal (query)', async () => {
      const productos = [{ id_producto: 1, nombre: 'Lija' }];
      productoModel.obtenerPorBodega.mockResolvedValue(productos);

      const res = await request(app).get('/productos/bodega?id_sucursal=1&id_bodega=2');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(productos);
    });

    test('falta id_bodega o id_sucursal (query)', async () => {
      const res = await request(app).get('/productos/bodega?id_sucursal=1');
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Debe enviar id_sucursal e id_bodega/i);
    });
  });

  describe('POST /productos/bodega', () => {
    test('devuelve productos por bodega y sucursal (POST)', async () => {
      const productos = [{ id_producto: 10, nombre: 'Clavos' }];
      productoModel.obtenerPorBodega.mockResolvedValue(productos);

      const res = await request(app).post('/productos/bodega').send({ id_sucursal: 1, id_bodega: 3 });
      expect(res.status).toBe(200);
      expect(res.body).toEqual(productos);
    });

    test('falta id_bodega o id_sucursal (POST)', async () => {
      const res = await request(app).post('/productos/bodega').send({ id_bodega: 3 });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Debe enviar id_sucursal e id_bodega/i);
    });

    test('error inesperado', async () => {
      productoModel.obtenerPorBodega.mockRejectedValue(new Error('Falla grave'));

      const res = await request(app).post('/productos/bodega').send({ id_sucursal: 1, id_bodega: 2 });
      expect(res.status).toBe(500);
      expect(res.body.error).toMatch(/Error al obtener productos desde la base de datos/i);
    });
  });
});
