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

  verCarrito(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.get(`${this.apiUrl}/api/carrito/`, { headers });
  }

agregarProducto(id_bodega: number, codigo_producto: string, cantidad: number): Observable<any> {
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };
  const body = {
    id_bodega,
    productos: [
      { codigo_producto, cantidad }
    ]
  };
  return this.http.post(`${this.apiUrl}/api/carrito/agregar/`, body, { headers });
}



}
