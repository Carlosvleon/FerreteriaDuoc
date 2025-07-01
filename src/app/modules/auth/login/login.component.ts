import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  errorMessage: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  login(email: string, password: string) {
    this.authService.login({ email, password }).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        console.log('Login successful', response);

        // Decodificar token
        const decoded: any = jwtDecode(response.token);
        const tipoUsuario = decoded.tipo_usuario;

        // Redirección condicional
        if (tipoUsuario === 3) {
          const irAdmin = confirm('Eres administrador. ¿Deseas ir al panel de administración?');
          this.router.navigate([irAdmin ? '/admin' : '/perfil']);
        } else {
          this.router.navigate(['/perfil']);
        }
      },
      error: (error) => {
        console.error('Login failed', error);
        this.errorMessage = 'Credenciales inválidas';
      }
    });
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => console.log('Logout successful'),
      error: (error) => console.error('Logout failed', error)
    });
  }
}
