import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  errorMessage: string | null = null;
  constructor(private authService: AuthService) { }

register(
  nombre: string,
  email: string,
  password: string,
  confirmPassword: string,
  telefono: string,
  direccion: string,
  portada: string,
  tipo_usuario_id: string,
  rut: string,
  genero_id: string
) {
  // Convierte los campos numéricos a número
  const user = {
    nombre,
    email,
    password,
    telefono,
    direccion,
    portada,
    tipo_usuario_id: Number(tipo_usuario_id),
    rut,
    genero_id: Number(genero_id)
  };    
  this.authService.register({ 
    nombre, 
    email, 
    password, 
    telefono, 
    direccion, 
    portada, 
    tipo_usuario_id: Number(tipo_usuario_id), 
    rut, 
    genero_id: Number(genero_id) 
  }).subscribe({
      next: (response) => {
        console.log('Registration successful', response);
      },
      error: (error) => {
        console.error('Registration failed', error);
        this.errorMessage = 'Error al registrar el usuario';
      }
    });
  }
}
