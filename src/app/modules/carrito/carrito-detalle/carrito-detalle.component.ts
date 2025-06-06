import { Component, OnInit } from '@angular/core';
import { CarritoService } from '../../../core/services/carrito.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-carrito-detalle',
  standalone: true,
  templateUrl: './carrito-detalle.component.html',
  styleUrl: './carrito-detalle.component.css',
  imports: [CommonModule, FormsModule]
})
export class CarritoDetalleComponent implements OnInit {
  productos: any[] = [];

  constructor(private carritoService: CarritoService) {}

  ngOnInit() {
    this.carritoService.verCarrito().subscribe({
      next: (data) => this.productos = data,
      error: (err) => console.error(err)
    });
  }

  editarCantidad(producto: any, nuevaCantidad: number): void {
    if (nuevaCantidad < 1) return;
    const prod = this.productos.find(p => p === producto);
    if (prod) {
      prod.cantidad = nuevaCantidad;
    }
  }

  quitarProducto(producto: any): void {
    this.productos = this.productos.filter(p => p !== producto);
  }

  // Métodos futuros para comprar, editar, quitar, etc.
}
