import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CompraService } from '../../../core/services/compra.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-webpay-exito',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './webpay-exito.component.html',
  styleUrl: './webpay-exito.component.css'
})
export class WebpayExitoComponent implements OnInit {
  mensaje = 'Validando pago...';
  exito = false;
  resultado: any = null;
  mostrarDetalle = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private compraService: CompraService
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token_ws');

    if (!token) {
      this.mensaje = ' No se recibió token de transacción desde Webpay.';
      this.exito = false;
      return;
    }

    this.compraService.confirmarPagoWebpay(token).subscribe({
      next: (res) => {
        if (res.estado === 'FAILED' || !res.datos?.id_compra) {
          this.mensaje = ' ' + (res.mensaje || 'La transacción no fue autorizada. Verifica los datos e inténtalo de nuevo.');
          this.exito = false;
        } else {
          this.mensaje = ' ¡Compra realizada con éxito!';
          this.exito = true;
          this.resultado = res;
          
          // Limpiar el carrito después de una compra exitosa
          localStorage.removeItem('carrito');
          
          // Redirigir al perfil después de 5 segundos
          setTimeout(() => this.redirigirAPerfil(), 5000);
        }
      },
      error: (err) => {
        this.mensaje = ' ' + (err.message || 'Hubo un problema al procesar tu compra. Por favor, intenta nuevamente.');
        this.exito = false;
        console.error('Error al confirmar la compra:', err);
      }
    });
  }

  redirigirAPerfil(): void {
    this.router.navigate(['/perfil']);
  }

  toggleDetalle(): void {
    this.mostrarDetalle = !this.mostrarDetalle;
  }
}
