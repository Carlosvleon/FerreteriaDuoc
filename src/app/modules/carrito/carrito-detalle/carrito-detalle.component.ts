import { Component, OnInit } from '@angular/core';
import { CarritoService } from '../../../core/services/carrito.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-carrito-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './carrito-detalle.component.html',
  styleUrls: ['./carrito-detalle.component.css'] // <- corregido aquí
})
export class CarritoDetalleComponent implements OnInit {

  carrito: any = null; // <- define la propiedad
  constructor(private carritoService: CarritoService) {} // <- propiedad privada

  ngOnInit(): void {
    this.carritoService.obtenerCarrito().subscribe({
      next: (data) => {
        this.carrito = data;
      },
      error: (err) => {
        console.error('Error al obtener el carrito', err);
        this.carrito = null;
      }
    });
  }
}
