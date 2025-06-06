import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
    });
  }
  agregarProducto(idProducto: number, cantidad: number) {
    return this.http.post(`${this.apiUrl}/api/carrito/agregar`, {
      id_producto: idProducto,
      cantidad: cantidad
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
  }

}
