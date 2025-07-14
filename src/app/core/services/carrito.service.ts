import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }

  obtenerCarrito(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/carrito/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }).pipe(
      tap((data: any) => console.log('Datos del carrito:', data))
    );
  }

  agregarProductosPorSucursal(idSucursal: number, productos: { id_producto: number, cantidad: number }[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/carrito/agregar/`, {
      id_sucursal: idSucursal,
      productos: productos
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
  }
}
