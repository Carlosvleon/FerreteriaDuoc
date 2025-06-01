import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  constructor(private authService: AuthService) { }

  login(email: string, password: string) {
    this.authService.login({ email, password }).subscribe({
      next: (response) => {
        console.log('Login successful', response);
      },
      error: (error) => {
        console.error('Login failed', error);
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
