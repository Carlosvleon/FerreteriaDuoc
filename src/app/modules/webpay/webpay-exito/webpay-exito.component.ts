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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private compraService: CompraService
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token_ws');

    if (!token) {
      this.mensaje = '❌ No se recibió token_ws desde Webpay.';
      this.exito = false;
      return;
    }

    this.compraService.confirmarPagoWebpay(token).subscribe({
      next: (res) => {
        this.mensaje = '✅ ¡Compra realizada con éxito!';
        this.exito = true;
        this.resultado = res;

        // Opcional: Redirige al perfil en 3 segundos
        setTimeout(() => this.router.navigate(['/perfil']), 3000);
      },
      error: (err) => {
        this.mensaje = '❌ Error al confirmar la compra.';
        this.exito = false;
        console.error(err);
      }
    });
  }

  redirigirAPerfil(): void {
    this.router.navigate(['/perfil']);
  }
}
