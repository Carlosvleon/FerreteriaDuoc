import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

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

  iniciarPagoWebpay(): Observable<any> {
    // Validar carrito antes de iniciar el pago
    if (!this.validarCarrito()) {
      return throwError(() => new Error('El carrito está vacío o el total es inválido'));
    }

    const carritoData = localStorage.getItem('carrito');
    const carrito = JSON.parse(carritoData!);

    // Preparar datos para el backend
    const datosCompra = {
      id_carrito_compras: carrito.id_carrito_compras,
      productos: carrito.productos,
      total: carrito.total_general
    };

    return this.http.post(
      `${this.apiUrl}/webpay/realizar`,
      datosCompra,
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
      `${this.apiUrl}/webpay/confirmar`,
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

private validarCarrito(): boolean {
    const carritoData = localStorage.getItem('carrito');
    if (!carritoData) {
      console.error('No hay datos del carrito en localStorage');
      return false;
    }

    try {
      const carrito: Carrito = JSON.parse(carritoData);
      
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
    } catch (error) {
      console.error('Error al parsear datos del carrito:', error);
      return false;
    }
  }
}