import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { CommonModule, NgForOf } from '@angular/common';
import { AdminProductoFormComponent } from '../admin-producto-form/admin-producto-form.component';
import { AdminProductoEditComponent } from '../admin-producto-edit/admin-producto-edit.component';
import { FormsModule } from '@angular/forms';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-admin-producto',
  standalone: true,
  templateUrl: './admin-producto.component.html',
  styleUrls: ['./admin-producto.component.css'],
  imports: [
    NgForOf,
    CommonModule,
    FormsModule,
    AdminProductoFormComponent,
    AdminProductoEditComponent,
  ],
})
export class AdminProductoComponent implements OnInit {
  productos: any[] = [];
  mostrarModal = false;
  mensaje: string | null = null;
  tipoMensaje: 'success' | 'error' | null = null;
  mostrarModalEdicion = false;
  productoSeleccionado: any = null;
  productosOriginal: any[] = [];
  imgUrl: string = environment.apiUrl;

  // Filtros dinámicos
  marcas: string[] = [];
  categorias: string[] = [];
  rangoPrecios: number[] = [];

  // Filtros seleccionados
  filtroMarca: string = '';
  filtroCategoria: string = '';
  filtroPrecioMax: number | null = null;
  filtroPrecioMin: number | null = null;
  filtroTexto: string = '';
  filtroEstado: string = '';
  mostrarModalCreacion = false;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.obtenerProductos();
  }

  obtenerProductos(): void {
    this.adminService.listarProductos().subscribe({
      next: (data) => {
        console.log('Productos obtenidos:', data);
        this.productosOriginal = data.map((p) => ({
          ...p,
          sinStockAsignado:
            !p.sedes ||
            Object.values(p.sedes).every(
              (sede: any) =>
                !sede.bodegas ||
                sede.bodegas.every((bodega: any) => !bodega.idBodega)
            ),
        }));
        this.productos = [...this.productosOriginal];
        this.generarFiltros();
      },
      error: (err) => console.error('Error al listar productos', err),
    });
  }

  generarFiltros(): void {
    const precios = this.productosOriginal
      .map((p) => p.precioOnline)
      .sort((a, b) => a - b);
    const min = precios[0];
    const max = precios[precios.length - 1];
    const paso = Math.ceil((max - min) / 4);
    this.rangoPrecios = [min, min + paso, min + 2 * paso, min + 3 * paso, max];

    this.marcas = [
      ...new Set(this.productosOriginal.map((p) => p.marca)),
    ].sort();
    this.categorias = [
      ...new Set(this.productosOriginal.map((p) => p.categoria)),
    ].sort();
  }

  aplicarFiltros(): void {
    this.productos = this.productosOriginal.filter((p) => {
      // Filtro por marca
      if (this.filtroMarca && p.marca !== this.filtroMarca) return false;
      // Filtro por categoría
      if (this.filtroCategoria && p.categoria !== this.filtroCategoria)
        return false;
      // Filtro por precio mínimo
      if (this.filtroPrecioMin && p.precioOnline < this.filtroPrecioMin)
        return false;
      // Filtro por precio máximo
      if (this.filtroPrecioMax && p.precioOnline > this.filtroPrecioMax)
        return false;

      // **Filtro por texto**
      const texto = this.filtroTexto?.toLowerCase() || '';
      if (
        texto &&
        !(
          p.nombre?.toLowerCase().includes(texto) ||
          p.codigoProducto?.toLowerCase().includes(texto) ||
          p.marca?.toLowerCase().includes(texto) ||
          p.modelo?.toLowerCase().includes(texto) ||
          p.categoria?.toLowerCase().includes(texto)
        )
      ) {
        return false;
      }

      // **Filtro por estado**
      if (this.filtroEstado === 'activo' && p.activo !== true) return false;
      if (this.filtroEstado === 'inactivo' && p.activo !== false) return false;

      return true;
    });
  }

  limpiarFiltros(): void {
    this.filtroMarca = '';
    this.filtroCategoria = '';
    this.filtroPrecioMin = null;
    this.filtroPrecioMax = null;
    this.filtroTexto = '';
    this.filtroEstado = '';
    this.aplicarFiltros();
  }

  confirmarFix(producto: any): void {
    const confirmar = confirm(
      `El producto "${producto.nombre}" no tiene stock asignado. ¿Deseas corregirlo automáticamente?`
    );

    if (confirmar) {
      this.adminService.fixProductoSinStock(producto.idProducto).subscribe({
        next: () => {
          alert('Stock corregido automáticamente.');
          this.obtenerProductos(); // Vuelve a cargar la lista
        },
        error: () => {
          alert('Ocurrió un error al intentar corregir el producto.');
        },
      });
    }
  }

  getSedeIds(producto: any): any[] {
    return Object.keys(producto?.stock_por_bodega || {});
  }

  // ahora creamos la logica para mostrarModalCreacion abrirModalCreacion() onProductoCreado
  abrirModalCreacion(): void {
    this.mostrarModalCreacion = true;
  }

  cerrarModalCreacion(): void {
    this.mostrarModalCreacion = false;
  }

  onProductoCreado(): void {
    this.obtenerProductos(); // solo refresca la lista
    this.mostrarModalCreacion = false;
    this.mensaje = 'Producto creado correctamente';
    this.obtenerProductos(); // solo refresca la lista
    this.mostrarModalCreacion = false;
    this.tipoMensaje = 'success';
    setTimeout(() => (this.mensaje = null), 4000);
  }

  abrirModalEdicion(producto: any): void {
    // Transforma los nombres al formato del formulario
    this.productoSeleccionado = {
      ...producto,
      codigoProducto: producto.codigo_producto,
      nombre: producto.nombre_producto,
      idMarca: producto.id_marca,
      idModelo: producto.id_modelo,
      idCategoria: producto.id_categoria,
      precioOnline: producto.precio_online,
      // Si quieres, puedes agregar más campos si los usas en el form
    };
    this.mostrarModalEdicion = true;
  }

  onProductoEditado(): void {
    this.obtenerProductos(); // solo refresca la lista, NO cierra el modal
  }
  cerrarModalEdicion(): void {
    this.productoSeleccionado = null;
    this.mostrarModalEdicion = false;
  }

  getStockSucursal(bodegas: any[]): number {
    if (!bodegas) return 0;
    return bodegas.reduce((acc: number, b: any) => acc + (b.stock || 0), 0);
  }

  getStockTotal(producto: any): number {
    if (!producto.stock_por_bodega) {
      return 0;
    }
    return producto.stock_por_bodega.reduce(
      (acc: number, b: any) => acc + b.stock,
      0
    );
  }
}
