import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = `${environment.apiUrl}/api/admin`;

  constructor(private http: HttpClient) {}

  obtenerCompras(
    filtros: any
  ): Observable<{ resultados: any[]; totalPaginas: number }> {
    let params = new HttpParams().set('pagina', filtros.pagina || 1);
    if (filtros.rut) params = params.set('rut', filtros.rut);
    if (filtros.fechaInicio)
      params = params.set('fechaInicio', filtros.fechaInicio);
    if (filtros.fechaFin) params = params.set('fechaFin', filtros.fechaFin);
    if (filtros.busqueda) params = params.set('busqueda', filtros.busqueda);

    return this.http.get<{ resultados: any[]; totalPaginas: number }>(
      `${this.apiUrl}/compras`,
      {
        headers: this.getAuthHeaders(),
        params,
      }
    );
  }

  obtenerTransacciones(
    filtros: any
  ): Observable<{ resultados: any[]; totalPaginas: number }> {
    let params = new HttpParams().set('pagina', filtros.pagina || 1);
    if (filtros.status) params = params.set('status', filtros.status);
    if (filtros.fechaInicio)
      params = params.set('fechaInicio', filtros.fechaInicio);
    if (filtros.fechaFin) params = params.set('fechaFin', filtros.fechaFin);

    return this.http.get<{ resultados: any[]; totalPaginas: number }>(
      `${this.apiUrl}/transacciones`,
      {
        headers: this.getAuthHeaders(),
        params,
      }
    );
  }

  obtenerDetalleCompra(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/compras/${id}/detalle`, {
      headers: this.getAuthHeaders(),
    });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }
  crearProducto(producto: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/productos`, producto, {
      headers: this.getAuthHeaders(),
    });
  }
  // ✅ Listar productos estructurados
  listarProductos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/productos`, {
      headers: this.getAuthHeaders(),
    });
  }

  crearMarca(nombre: string) {
    return this.http.post(`${this.apiUrl}/marcas`, { nombre }, {
      headers: this.getAuthHeaders(),
    });
  }

  crearModelo(nombre: string) {
    return this.http.post(`${this.apiUrl}/modelos`, { nombre }, {
      headers: this.getAuthHeaders(),
    });
  }

  crearCategoria(nombre: string) {
    return this.http.post(`${this.apiUrl}/categorias`, { nombre }, {
      headers: this.getAuthHeaders(),
    });
  }

  listarMarcas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/marcas`);
  }

  listarModelos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/modelos`);
  }

  listarCategorias(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categorias`);
  }

  actualizarProducto(id: number, producto: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/productos/${id}`, producto, {
      headers: this.getAuthHeaders(),
    });
  }
  subirImagenProducto(idProducto: number, formData: FormData): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post(
      `${this.apiUrl}/productos/${idProducto}/imagen`,
      formData,
      { headers }
    );
  }

fixProductoSinStock(idProducto: number): Observable<any> {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`,
  });

  return this.http.post(`${this.apiUrl}/productos/${idProducto}/fix`, {}, { headers });
}


}
