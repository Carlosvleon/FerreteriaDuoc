import { Component, OnInit } from '@angular/core';
import { PerfilService } from '../../../core/services/perfil.service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Location } from '@angular/common';



@Component({
  selector: 'app-perfil-usuario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfil-usuario.component.html',
  styleUrls: ['./perfil-usuario.component.css']
})

export class PerfilUsuarioComponent implements OnInit {
  miPerfil: any = null;
  estaAutenticado: boolean = false;

  constructor(private perfilService: PerfilService,
              private http: HttpClient,
              private router: Router,
              private location: Location) {}

  ngOnInit(): void {
  const token = localStorage.getItem('token');

  if (!token) {
    this.estaAutenticado = false;
    console.warn('Token no encontrado. Usuario no autenticado.');
    return;
  }

  this.estaAutenticado = true;

  this.perfilService.miPerfil().subscribe({
    next: (res) => {
      this.miPerfil = res;
      console.log('Perfil cargado:', res);
    },
    error: (err) => {
      console.error('Error al cargar perfil:', err);
      this.estaAutenticado = false;
    }
  });
}
cerrarSesion(): void {
  this.http.post('http://localhost:5000/api/usuarios/cerrar_sesion', {}, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`
    }
  }).subscribe({
    next: () => {
      localStorage.removeItem('token');
      this.miPerfil = null;
      this.estaAutenticado = false;
      this.router.navigate(['/login']); // Ajusta la ruta si tu login tiene otro path
    },
    error: (err) => {
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
