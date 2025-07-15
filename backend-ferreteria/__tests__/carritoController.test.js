const request = require('supertest');
const app = require('../src/app');
const carritoModel = require('../src/models/CarritoModel');
const jwt = require('jsonwebtoken');

jest.mock('../src/models/CarritoModel');
jest.mock('jsonwebtoken');

// Helper para mockear token válido por defecto
beforeEach(() => {
  jwt.verify.mockReturnValue({ id_usuario: 1, email: "test@test.com" });
});
afterEach(() => jest.clearAllMocks());

function logCU(cu, descripcion, status, resultado) {
  const now = new Date().toISOString();
  console.log(`[${now}] [${cu}] ${descripcion} => ${resultado} (Status: ${status})`);
}

describe('carritoController', () => {
  // --- POST /api/carrito/agregar ---
  describe('POST /api/carrito/agregar', () => {
    test('CC-001: Carrito actualizado correctamente', async () => {
      carritoModel.agregar.mockResolvedValue({ status: 200, body: { message: "Carrito actualizado" } });
      const res = await request(app)
        .post('/api/carrito/agregar')
        .set('Authorization', 'Bearer valid.token')
        .send({ id_sucursal: 1, productos: [{ id_producto: 1, cantidad: 2 }] });
      logCU('CC-001', 'Carrito actualizado correctamente', res.statusCode, res.body.message || res.body.error);
      expect(res.statusCode).toBe(200);
    });

    test('CC-002: Múltiples productos', async () => {
      carritoModel.agregar.mockResolvedValue({ status: 200, body: { message: "Carrito actualizado" } });
      const res = await request(app)
        .post('/api/carrito/agregar')
        .set('Authorization', 'Bearer valid.token')
        .send({
          id_sucursal: 1,
          productos: [
            { id_producto: 1, cantidad: 2 },
            { id_producto: 2, cantidad: 1 }
          ]
        });
      logCU('CC-002', 'Múltiples productos', res.statusCode, res.body.message || res.body.error);
      expect(res.statusCode).toBe(200);
    });

    test('CC-003: Cantidad mínima', async () => {
      carritoModel.agregar.mockResolvedValue({ status: 200, body: { message: "Carrito actualizado" } });
      const res = await request(app)
        .post('/api/carrito/agregar')
        .set('Authorization', 'Bearer valid.token')
        .send({ id_sucursal: 1, productos: [{ id_producto: 1, cantidad: 1 }] });
      logCU('CC-003', 'Cantidad mínima', res.statusCode, res.body.message || res.body.error);
      expect(res.statusCode).toBe(200);
    });

    test('CC-004: Cantidad máxima', async () => {
      carritoModel.agregar.mockResolvedValue({ status: 200, body: { message: "Carrito actualizado" } });
      const res = await request(app)
        .post('/api/carrito/agregar')
        .set('Authorization', 'Bearer valid.token')
        .send({ id_sucursal: 1, productos: [{ id_producto: 1, cantidad: 9999 }] });
      logCU('CC-004', 'Cantidad máxima', res.statusCode, res.body.message || res.body.error);
      expect(res.statusCode).toBe(200);
    });

    test('CC-005: Array vacío', async () => {
      const res = await request(app)
        .post('/api/carrito/agregar')
        .set('Authorization', 'Bearer valid.token')
        .send({ id_sucursal: 1, productos: [] });
      logCU('CC-005', 'Array vacío', res.statusCode, res.body.error);
      expect(res.statusCode).toBe(400);
    });

    test('CC-006: Cantidad cero', async () => {
      const res = await request(app)
        .post('/api/carrito/agregar')
        .set('Authorization', 'Bearer valid.token')
        .send({ id_sucursal: 1, productos: [{ id_producto: 1, cantidad: 0 }] });
      logCU('CC-006', 'Cantidad cero', res.statusCode, res.body.error);
      expect(res.statusCode).toBe(400);
    });

    test('CC-007: Cantidad negativa', async () => {
      const res = await request(app)
        .post('/api/carrito/agregar')
        .set('Authorization', 'Bearer valid.token')
        .send({ id_sucursal: 1, productos: [{ id_producto: 1, cantidad: -1 }] });
      logCU('CC-007', 'Cantidad negativa', res.statusCode, res.body.error);
      expect(res.statusCode).toBe(400);
    });

    test('CC-008: id_producto string', async () => {
      const res = await request(app)
        .post('/api/carrito/agregar')
        .set('Authorization', 'Bearer valid.token')
        .send({ id_sucursal: 1, productos: [{ id_producto: "1", cantidad: 2 }] });
      logCU('CC-008', 'id_producto string', res.statusCode, res.body.error);
      expect(res.statusCode).toBe(400);
    });

    test('CC-009: cantidad string', async () => {
      const res = await request(app)
        .post('/api/carrito/agregar')
        .set('Authorization', 'Bearer valid.token')
        .send({ id_sucursal: 1, productos: [{ id_producto: 1, cantidad: "2" }] });
      logCU('CC-009', 'cantidad string', res.statusCode, res.body.error);
      expect(res.statusCode).toBe(400);
    });

    test('CC-010: id_producto null', async () => {
      const res = await request(app)
        .post('/api/carrito/agregar')
        .set('Authorization', 'Bearer valid.token')
        .send({ id_sucursal: 1, productos: [{ id_producto: null, cantidad: 2 }] });
      logCU('CC-010', 'id_producto null', res.statusCode, res.body.error);
      expect(res.statusCode).toBe(400);
    });

    test('CC-011: cantidad null', async () => {
      const res = await request(app)
        .post('/api/carrito/agregar')
        .set('Authorization', 'Bearer valid.token')
        .send({ id_sucursal: 1, productos: [{ id_producto: 1, cantidad: null }] });
      logCU('CC-011', 'cantidad null', res.statusCode, res.body.error);
      expect(res.statusCode).toBe(400);
    });

    test('CC-012: cantidad decimal', async () => {
      const res = await request(app)
        .post('/api/carrito/agregar')
        .set('Authorization', 'Bearer valid.token')
        .send({ id_sucursal: 1, productos: [{ id_producto: 1, cantidad: 2.5 }] });
      logCU('CC-012', 'cantidad decimal', res.statusCode, res.body.error);
      expect(res.statusCode).toBe(200);
    });

    test('CC-013: id_producto faltante', async () => {
      const res = await request(app)
        .post('/api/carrito/agregar')
        .set('Authorization', 'Bearer valid.token')
        .send({ id_sucursal: 1, productos: [{ cantidad: 2 }] });
      logCU('CC-013', 'id_producto faltante', res.statusCode, res.body.error);
      expect(res.statusCode).toBe(400);
    });

    test('CC-014: cantidad faltante', async () => {
      const res = await request(app)
        .post('/api/carrito/agregar')
        .set('Authorization', 'Bearer valid.token')
        .send({ id_sucursal: 1, productos: [{ id_producto: 1 }] });
      logCU('CC-014', 'cantidad faltante', res.statusCode, res.body.error);
      expect(res.statusCode).toBe(400);
    });

    test('CC-015: Sin body', async () => {
      const res = await request(app)
        .post('/api/carrito/agregar')
        .set('Authorization', 'Bearer valid.token');
      logCU('CC-015', 'Sin body', res.statusCode, res.body.error);
      expect(res.statusCode).toBe(500);
    });

    test('CC-016: Sin id_sucursal', async () => {
      const res = await request(app)
        .post('/api/carrito/agregar')
        .set('Authorization', 'Bearer valid.token')
        .send({ productos: [{ id_producto: 1, cantidad: 2 }] });
      logCU('CC-016', 'Sin id_sucursal', res.statusCode, res.body.error);
      expect(res.statusCode).toBe(400);
    });

    test('CC-017: Sin productos', async () => {
      const res = await request(app)
        .post('/api/carrito/agregar')
        .set('Authorization', 'Bearer valid.token')
        .send({ id_sucursal: 1 });
      logCU('CC-017', 'Sin productos', res.statusCode, res.body.error);
      expect(res.statusCode).toBe(400);
    });

    test('CC-018: productos null', async () => {
      const res = await request(app)
        .post('/api/carrito/agregar')
        .set('Authorization', 'Bearer valid.token')
        .send({ id_sucursal: 1, productos: null });
      logCU('CC-018', 'productos null', res.statusCode, res.body.error);
      expect(res.statusCode).toBe(400);
    });

    test('CC-019: Error BD', async () => {
      carritoModel.agregar.mockRejectedValue(new Error('DB error'));
      const res = await request(app)
        .post('/api/carrito/agregar')
        .set('Authorization', 'Bearer valid.token')
        .send({ id_sucursal: 1, productos: [{ id_producto: 1, cantidad: 2 }] });
      logCU('CC-019', 'Error BD', res.statusCode, res.body.error);
      expect(res.statusCode).toBe(500);
    });

    test('CC-020: Stock insuficiente', async () => {
      carritoModel.agregar.mockRejectedValue(new Error('Stock insuficiente'));
      const res = await request(app)
        .post('/api/carrito/agregar')
        .set('Authorization', 'Bearer valid.token')
        .send({ id_sucursal: 1, productos: [{ id_producto: 1, cantidad: 9999 }] });
      logCU('CC-020', 'Stock insuficiente', res.statusCode, res.body.error);
      expect(res.statusCode).toBe(500);
    });

    test('CC-021: Sin bodegas', async () => {
      carritoModel.agregar.mockRejectedValue(new Error('No hay bodegas'));
      const res = await request(app)
        .post('/api/carrito/agregar')
        .set('Authorization', 'Bearer valid.token')
        .send({ id_sucursal: 1, productos: [{ id_producto: 1, cantidad: 2 }] });
      logCU('CC-021', 'Sin bodegas', res.statusCode, res.body.error);
      expect(res.statusCode).toBe(500);
    });

    test('CC-022: Sin precio', async () => {
      carritoModel.agregar.mockRejectedValue(new Error('Sin precio'));
      const res = await request(app)
        .post('/api/carrito/agregar')
        .set('Authorization', 'Bearer valid.token')
        .send({ id_sucursal: 1, productos: [{ id_producto: 1, cantidad: 2 }] });
      logCU('CC-022', 'Sin precio', res.statusCode, res.body.error);
      expect(res.statusCode).toBe(500);
    });

    test('CC-023: Timeout BD', async () => {
      carritoModel.agregar.mockRejectedValue(new Error('Timeout'));
      const res = await request(app)
        .post('/api/carrito/agregar')
        .set('Authorization', 'Bearer valid.token')
        .send({ id_sucursal: 1, productos: [{ id_producto: 1, cantidad: 2 }] });
      logCU('CC-023', 'Timeout BD', res.statusCode, res.body.error);
      expect(res.statusCode).toBe(500);
    });
  });

  // --- GET /api/carrito/ ---
  describe('GET /api/carrito/', () => {
    test('CC-024: Usuario con carrito', async () => {
      carritoModel.obtenerCarrito.mockResolvedValue({ id_carrito_compras: 1, productos: [{ id_producto: 1, cantidad: 2 }], total_general: 2000 });
      const res = await request(app)
        .get('/api/carrito/')
        .set('Authorization', 'Bearer valid.token');
      logCU('CC-024', 'Usuario con carrito', res.statusCode, JSON.stringify(res.body));
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id_carrito_compras');
      expect(Array.isArray(res.body.productos)).toBe(true);
    });

    test('CC-025: Usuario sin carrito', async () => {
      carritoModel.obtenerCarrito.mockResolvedValue({ mensaje: "El usuario no tiene un carrito activo." });
      const res = await request(app)
        .get('/api/carrito/')
        .set('Authorization', 'Bearer valid.token');
      logCU('CC-025', 'Usuario sin carrito', res.statusCode, JSON.stringify(res.body));
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('mensaje');
    });

    test('CC-026: Carrito vacío', async () => {
      carritoModel.obtenerCarrito.mockResolvedValue({ id_carrito_compras: 1, productos: [], total_general: 0 });
      const res = await request(app)
        .get('/api/carrito/')
        .set('Authorization', 'Bearer valid.token');
      logCU('CC-026', 'Carrito vacío', res.statusCode, JSON.stringify(res.body));
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.productos)).toBe(true);
      expect(res.body.productos.length).toBe(0);
    });

    test('CC-027: Carrito con un producto', async () => {
      carritoModel.obtenerCarrito.mockResolvedValue({ id_carrito_compras: 1, productos: [{ id_producto: 1, cantidad: 1 }], total_general: 1000 });
      const res = await request(app)
        .get('/api/carrito/')
        .set('Authorization', 'Bearer valid.token');
      logCU('CC-027', 'Carrito con un producto', res.statusCode, JSON.stringify(res.body));
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.productos)).toBe(true);
      expect(res.body.productos.length).toBe(1);
    });

    test('CC-028: Error BD', async () => {
      carritoModel.obtenerCarrito.mockRejectedValue(new Error('DB error'));
      const res = await request(app)
        .get('/api/carrito/')
        .set('Authorization', 'Bearer valid.token');
      logCU('CC-028', 'Error BD', res.statusCode, res.body.error);
      expect(res.statusCode).toBe(500);
    });

    test('CC-029: Error SQL', async () => {
      carritoModel.obtenerCarrito.mockRejectedValue(new Error('SQL error'));
      const res = await request(app)
        .get('/api/carrito/')
        .set('Authorization', 'Bearer valid.token');
      logCU('CC-029', 'Error SQL', res.statusCode, res.body.error);
      expect(res.statusCode).toBe(500);
    });

    test('CC-030: Timeout BD', async () => {
      carritoModel.obtenerCarrito.mockRejectedValue(new Error('Timeout'));
      const res = await request(app)
        .get('/api/carrito/')
        .set('Authorization', 'Bearer valid.token');
      logCU('CC-030', 'Timeout BD', res.statusCode, res.body.error);
      expect(res.statusCode).toBe(500);
    });

    test('CC-031: Pool agotado', async () => {
      carritoModel.obtenerCarrito.mockRejectedValue(new Error('Pool agotado'));
      const res = await request(app)
        .get('/api/carrito/')
        .set('Authorization', 'Bearer valid.token');
      logCU('CC-031', 'Pool agotado', res.statusCode, res.body.error);
      expect(res.statusCode).toBe(500);
    });
  });
});
