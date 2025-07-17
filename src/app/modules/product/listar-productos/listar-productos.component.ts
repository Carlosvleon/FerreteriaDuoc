import { Component, ViewChild, ElementRef } from '@angular/core';
import { ProductoService } from '../../../core/services/producto.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarritoService } from '../../../core/services/carrito.service';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

interface SucursalAgrupada {
  id_sucursal: number; // <-- OJO, snake_case, igual al backend
  nombre_sucursal: string;
  bodegas: { idBodega: number; nombreBodega: string; stock: number }[];
}
declare global {
  interface Window {
    bootstrap: any;
  }
}

@Component({
  selector: 'app-listar-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './listar-productos.component.html',
  styleUrl: './listar-productos.component.css',
})
export class ListarProductosComponent {
  @ViewChild('modalRef', { static: false }) modalRef!: ElementRef;
  imgUrl: string = environment.apiUrl;
  productosOriginal: any[] = [];
  productosFiltrados: any[] = [];
  marcas: string[] = [];
  categorias: string[] = [];
  mensajeError: string | null = null;
  mensajeExito: string | null = null;

  // Filtros
  filtroTexto = '';
  filtroMarca = '';
  filtroCategoria = '';
  filtroPrecioMin: number | null = null;
  filtroPrecioMax: number | null = null;

  // Paginación
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;

  // Otros
  productoSeleccionado: any = null;
  cantidadSeleccionada: number = 1;
  sucursalSeleccionada: string = '';
  maxStockSucursal: number = 1;

  constructor(
    private productoService: ProductoService,
    private carritoService: CarritoService,
    private router: Router
  ) { }

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.productoService.getProductos().subscribe({
      next: (data) => {
        this.mensajeError = null;
        this.productosOriginal = Array.isArray(data) ? data : [];
        this.actualizarFiltrosDinamicos();
        this.aplicarFiltros();
      },
      error: (error) => {
        this.mensajeError =
          'Error al obtener productos. Intenta nuevamente más tarde.';
        this.productosOriginal = [];
        this.productosFiltrados = [];
      },
    });
  }

  actualizarFiltrosDinamicos() {
    // Extrae marcas y categorías únicas, ignora null/undefined
    this.marcas = [
      ...new Set(this.productosOriginal.map((p) => p.marca).filter(Boolean)),
    ].sort();
    this.categorias = [
      ...new Set(
        this.productosOriginal.map((p) => p.categoria).filter(Boolean)
      ),
    ].sort();
  }

  aplicarFiltros() {
    this.productosFiltrados = this.productosOriginal.filter((p) => {
      const texto = this.filtroTexto.trim().toLowerCase();
      const coincideTexto =
        !texto ||
        (p.nombre && p.nombre.toLowerCase().includes(texto)) ||
        (p.codigo_producto &&
          p.codigo_producto.toLowerCase().includes(texto)) ||
        (p.marca && p.marca.toLowerCase().includes(texto)) ||
        (p.modelo && p.modelo.toLowerCase().includes(texto)) ||
        (p.categoria && p.categoria.toLowerCase().includes(texto));

      const coincideMarca = !this.filtroMarca || p.marca === this.filtroMarca;
      const coincideCategoria =
        !this.filtroCategoria || p.categoria === this.filtroCategoria;
      const coincidePrecioMin =
        !this.filtroPrecioMin || p.precio_online >= this.filtroPrecioMin;
      const coincidePrecioMax =
        !this.filtroPrecioMax || p.precio_online <= this.filtroPrecioMax;

      return (
        coincideTexto &&
        coincideMarca &&
        coincideCategoria &&
        coincidePrecioMin &&
        coincidePrecioMax
      );
    });

    this.totalPages = Math.max(
      1,
      Math.ceil(this.productosFiltrados.length / this.pageSize)
    );
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }

  limpiarFiltros() {
    this.filtroTexto = '';
    this.filtroMarca = '';
    this.filtroCategoria = '';
    this.filtroPrecioMin = null;
    this.filtroPrecioMax = null;
    this.aplicarFiltros();
  }

  get pagedProductos() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.productosFiltrados.slice(start, start + this.pageSize);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  // Modal y lógica de carrito (igual que antes)
  abrirModal(producto: any): void {
    this.productoSeleccionado = producto;
    // Selecciona la primera sucursal del array, NO con Object.values
    const primeraSucursal =
      producto.sedes && producto.sedes.length > 0 ? producto.sedes[0] : null;
    this.sucursalSeleccionada = primeraSucursal
      ? String(primeraSucursal.id_sucursal)
      : '';
    this.cantidadSeleccionada = 1;
    this.actualizarMaxStock();
  }
  actualizarMaxStock(): void {
    if (!this.productoSeleccionado || !this.productoSeleccionado.sedes) return;
    const sucursal = this.productoSeleccionado.sedes.find(
      (s: any) => String(s.id_sucursal) === String(this.sucursalSeleccionada)
    );
    const stockTotal =
      sucursal?.bodegas?.reduce((acc: number, b: any) => acc + b.stock, 0) || 0;
    this.maxStockSucursal = stockTotal;
    if (this.cantidadSeleccionada > stockTotal) {
      this.cantidadSeleccionada = stockTotal;
    }
  }

  onSucursalChange(): void {
    this.actualizarMaxStock();
  }

  confirmarAgregarAlCarrito(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.mensajeError =
        'Debes iniciar sesión para agregar productos al carrito.';
      this.cerrarModalBootstrap();
      setTimeout(() => {
        this.router.navigate(['/login']); // Redirige al login tras un segundo
      }, 3000);
      return;
    }
    const producto = this.productoSeleccionado;
    this.mensajeError = null;
    if (!producto || !producto.sedes) {
      this.mensajeError = 'Producto o stock no válido.';
      return;
    }
    const sucursal = (producto.sedes as SucursalAgrupada[]).find(
      (s) => String(s.id_sucursal) === this.sucursalSeleccionada
    );
    if (!sucursal || !sucursal.id_sucursal) {
      this.mensajeError = 'Sucursal no válida.';
      return;
    }
    const cantidad = this.cantidadSeleccionada;
    const stockTotal = sucursal.bodegas.reduce(
      (acc: number, b: any) => acc + b.stock,
      0
    );
    if (cantidad < 1 || cantidad > stockTotal) {
      this.mensajeError = 'Cantidad no válida.';
      return;
    }
    const productos = [
      {
        id_producto: producto.id_producto,
        cantidad: cantidad,
      },
    ];
