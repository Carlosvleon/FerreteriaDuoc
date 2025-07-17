import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CompraService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  realizarCompra(): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/api/compras/realizar`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
  }

  obtenerHistorial(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/compras/mis-compras`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
  }

  iniciarPagoWebpay(): Observable<{ token: string; url: string }> {
    // Validar carrito antes de iniciar el pago
    if (!this.validarCarrito()) {
      return throwError(() => new Error('El carrito está vacío o el total es inválido'));
    }

    return this.http.post<{ token: string; url: string }>(
      `${this.apiUrl}/api/compras/webpay/iniciar`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    ).pipe(
      catchError(error => {
        console.error('Error al iniciar el pago:', error);
        return throwError(() => new Error('Error interno al procesar la compra.'));
      })
    );
  }

  confirmarPagoWebpay(tokenWs: string): Observable<any> {
    if (!tokenWs) {
      return throwError(() => new Error('Token de WebPay no proporcionado'));
    }

    return this.http.post(
      `${this.apiUrl}/api/compras/webpay/confirmar`,
      { token_ws: tokenWs },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    ).pipe(
      catchError(error => {
        console.error('Error al confirmar el pago:', error);
        const mensaje = error.error?.mensaje || 'La transacción no fue autorizada. Verifica los datos e inténtalo de nuevo.';
        return throwError(() => new Error(mensaje));
      })
    );
  }

  // Método auxiliar para validar el carrito antes de iniciar el pago
  private validarCarrito(): boolean {
    const carritoData = localStorage.getItem('carrito');
    if (!carritoData) return false;

    try {
      const carrito = JSON.parse(carritoData);
      return carrito.productos && carrito.productos.length > 0 && carrito.total_general > 0;
    } catch {
      return false;
    }
  }

  redirigirAPagoWebpay(): void {
    this.iniciarPagoWebpay().subscribe({
      next: ({ token, url }: { token: string; url: string }) => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = url;

        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'token_ws';
        input.value = token;
        form.appendChild(input);

        document.body.appendChild(form);
        form.submit(); // Redirige a Webpay automáticamente
      },
      error: (err: any) => {
        console.error('Error al iniciar el pago:', err);
      }
    });
  }
}
