import { Component, OnInit } from '@angular/core';
import { CarritoService } from '../../../core/services/carrito.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmarCompraModalComponent } from '../../compra/confirmar-compra-modal/confirmar-compra-modal.component';

@Component({
  selector: 'app-carrito-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmarCompraModalComponent],
  templateUrl: './carrito-detalle.component.html',
  styleUrls: ['./carrito-detalle.component.css']
})
export class CarritoDetalleComponent implements OnInit {

  carrito: any = null;
  modalAbierto = false;
  mensajeError: string | null = null;

  constructor(private carritoService: CarritoService) {}

  ngOnInit(): void {
    this.carritoService.obtenerCarrito().subscribe({
      next: (data) => {
        this.mensajeError = null;
        this.carrito = data;
      },
      error: (err) => {
        this.mensajeError = 'Error al obtener el carrito. Intenta nuevamente más tarde.';
        console.error('Error al obtener el carrito', err);
        this.carrito = null;
      }
    });
  }

  // abrirModalCompra() {
  //   this.modalAbierto = true;
  // }

  // cerrarModalCompra() {
  //   this.modalAbierto = false;
  //   this.ngOnInit(); // Opcional: recargar el carrito tras la compra
  // }
}
