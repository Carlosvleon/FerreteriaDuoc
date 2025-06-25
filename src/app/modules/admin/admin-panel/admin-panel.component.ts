import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent implements OnInit {
  tab: 'compras' | 'transacciones' = 'compras';
  error: string | null = null;

  // Detalle de compra
  detalleCompraVisible = false;
  detalleCompra: any = null;


  // Compras
  compras: any[] = [];
  compraSeleccionada: any | null = null;
  filtrosCompra = {
  fechaInicio: '',
  fechaFin: '',
  rut: '',
  busqueda: '', // ← AGREGAR ESTA LÍNEA
  pagina: 1
};
  totalPaginasCompra = 1;

  // Transacciones
  transacciones: any[] = [];
  filtrosTransaccion = {
    fechaInicio: '',
    fechaFin: '',
    status: '',
    busqueda: '', // ← AGREGAR ESTA LÍNEA
    pagina: 1
  };

  totalPaginasTransaccion = 1;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.cargarCompras();
    this.cargarTransacciones();
  }

  cargarCompras() {
    this.adminService.obtenerCompras(this.filtrosCompra).subscribe({
      next: (res) => {
        console.log('typeof res:', typeof res);
        console.log('res keys:', Object.keys(res));
        console.log('res.resultados:', res.resultados);

        this.compras = Array.isArray(res) ? res : (res.resultados || res);
        console.log('Compras recibidas:', res);
        this.totalPaginasCompra = res.totalPaginas;
      },
      error: (err) => {
        this.error = err.error?.error || 'Error al cargar compras';
        console.error('Error al obtener compras:', err);

      }
    });
  }

  cargarTransacciones() {
    this.adminService.obtenerTransacciones(this.filtrosTransaccion).subscribe({
      next: (res) => {
        this.transacciones = res.resultados;
        this.totalPaginasTransaccion = res.totalPaginas;
      },
      error: (err) => {
        this.error = err.error?.error || 'Error al cargar transacciones';
        console.error('Error al obtener transacciones:', err);
      }
    });
  }

verDetalleCompra(compra: any) {
  this.adminService.obtenerDetalleCompra(compra.id_compra).subscribe({
    next: (res) => {
      this.detalleCompra = res;
      this.detalleCompraVisible = true;
    },
    error: () => {
      this.error = 'No se pudo cargar el detalle';
    }
  });
}

cerrarModal() {
  this.detalleCompraVisible = false;
  this.detalleCompra = null;
}

  cambiarPaginaCompras(delta: number) {
  this.filtrosCompra.pagina += delta;
  if (this.filtrosCompra.pagina < 1) this.filtrosCompra.pagina = 1;
  this.cargarCompras();
}

cambiarPaginaTransacciones(delta: number) {
  this.filtrosTransaccion.pagina += delta;
  if (this.filtrosTransaccion.pagina < 1) this.filtrosTransaccion.pagina = 1;
  this.cargarTransacciones();
}

verDetalleCompraPorId(idCompra: number) {
  this.adminService.obtenerDetalleCompra(idCompra).subscribe({
    next: (res) => {
      this.detalleCompra = res;
      this.detalleCompraVisible = true;
    },
    error: () => {
      this.error = 'No se pudo cargar el detalle de la compra desde la transacción.';
    }
  });
}


}

