const request = require('supertest');
const express = require('express');
const multer = require('multer');

// Mockear dependencias antes de que sean importadas por el controlador
jest.mock('../../../src/models/admin/adminProductModel');
jest.mock('../../../src/models/admin/adminCompraModel');
jest.mock('../../../src/models/admin/adminTransaccionModel');
jest.mock('fs-extra');

const adminProductModel = require('../../../src/models/admin/adminProductModel');
const adminCompraModel = require('../../../src/models/admin/adminCompraModel');
const adminTransaccionModel = require('../../../src/models/admin/adminTransaccionModel');
const fs = require('fs-extra');
const adminController = require('../../../src/controllers/admin/adminController');

const app = express();
app.use(express.json());

// Configurar multer para las pruebas de subida de archivos
const upload = multer({ storage: multer.memoryStorage() });

// --- Rutas para probar el controlador ---
app.post('/productos', adminController.crearProducto);
app.get('/productos', adminController.listarProductos);
app.put('/productos/:idProducto', adminController.actualizarProducto);
app.post('/productos/:idProducto/imagen', upload.single('imagen'), adminController.subirImagenProducto);

app.get('/compras', adminController.listarCompras);
app.get('/compras/:idCompra', adminController.verDetalleCompra);

app.get('/transacciones', adminController.listarTransacciones);

app.get('/marcas', adminController.listarMarcas);
app.get('/modelos', adminController.listarModelos);
app.get('/categorias', adminController.listarCategorias);


