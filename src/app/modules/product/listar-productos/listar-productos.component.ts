interface SucursalAgrupada {
  idSucursal: number;
  nombreSucursal: string;
  bodegas: { idBodega: number; nombreBodega: string; stock: number }[];
}


import { Component } from '@angular/core';
import { ProductoService } from '../../../core/services/producto.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarritoService } from '../../../core/services/carrito.service';

@Component({
  selector: 'app-listar-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './listar-productos.component.html',
  styleUrl: './listar-productos.component.css'
})
export class ListarProductosComponent {
  listaProductos: any[] = [];
  filteredProductos: any[] = [];
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  public searchTerm: string = '';
  productoSeleccionado: any = null;
  modalAbierto: boolean = false;
  cantidadSeleccionada: number = 1;
  sucursalSeleccionada: string = '';
  maxStockSucursal: number = 1;
  mensajeError: string | null = null;

  constructor(
    private productoService: ProductoService,
    private carritoService: CarritoService
  ) { }

  ngOnInit() {
    this.productoService.getProductos().subscribe({
      next: (productData) => {
        this.mensajeError = null;
        if (!Array.isArray(productData)) {
          this.mensajeError = 'Formato de datos inválido al cargar productos.';
          return;
        }
        this.listaProductos = productData;
        this.filterProducts();
      },
      error: (error) => {
        this.mensajeError = 'Error al obtener productos. Intenta nuevamente más tarde.';
        console.error('Error al obtener productos', error);
      }
    });
  }

  filterProducts(): void {
    if (this.searchTerm) {
      this.filteredProductos = this.listaProductos.filter(p =>
        p.nombre?.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.filteredProductos = [...this.listaProductos];
    }
    this.totalPages = Math.max(1, Math.ceil(this.filteredProductos.length / this.pageSize));
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }

  get pagedProductos() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredProductos.slice(start, start + this.pageSize);
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

  abrirModal(producto: any): void {
    this.productoSeleccionado = producto;
    const primeraSucursal = Object.values(producto.sedes)[0] as SucursalAgrupada;
    this.sucursalSeleccionada = primeraSucursal?.idSucursal !== undefined ? String(primeraSucursal.idSucursal) : '';
    this.cantidadSeleccionada = 1;
    this.actualizarMaxStock();
    this.modalAbierto = true;
  }

  actualizarMaxStock(): void {
    const producto = this.productoSeleccionado;
    const sucursal = (Object.values(producto?.sedes || {}) as SucursalAgrupada[]).find(
      (s) => s.idSucursal === +this.sucursalSeleccionada
    );

    const stockTotal = sucursal?.bodegas?.reduce((acc: number, b: any) => acc + b.stock, 0) || 1;
    this.maxStockSucursal = stockTotal;
    if (this.cantidadSeleccionada > stockTotal) {
      this.cantidadSeleccionada = stockTotal;
    }
  }

  onSucursalChange(): void {
    this.actualizarMaxStock();
  }

  confirmarAgregarAlCarrito(): void {
    const producto = this.productoSeleccionado;
    this.mensajeError = null;
    if (!producto || !producto.sedes) {
      this.mensajeError = 'Producto o stock no válido.';
      return;
    }

    const sucursal = (Object.values(producto.sedes) as SucursalAgrupada[]).find(
      (s) => s.idSucursal === +this.sucursalSeleccionada
    );

    if (!sucursal || !sucursal.idSucursal) {
      this.mensajeError = 'Sucursal no válida.';
      return;
    }

    const cantidad = this.cantidadSeleccionada;
    const stockTotal = sucursal.bodegas.reduce((acc: number, b: any) => acc + b.stock, 0);

    if (cantidad < 1 || cantidad > stockTotal) {
      this.mensajeError = 'Cantidad no válida.';
      return;
    }

    const productos = [{
      id_producto: producto.id_producto,
      cantidad: cantidad
    }];

    this.carritoService.agregarProductosPorSucursal(sucursal.idSucursal, productos).subscribe({
      next: () => {
        this.mensajeError = null;
        // Opcional: podrías mostrar un mensaje de éxito si lo deseas
      },
      error: (err) => {
        this.mensajeError = 'Error al agregar producto al carrito.';
        console.error(err);
      }
    });
  }
sumarStockTotal(sucursal: any): number {
  return sucursal?.bodegas?.reduce((acc: number, b: any) => acc + b.stock, 0) || 0;
}
  objectValues = Object.values;

  getSucursales(producto: any): SucursalAgrupada[] {
    return Object.values(producto?.sedes || {}) as SucursalAgrupada[];
  }
}
