// tests/controllers/bodegaController.test.js
const request = require('supertest');
const express = require('express');
const bodegaController = require('../../../src/controllers/bodegaController');
const bodegaModel = require('../../../src/models/BodegaModel');

jest.mock('../../../src/models/BodegaModel');

const app = express();
app.use(express.json());

// Middleware falso para simular autenticación
app.use((req, res, next) => {
    req.user = { email: 'admin@correo.com' };
    next();
});

app.post('/bodega/productos', bodegaController.obtenerProductosPorSucursal);

describe('bodegaController', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('POST /bodega/productos - devuelve productos correctamente', async () => {
        const productosMock = [
            { id_producto: 1, nombre: 'Martillo' },
            { id_producto: 2, nombre: 'Taladro' }
        ];

        bodegaModel.obtenerProductos.mockResolvedValue(productosMock);

        const res = await request(app)
            .post('/bodega/productos')
            .send({ id_sucursal: 1, id_bodega: 1 });

        expect(res.status).toBe(200);
        expect(res.body).toEqual(productosMock);
    });

    test('POST /bodega/productos - error por datos faltantes', async () => {
        const res = await request(app)
            .post('/bodega/productos')
            .send({ id_bodega: 1 }); // Falta id_sucursal

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/Debe enviar id_sucursal e id_bodega/i);
    });

    test('POST /bodega/productos - error del servidor', async () => {
        bodegaModel.obtenerProductos.mockRejectedValue(new Error('Error de BD'));

        const res = await request(app)
            .post('/bodega/productos')
            .send({ id_sucursal: 1, id_bodega: 1 });

        expect(res.status).toBe(500);
        expect(res.body.error).toMatch(/Error al obtener productos/i);
    });
});
