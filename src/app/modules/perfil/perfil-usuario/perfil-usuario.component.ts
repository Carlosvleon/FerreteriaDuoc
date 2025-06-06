import { Component, OnInit } from '@angular/core';
import { PerfilService } from '../../../core/services/perfil.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-perfil-usuario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfil-usuario.component.html',
  styleUrls: ['./perfil-usuario.component.css']
})

export class PerfilUsuarioComponent implements OnInit {
  miPerfil: any = null;

  constructor(private perfilService: PerfilService) {}

  ngOnInit(): void {
    this.perfilService.miPerfil().subscribe({
      next: (res) => {
        this.miPerfil = res;
        console.log('Perfil cargado:', res);
      },
      error: (err) => {
        console.error('Error al cargar perfil:', err);
      }
    });
  }
}
