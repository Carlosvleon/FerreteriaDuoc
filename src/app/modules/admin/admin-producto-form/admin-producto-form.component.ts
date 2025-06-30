import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-producto-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-producto-form.component.html',
  styleUrls: ['./admin-producto-form.component.css']
})
export class AdminProductoFormComponent {
  @Output() productoCreado = new EventEmitter<void>();

  productoForm: FormGroup;
  marcas: any[] = [];
  modelos: any[] = [];
  categorias: any[] = [];

  modalTipo: 'marca' | 'modelo' | 'categoria' | null = null;
  nuevoNombre: string = '';

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService
  ) {
    this.productoForm = this.fb.group({
      codigoProducto: ['', Validators.required],
      nombre: ['', Validators.required],
      idMarca: ['', Validators.required],
      idModelo: ['', Validators.required],
      idCategoria: ['', Validators.required],
      precioOnline: [null, [Validators.required, Validators.min(0)]]
    });

    this.cargarListas();
  }

  cargarListas(): void {
    this.adminService.listarMarcas().subscribe(data => this.marcas = data);
    this.adminService.listarModelos().subscribe(data => this.modelos = data);
    this.adminService.listarCategorias().subscribe(data => this.categorias = data);
  }

  abrirModal(tipo: 'marca' | 'modelo' | 'categoria') {
    this.modalTipo = tipo;
    this.nuevoNombre = '';
  }

  cerrarModal() {
    this.modalTipo = null;
  }

  crearEntidad() {
    if (!this.nuevoNombre.trim() || !this.modalTipo) return;

    const crear = {
      marca: () => this.adminService.crearMarca(this.nuevoNombre),
      modelo: () => this.adminService.crearModelo(this.nuevoNombre),
      categoria: () => this.adminService.crearCategoria(this.nuevoNombre)
    };

    crear[this.modalTipo]().subscribe({
      next: () => {
        alert(`${this.modalTipo} creada correctamente`);
        this.cargarListas();
        this.cerrarModal();
      },
      error: (err) => {
        console.error(err);
        alert(`Error al crear ${this.modalTipo}`);
      }
    });
  }

  guardarProducto(): void {
    if (this.productoForm.invalid) return;

    this.adminService.crearProducto(this.productoForm.value).subscribe({
      next: () => {
        alert('Producto creado correctamente');
        this.productoCreado.emit();
        this.productoForm.reset();
      },
      error: err => {
        alert('Error al crear producto');
        console.error(err);
      }
    });
  }
}
