import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { CommonModule, NgForOf } from '@angular/common';
import { AdminProductoFormComponent } from '../admin-producto-form/admin-producto-form.component';

@Component({
  selector: 'app-admin-producto',
  standalone: true,
  templateUrl: './admin-producto.component.html',
  styleUrls: ['./admin-producto.component.css'],
  imports: [NgForOf, CommonModule, AdminProductoFormComponent], // puedes agregar módulos aquí si necesitas
})
export class AdminProductoComponent implements OnInit {
  productos: any[] = [];
  mostrarModal = false;
  mensaje: string | null = null;
  tipoMensaje: 'success' | 'error' | null = null;

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
      this.mensaje = 'Producto creado correctamente';
      this.tipoMensaje = 'success';
      this.obtenerProductos();
      this.mostrarModal = false;
      setTimeout(() => this.mensaje = null, 4000); // ocultar después de 4 segundos
    },
    error: err => {
      console.error(err);
      this.mensaje = 'Error al crear producto: ' + (err.error?.detalle || 'Error desconocido');
      this.tipoMensaje = 'error';
      setTimeout(() => this.mensaje = null, 5000);
    }
  });
}

}
