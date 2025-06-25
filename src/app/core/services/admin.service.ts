import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = `${environment.apiUrl}/api/admin`;

  constructor(private http: HttpClient) {}
obtenerCompras(filtros: any): Observable<{ resultados: any[]; totalPaginas: number }> {
  let params = new HttpParams().set('pagina', filtros.pagina || 1);
  if (filtros.rut) params = params.set('rut', filtros.rut);
  if (filtros.fechaInicio) params = params.set('fechaInicio', filtros.fechaInicio);
  if (filtros.fechaFin) params = params.set('fechaFin', filtros.fechaFin);
  if (filtros.busqueda) params = params.set('busqueda', filtros.busqueda);

  return this.http.get<{ resultados: any[]; totalPaginas: number }>(`${this.apiUrl}/compras`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    params
  });
;
  }

  obtenerTransacciones(filtros: any): Observable<{ resultados: any[]; totalPaginas: number }> {
    let params = new HttpParams()
      .set('pagina', filtros.pagina || 1);
    if (filtros.status) params = params.set('status', filtros.status);
    if (filtros.fechaInicio) params = params.set('fechaInicio', filtros.fechaInicio);
    if (filtros.fechaFin) params = params.set('fechaFin', filtros.fechaFin);

    return this.http.get<{ resultados: any[]; totalPaginas: number }>(
      `${this.apiUrl}/transacciones`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        params
      }
    );
  }

  obtenerDetalleCompra(id: number): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/compras/${id}/detalle`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
}

}
