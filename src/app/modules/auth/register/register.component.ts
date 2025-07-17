import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { NgIf, NgClass } from '@angular/common';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, NgIf, CommonModule, NgClass],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  formData: any = {
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefono: '',
    direccion: '',
    portada: '',
    tipo_usuario_id: '',
    rut: '',
    genero_id: ''
  };

  fieldErrors: { [key: string]: string } = {};
  errorMessage: string | null = null;
  successMessage: string | null = null; // 👈 mensaje de éxito

  constructor(private authService: AuthService) {}

  register() {
    this.fieldErrors = {};
    this.errorMessage = null;
    this.successMessage = null; // limpia mensaje de éxito anterior

    // Validación frontend (como antes)
    if (!this.formData.nombre) this.fieldErrors['nombre'] = 'El nombre es obligatorio.';
    if (!this.formData.email) this.fieldErrors['email'] = 'El correo es obligatorio.';
    else if (!/^[^@]+@[^@]+\.[a-zA-Z]{2,}$/.test(this.formData.email))
      this.fieldErrors['email'] = 'El correo no tiene formato válido.';
    if (!this.formData.password) this.fieldErrors['password'] = 'La contraseña es obligatoria.';
    else if (this.formData.password.length < 6)
      this.fieldErrors['password'] = 'La contraseña debe tener al menos 6 caracteres.';
    if (!this.formData.confirmPassword) this.fieldErrors['confirmPassword'] = 'Debes confirmar la contraseña.';
    else if (this.formData.confirmPassword !== this.formData.password)
      this.fieldErrors['confirmPassword'] = 'Las contraseñas no coinciden.';
    if (!this.formData.telefono) this.fieldErrors['telefono'] = 'El teléfono es obligatorio.';
    if (!this.formData.direccion) this.fieldErrors['direccion'] = 'La dirección es obligatoria.';
    if (!this.formData.portada) this.fieldErrors['portada'] = 'La portada es obligatoria.';
    if (!this.formData.tipo_usuario_id) this.fieldErrors['tipo_usuario_id'] = 'Debes seleccionar el tipo de usuario.';
    if (!this.formData.rut) this.fieldErrors['rut'] = 'El RUT es obligatorio.';
    if (!this.formData.genero_id) this.fieldErrors['genero_id'] = 'Debes seleccionar el género.';

    if (Object.keys(this.fieldErrors).length > 0) return;

    const payload = { ...this.formData };
    delete payload.confirmPassword;

    this.authService.register(payload).subscribe({
      next: (response) => {
        this.errorMessage = null;
        this.successMessage = '¡Registro exitoso! Ahora puedes iniciar sesión.'; // 👈
        // Opcional: limpia el formulario
        this.formData = {
          nombre: '', email: '', password: '', confirmPassword: '', telefono: '',
          direccion: '', portada: '', tipo_usuario_id: '', rut: '', genero_id: ''
        };
      },
      error: (error) => {
        if (error?.error?.error?.toLowerCase().includes('rut')) {
          this.fieldErrors['rut'] = error.error.error;
        } else if (error?.error?.error?.toLowerCase().includes('correo')) {
          this.fieldErrors['email'] = error.error.error;
        } else {
          this.errorMessage = error?.error?.error || 'Error al registrar el usuario.';
        }
      }
    });
  }
}