describe('adminController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ========= PRODUCTOS =========
  describe('Productos', () => {
    describe('POST /productos (crearProducto)', () => {
      it('debe crear un producto y retornar 201', async () => {
        const nuevoProducto = { nombre: 'Martillo', precio: 15000 };
        adminProductModel.crearProducto.mockResolvedValue('new-product-id');

        const response = await request(app).post('/productos').send(nuevoProducto);

        expect(response.status).toBe(201);
        expect(response.body).toEqual({ message: 'Producto creado con éxito', idProducto: 'new-product-id' });
        expect(adminProductModel.crearProducto).toHaveBeenCalledWith(nuevoProducto);
      });

      it('debe retornar 500 si hay un error en el modelo', async () => {
        adminProductModel.crearProducto.mockRejectedValue(new Error('DB Error'));

        const response = await request(app).post('/productos').send({ nombre: 'Martillo' });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Error interno al crear el producto.' });
      });
    });

    describe('GET /productos (listarProductos)', () => {
      it('debe listar todos los productos y retornar 200', async () => {
        const mockProductos = [{ id: 1, nombre: 'Taladro' }, { id: 2, nombre: 'Sierra' }];
        adminProductModel.obtenerProductosConDetalles.mockResolvedValue(mockProductos);

        const response = await request(app).get('/productos');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockProductos);
        expect(adminProductModel.obtenerProductosConDetalles).toHaveBeenCalled();
      });

       it('debe retornar 500 si hay un error en el modelo', async () => {
        adminProductModel.obtenerProductosConDetalles.mockRejectedValue(new Error('DB Error'));

        const response = await request(app).get('/productos');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Error interno al obtener los productos.' });
      });
    });

    describe('PUT /productos/:idProducto (actualizarProducto)', () => {
        it('debe actualizar un producto y retornar 200', async () => {
            const idProducto = '123';
            const datosActualizados = { precio: 20000 };
            adminProductModel.actualizarProducto.mockResolvedValue(undefined);

            const response = await request(app).put(`/productos/${idProducto}`).send(datosActualizados);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'Producto actualizado correctamente' });
            expect(adminProductModel.actualizarProducto).toHaveBeenCalledWith(idProducto, datosActualizados);
        });

        it('debe retornar 500 si hay un error en el modelo', async () => {
            const idProducto = '123';
            adminProductModel.actualizarProducto.mockRejectedValue(new Error('DB Error'));

            const response = await request(app).put(`/productos/${idProducto}`).send({ precio: 20000 });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Error interno al actualizar el producto.' });
        });
    });

    describe('POST /productos/:idProducto/imagen (subirImagenProducto)', () => {
        it('debe subir una imagen y retornar 200', async () => {
            const idProducto = 'prod-123';
            fs.ensureDir.mockResolvedValue(undefined);
            fs.move.mockResolvedValue(undefined);
            adminProductModel.actualizarRutaImagen.mockResolvedValue(undefined);

            const response = await request(app)
                .post(`/productos/${idProducto}/imagen`)
                .attach('imagen', Buffer.from('fake image data'), 'test-image.jpg');

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Imagen subida y asociada correctamente');
            expect(response.body).toHaveProperty('path');
            expect(fs.ensureDir).toHaveBeenCalled();
            expect(fs.move).toHaveBeenCalled();
            expect(adminProductModel.actualizarRutaImagen).toHaveBeenCalled();
        });

        it('debe retornar 400 si no se sube un archivo', async () => {
            const idProducto = 'prod-123';
            const response = await request(app).post(`/productos/${idProducto}/imagen`);

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: 'No se ha subido ningún archivo.' });
        });

        it('debe retornar 500 si falla el movimiento del archivo', async () => {
            const idProducto = 'prod-123';
            fs.ensureDir.mockResolvedValue(undefined);
            fs.move.mockRejectedValue(new Error('File System Error'));

            const response = await request(app)
                .post(`/productos/${idProducto}/imagen`)
                .attach('imagen', Buffer.from('fake image data'), 'test-image.jpg');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Error interno al procesar la imagen.' });
        });
    });
  });

  // ========= COMPRAS =========
  describe('Compras', () => {
    describe('GET /compras (listarCompras)', () => {
        it('debe listar las compras con filtros y retornar 200', async () => {
            const mockCompras = { data: [{ id: 1, total: 5000 }] };
            adminCompraModel.listarComprasConFiltros.mockResolvedValue(mockCompras);

            const response = await request(app).get('/compras?estado=pendiente');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockCompras);
            expect(adminCompraModel.listarComprasConFiltros).toHaveBeenCalledWith({ estado: 'pendiente' });
        });

        it('debe retornar 500 si hay un error en el modelo', async () => {
            adminCompraModel.listarComprasConFiltros.mockRejectedValue(new Error('DB Error'));
            const response = await request(app).get('/compras');
            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Error interno al obtener las compras.' });
        });
    });

    describe('GET /compras/:idCompra (verDetalleCompra)', () => {
        it('debe mostrar el detalle de una compra y retornar 200', async () => {
            const idCompra = 'compra-1';
            const mockDetalle = { compra: { id: idCompra }, items: [] };
            adminCompraModel.obtenerDetalleCompra.mockResolvedValue(mockDetalle);

            const response = await request(app).get(`/compras/${idCompra}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockDetalle);
            expect(adminCompraModel.obtenerDetalleCompra).toHaveBeenCalledWith(idCompra);
        });

        it('debe retornar 404 si la compra no existe', async () => {
            const idCompra = 'compra-inexistente';
            adminCompraModel.obtenerDetalleCompra.mockResolvedValue(null);

            const response = await request(app).get(`/compras/${idCompra}`);

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: 'Compra no encontrada' });
        });
    });
  });

  // ========= TRANSACCIONES =========
  describe('Transacciones', () => {
    describe('GET /transacciones (listarTransacciones)', () => {
        it('debe listar las transacciones con filtros y retornar 200', async () => {
            const mockTransacciones = { data: [{ id: 1, monto: 5000 }] };
            adminTransaccionModel.listarTransaccionesConFiltros.mockResolvedValue(mockTransacciones);

            const response = await request(app).get('/transacciones?fecha=2023-01-01');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockTransacciones);
            expect(adminTransaccionModel.listarTransaccionesConFiltros).toHaveBeenCalledWith({ fecha: '2023-01-01' });
        });
    });
  });

  // ========= CATÁLOGOS =========
  describe('Catálogos', () => {
    describe('GET /marcas (listarMarcas)', () => {
        it('debe listar las marcas y retornar 200', async () => {
            const mockMarcas = [{ id: 1, nombre: 'Marca A' }];
            adminProductModel.listarMarcas.mockResolvedValue(mockMarcas);

            const response = await request(app).get('/marcas');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockMarcas);
            expect(adminProductModel.listarMarcas).toHaveBeenCalled();
        });

        it('debe retornar 500 si hay un error en el modelo', async () => {
            adminProductModel.listarMarcas.mockRejectedValue(new Error('DB Error'));
            const response = await request(app).get('/marcas');
            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Error interno al obtener el listado.' });
        });
    });
  });
});