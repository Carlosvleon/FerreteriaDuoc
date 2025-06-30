import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PerfilService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  miPerfil(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.get(`${this.apiUrl}/api/perfiles/mi-perfil`, { headers });
  }

  actualizarFoto(file: File): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/api/perfiles/foto`, formData, { headers });
  }

  actualizarPortada(file: File): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/api/perfiles/portada`, formData, { headers });
  }
}
