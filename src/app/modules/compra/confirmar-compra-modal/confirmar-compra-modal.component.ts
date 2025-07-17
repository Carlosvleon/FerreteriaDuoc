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
  error = false;

  constructor(private compraService: CompraService, private router: Router) {}

  cancelar() {
    this.cerrado.emit();
  }

  confirmar() {
    // Validar carrito antes de iniciar la compra
    if (!this.carrito?.productos?.length || this.totalCarrito <= 0) {
      this.mensaje = 'El carrito está vacío o el total es inválido';
      this.error = true;
      return;
    }

    this.comprando = true;
    this.mensaje = 'Iniciando proceso de pago...';
    this.error = false;

    this.compraService.iniciarPagoWebpay().subscribe({
      next: ({ token, url }) => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = url;
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'token_ws';
        input.value = token;
        form.appendChild(input);
        document.body.appendChild(form);
        form.submit();
      },
      error: (err) => {
        this.mensaje = err.message || 'Hubo un problema al procesar tu compra. Por favor, intenta nuevamente.';
        this.error = true;
        this.comprando = false;
        console.error('Error al iniciar Webpay:', err);
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
      return Number(value.replace(/[^\d.-]+/g, '')); // limpia comas, espacios, $
    }
    return 0;
  }
}
