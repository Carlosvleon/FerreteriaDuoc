import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  // Observables para reactividad global
  private loggedIn = new BehaviorSubject<boolean>(this.isLoggedIn());
  loggedIn$ = this.loggedIn.asObservable();

  private isAdmin = new BehaviorSubject<boolean>(this.checkIsAdmin());
  isAdmin$ = this.isAdmin.asObservable();

  constructor(private http: HttpClient) { }

  login(credentials: { email: string, password: string }): Observable<any> {
    return new Observable(observer => {
      this.http.post(`${this.apiUrl}/api/usuarios/login`, credentials).subscribe({
        next: (data: any) => {
          // Guarda token y tipo de usuario
          localStorage.setItem('token', data.token);
          localStorage.setItem('tipo_usuario', data.tipo_usuario_id || data.tipo_usuario); // Ajusta según respuesta
          // Notifica a los observadores
          this.loggedIn.next(true);
          this.isAdmin.next(this.checkIsAdmin());
          observer.next(data);
          observer.complete();
        },
        error: err => observer.error(err)
      });
    });
  }

  logout(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    // Limpia antes de hacer logout (por si hay error de red)
    localStorage.removeItem('token');
    localStorage.removeItem('tipo_usuario');
    this.loggedIn.next(false);
    this.isAdmin.next(false);
    return this.http.post(`${this.apiUrl}/api/usuarios/cerrar_sesion`, {}, { headers });
  }

  register(user: {
    nombre: string, email: string, password: string, telefono: string, direccion: string, portada: string,
    tipo_usuario_id: number, rut: string, genero_id: number
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/usuarios/register`, user);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  checkIsAdmin(): boolean {
    // Ajusta según cómo guardas tipo usuario: '3' o 'admin'
    const tipo = localStorage.getItem('tipo_usuario');
    return tipo === '3' || tipo === 'admin';
  }
}
