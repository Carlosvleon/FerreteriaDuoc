import { Component, OnInit } from '@angular/core';
import { PerfilService } from '../../../core/services/perfil.service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { HistorialComprasComponent } from '../historial-compras/historial-compras.component';


@Component({
  selector: 'app-perfil-usuario',
  standalone: true,
  imports: [CommonModule, HistorialComprasComponent],
  templateUrl: './perfil-usuario.component.html',
  styleUrls: ['./perfil-usuario.component.css']
})

export class PerfilUsuarioComponent implements OnInit {
  miPerfil: any = null;
  estaAutenticado: boolean = false;
  tab: 'datos' | 'compras' = 'datos';
  mensajeError: string | null = null;
  constructor(private perfilService: PerfilService,
              private http: HttpClient,
              private router: Router,
              private location: Location) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (!token) {
      this.estaAutenticado = false;
      this.mensajeError = 'No se encontró el token de autenticación.';
      return;
    }

    this.estaAutenticado = true;
    this.mensajeError = null;

    this.perfilService.miPerfil().subscribe({
      next: (res) => {
        this.miPerfil = res;
        this.mensajeError = null;
        console.log('Perfil cargado:', res);
      },
      error: (err) => {
        this.mensajeError = 'Error al cargar el perfil. Intenta nuevamente más tarde.';
        console.error('Error al cargar perfil:', err);
        this.estaAutenticado = false;
      }
    });
}
cerrarSesion(): void {
    this.http.post(environment.apiUrl + '/usuarios/cerrar_sesion', {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`
      }
    }).subscribe({
      next: () => {
        localStorage.removeItem('token');
        this.miPerfil = null;
        this.estaAutenticado = false;
        this.mensajeError = null;
        this.router.navigate(['/login']); // Ajusta la ruta si tu login tiene otro path
      },
      error: (err) => {
        this.mensajeError = 'Error al cerrar sesión. Intenta nuevamente más tarde.';
        console.error('Error al cerrar sesión:', err);
        // También puedes limpiar el token aunque falle
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
      }
    });
}

volver(): void {
  this.location.back();
}

}
