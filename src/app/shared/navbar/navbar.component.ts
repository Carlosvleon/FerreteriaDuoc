import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  constructor(public authService: AuthService) {}

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
