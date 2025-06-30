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

  constructor(
    private productoService: ProductoService,
    private carritoService: CarritoService
  ) { }

  ngOnInit() {
    this.productoService.getProductos().subscribe({
      next: (productData) => {
        console.log('Productos obtenidos:', productData);
        if (!Array.isArray(productData)) {
          console.error('Formato de datos inválido');
          return;
        }
        this.listaProductos = productData;
        this.filterProducts();
      },
      error: (error) => {
        console.error('Error al obtener productos', error);
      }
    });
  }

  filterProducts(): void {
    // Filtra por nombre (puedes agregar más campos si lo deseas)
    if (this.searchTerm) {
      this.filteredProductos = this.listaProductos.filter(p =>
        p.nombre?.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.filteredProductos = [...this.listaProductos];
    }
    this.totalPages = Math.max(1, Math.ceil(this.filteredProductos.length / this.pageSize));
    // Ajusta la página actual si es necesario
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

  agregarAlCarrito(producto: any, cantidad: number = 1) {
    const productos = [{
      id_producto: producto.id_producto,
      cantidad: cantidad
    }];
    // Aquí debes obtener el id_sucursal adecuado, por ejemplo, el primero disponible:
    const id_sucursal = producto.stock_por_sucursal?.[0]?.id_sucursal;
    if (!id_sucursal) {
      alert('No se encontró una sucursal válida para este producto');
      return;
    }
this.carritoService.agregarProductosPorSucursal(id_sucursal, productos).subscribe({
  next: () => {
    alert('Producto agregado al carrito');
    this.cerrarModal();
  },
  error: (err) => {
    alert('Error al agregar producto');
    console.error(err);
  }
});
  }

abrirModal(producto: any): void {
  this.productoSeleccionado = producto;
  this.sucursalSeleccionada = producto.stock_por_sucursal?.[0]?.nombre_sucursal || '';
  this.cantidadSeleccionada = 1;
  this.actualizarMaxStock(); // Actualiza el límite según la sucursal seleccionada
  this.modalAbierto = true;
}

actualizarMaxStock(): void {
  const producto = this.productoSeleccionado;
  const sucursal = producto?.stock_por_sucursal?.find(
    (s: any) => s.id_sucursal === +this.sucursalSeleccionada
  );
  this.maxStockSucursal = sucursal ? sucursal.stock : 1;
  if (this.cantidadSeleccionada > this.maxStockSucursal) {
    this.cantidadSeleccionada = this.maxStockSucursal;
  }
}
onSucursalChange(): void {
  this.actualizarMaxStock();
}


cerrarModal(): void {
  this.modalAbierto = false;
  this.productoSeleccionado = null;
}

confirmarAgregarAlCarrito(): void {
  const producto = this.productoSeleccionado;
  console.log('Producto seleccionado:', producto);
  if (!producto) {
    alert('No se ha seleccionado un producto');
    return;
  }
  const cantidad = this.cantidadSeleccionada;

  if (!producto || !producto.stock_por_sucursal || !Array.isArray(producto.stock_por_sucursal)) {
    alert('Producto o stock no válido');
    return;
  }

const sucursal = producto.stock_por_sucursal.find(
  (s: any) => s.id_sucursal === +this.sucursalSeleccionada
);

  if (!sucursal || !sucursal.id_sucursal) {
    alert('Sucursal no válida');
    return;
  }

  if (cantidad < 1 || cantidad > (sucursal.stock || 0)) {
    alert('Cantidad no válida');
    return;
  }

  const productos = [{
    id_producto: producto.id_producto,
    cantidad: cantidad
  }];

  this.carritoService.agregarProductosPorSucursal(sucursal.id_sucursal, productos).subscribe({
    next: () => {
      alert('Producto agregado al carrito');
      this.cerrarModal();
    },
    error: (err) => {
      alert('Error al agregar producto');
      console.error(err);
    }
  });
}



}
