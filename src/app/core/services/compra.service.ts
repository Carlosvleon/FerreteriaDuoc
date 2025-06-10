import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CompraService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  realizarCompra(): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/api/compra/realizar`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
  }

    obtenerHistorial(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/compra/mis-compras`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
  }
}

