import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompraService } from '../../../core/services/compra.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-confirmar-compra-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmar-compra-modal.component.html',
  styleUrls: ['./confirmar-compra-modal.component.css']
})
export class ConfirmarCompraModalComponent {
  @Input() carrito: any;
  @Output() cerrado = new EventEmitter<void>();
  comprando = false;
  mensaje = '';

  constructor(private compraService: CompraService, private router: Router) {}

  cancelar() {
    this.cerrado.emit();
  }

  confirmar() {
    this.comprando = true;
    this.compraService.realizarCompra().subscribe({
      next: (res: any) => {
        this.mensaje = `¡Compra realizada! ID: ${res.id_compra}, Total: ${res.total}`;
        setTimeout(() => {
          this.cerrado.emit();
          this.router.navigate(['/perfil']);
        }, 2000);
      },
      error: (err: any) => {
        this.mensaje = err.error?.error || 'Error al realizar la compra';
        this.comprando = false;
        console.error('Error al realizar la compra:', err);
      }
    });
  }

  get totalCarrito(): number {
    if (!this.carrito?.productos) return 0;
    return this.carrito.productos.reduce((sum: number, p: any) => sum + (p.total || 0), 0);
  }

  public parseNumber(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      // Quita comas y espacios, y puntos de miles si existieran
      return Number(value.replace(/,/g, '').replace(/\s/g, ''));
    }
    return 0;
  }
}
