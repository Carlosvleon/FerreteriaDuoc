import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { CommonModule, NgForOf } from '@angular/common';
import { AdminProductoFormComponent } from '../admin-producto-form/admin-producto-form.component';
import { AdminProductoEditComponent } from '../admin-producto-edit/admin-producto-edit.component';


@Component({
  selector: 'app-admin-producto',
  standalone: true,
  templateUrl: './admin-producto.component.html',
  styleUrls: ['./admin-producto.component.css'],
  imports: [NgForOf, CommonModule, AdminProductoFormComponent, AdminProductoEditComponent],
})
export class AdminProductoComponent implements OnInit {
  productos: any[] = [];
  mostrarModal = false;
  mensaje: string | null = null;
  tipoMensaje: 'success' | 'error' | null = null;
  mostrarModalEdicion = false;
  productoSeleccionado: any = null;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.obtenerProductos();
  }

  obtenerProductos(): void {
    this.adminService.listarProductos().subscribe({
      next: (data) => {
        console.log('Productos recibidos:', data);
        this.productos = data;
      },
      error: (err) => console.error('Error al listar productos', err),
    });
  }

  getSedeIds(sedes: any): string[] {
    return Object.keys(sedes);
  }

  onProductoCreado(data: any): void {
    this.adminService.crearProducto(data).subscribe({
      next: () => {
        this.obtenerProductos();
        this.mostrarModal = false;
        this.mensaje = 'Producto creado correctamente';
        this.tipoMensaje = 'success';
        setTimeout(() => this.mensaje = null, 4000);
      },
      error: (err) => {
        this.mensaje = 'Error al crear producto';
        this.tipoMensaje = 'error';
        setTimeout(() => this.mensaje = null, 4000);
        console.error(err);
      }
    });
  }
  abrirModalEdicion(producto: any): void {
    this.productoSeleccionado = producto;
    this.mostrarModalEdicion = true;
  }

  cerrarModalEdicion(): void {
    this.productoSeleccionado = null;
    this.mostrarModalEdicion = false;
  }
  onProductoEditado(): void {
    this.obtenerProductos();
    this.cerrarModalEdicion();
  }

  getStockSucursal(bodegas: any[]): number {
    if (!bodegas) return 0;
    return bodegas.reduce((acc: number, b: any) => acc + (b.stock || 0), 0);
  }

  getStockTotal(producto: any): number {
    let total = 0;
    if (producto.sedes) {
      for (const sedeId of this.getSedeIds(producto.sedes)) {
        total += this.getStockSucursal(producto.sedes[sedeId].bodegas);
      }
    }
    return total;
  }
}
