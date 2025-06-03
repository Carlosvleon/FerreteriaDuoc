import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  errorMessage: string | null = null;

  constructor(private authService: AuthService) { }

  login(email: string, password: string) {
    this.authService.login({ email, password }).subscribe({
      // vamos a almacenar el token en el localStorage con nombre token
      next: (response) => {
        console.log('Login successful', response);
        localStorage.setItem('token', response.token);
      },
      error: (error) => {
        console.error('Login failed', error);
        this.errorMessage = 'Credenciales inválidas';
      }
    });
  }

  logout() {
    this.authService.logout().subscribe({
      next: (response) => {
        console.log('Logout successful', response);
      },
      error: (error) => {
        console.error('Logout failed', error);
      }
    });
  }

}
