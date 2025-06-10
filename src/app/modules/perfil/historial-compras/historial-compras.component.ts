import { Component } from '@angular/core';
import { CompraService } from '../../../core/services/compra.service';

import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-historial-compras',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './historial-compras.component.html',
  styleUrl: './historial-compras.component.css'
})
export class HistorialComprasComponent {
  compras: any[] = [];
  cargando = true;

  constructor(private compraService: CompraService) {}

  ngOnInit() {
    this.cargando = true;
    this.compraService.obtenerHistorial().subscribe({
      next: (data) => {
        this.compras = data;
        this.cargando = false;
      },
      error: () => {
        this.compras = [];
        this.cargando = false;
      }
    });
  }
}
