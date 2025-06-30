import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getProductos(): Observable<any> {
    const token = localStorage.getItem('token');
    console.log('Token usado:', token);
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.get(`${this.apiUrl}/api/productos/`, { headers });
  }

  getProductosPorBodega(id_bodega: number, id_sucursal: number): Observable<any> {
    const token = localStorage.getItem('token');
    console.log('Token usado:', token);
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.post(`${this.apiUrl}/api/productos/bodega`, { id_bodega, id_sucursal }, { headers });
  }

  // getProductoById(id: number): Observable<any> {
  //   return this.http.get(`${this.apiUrl}/api/producto/${id}`);
  // }

  // createProducto(producto: any): Observable<any> {
  //   return this.http.post(`${this.apiUrl}/api/producto`, producto);
  // }

  // updateProducto(id: number, producto: any): Observable<any> {
  //   return this.http.put(`${this.apiUrl}/api/producto/${id}`, producto);
  // }

  // deleteProducto(id: number): Observable<any> {
  //   return this.http.delete(`${this.apiUrl}/api/producto/${id}`);
  // }
}
