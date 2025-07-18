import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

interface Producto {
  codigo_producto: string;
  cantidad: number;
  precio: number;
  total: number;
  nombre: string;
}

interface Carrito {
  id_carrito_compras: number;
  productos: Producto[];
  total_general: number;
}

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

  obtenerCarritoActual(): Observable<Carrito> {
    return this.http.get<Carrito>(`${this.apiUrl}/api/carrito`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
  }

  iniciarPagoWebpay(): Observable<any> {
    return this.obtenerCarritoActual().pipe(
      switchMap(carrito => {
        if (!this.validarCarritoDatos(carrito)) {
          return throwError(() => new Error('El carrito está vacío o el total es inválido'));
        }

        const datosCompra = {
          id_carrito_compras: carrito.id_carrito_compras,
          productos: carrito.productos,
          total: carrito.total_general
        };

        console.log('Iniciando pago con datos:', datosCompra);

        return this.http.post(
          `${this.apiUrl}/api/compras/webpay/iniciar`,
          datosCompra,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        ).pipe(
          catchError(err => {
            console.error('Error en la petición HTTP:', err);
            if (err.status === 404) {
              return throwError(() => new Error('El servicio de pago no está disponible en este momento.'));
            }
            return throwError(() => new Error(err.error?.mensaje || 'Error interno al procesar la compra.'));
          })
        );
      }),
      catchError(error => {
        console.error('Error al iniciar el pago:', error);
        return throwError(() => error);
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

  redirigirAPagoWebpay(): void {
    this.iniciarPagoWebpay().subscribe({
      next: (response: any) => {
        if (response?.url) {
          window.location.href = response.url;
        } else {
          console.error('URL de redirección no recibida');
        }
      },
      error: (err: any) => {
        console.error('Error al iniciar el pago:', err);
      }
    });
  }

private validarCarritoDatos(carrito: Carrito): boolean {
    if (!carrito) {
      console.error('No hay datos del carrito');
      return false;
    }

    if (!carrito.id_carrito_compras) {
      console.error('No hay ID de carrito');
      return false;
    }
    
    if (!Array.isArray(carrito.productos) || carrito.productos.length === 0) {
      console.error('No hay productos en el carrito');
      return false;
    }
    
    if (typeof carrito.total_general !== 'number' || carrito.total_general <= 0) {
      console.error('Total inválido:', carrito.total_general);
      return false;
    }

    const productosValidos = carrito.productos.every((producto: Producto) => 
      producto.codigo_producto && 
      producto.cantidad > 0 && 
      producto.precio > 0 && 
      producto.total > 0
    );

    if (!productosValidos) {
      console.error('Datos de productos inválidos');
      return false;
    }

    return true;
  }
}