this.carritoService.agregarProductosPorSucursal(sucursal.id_sucursal, productos).subscribe({
  next: () => {
    this.mensajeError = null;
    this.mensajeExito = 'Producto agregado al carrito exitosamente.';

    // Opcional: Oculta el mensaje después de unos segundos
    setTimeout(() => {
      this.mensajeExito = null;
      this.cerrarModalBootstrap();
    }, 1500);
  },
  error: (err) => {
    this.mensajeError = 'Error al agregar producto al carrito.';
    this.mensajeExito = null;
    console.error(err);
  }
});
  }

  sumarStockTotal(sucursal: SucursalAgrupada): number {
    return sucursal?.bodegas?.reduce((acc, b) => acc + b.stock, 0) || 0;
  }

  getSucursales(sedes: any[]): SucursalAgrupada[] {
    return Array.isArray(sedes) ? sedes : [];
  }
  cerrarModalBootstrap() {
    // Solo si el modal existe en el DOM
    if (this.modalRef && this.modalRef.nativeElement) {
      const modalElement = this.modalRef.nativeElement;
      // Cierra el modal usando Bootstrap JS si está cargado (asegúrate de tener Bootstrap JS)
      if (window.bootstrap) {
        const modalInstance =
          window.bootstrap.Modal.getInstance(modalElement) ||
          new window.bootstrap.Modal(modalElement);
        modalInstance.hide();
      } else {
        // Si no tienes Bootstrap JS, puedes forzar la clase (menos elegante)
        modalElement.classList.remove('show', 'd-block');
        modalElement.style.display = 'none';
        document.body.classList.remove('modal-open');
        // Elimina backdrop manualmente
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach((bd) => bd.remove());
      }
    }
  }
}
