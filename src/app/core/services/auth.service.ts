import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  login(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/usuarios/login`, credentials);
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {});
  }

  register(user: { nombre: string, email: string, password: string, telefono: string, direccion: string, portada: string, tipo_usuario_id:number, rut:string, genero_id:number }): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/usuarios/register`, user);
  }
}
