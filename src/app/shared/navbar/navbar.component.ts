import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { RouterModule } from '@angular/router';

import { getTipoUsuarioFromToken } from '../../core/services/auth.util';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  tipoUsuario: number | null = null;

  constructor(public authService: AuthService) {}

  ngOnInit() {
    this.tipoUsuario = getTipoUsuarioFromToken();
  }

  onLogout() {
    this.authService.logout().subscribe({
      next: () => {
        window.location.reload();
      },
      error: (err) => {
        console.error('Error al cerrar sesión', err);
      }
    });
  }
}
