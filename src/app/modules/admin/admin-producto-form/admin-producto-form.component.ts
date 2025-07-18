import { Component, EventEmitter, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-producto-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-producto-form.component.html',
  styleUrls: ['./admin-producto-form.component.css'],
})
export class AdminProductoFormComponent {
  @Output() productoCreado = new EventEmitter<void>();

  productoForm: FormGroup;
  marcas: any[] = [];
  modelos: any[] = [];
  categorias: any[] = [];

  modalTipo: 'marca' | 'modelo' | 'categoria' | null = null;
  nuevoNombre: string = '';
  imagenFile: File | null = null;

  constructor(private fb: FormBuilder, private adminService: AdminService) {
    this.productoForm = this.fb.group({
      codigoProducto: ['', Validators.required],
      nombre: ['', Validators.required],
      idMarca: ['', Validators.required],
      idModelo: ['', Validators.required],
      idCategoria: ['', Validators.required],
      precioOnline: [null, [Validators.required, Validators.min(0)]],
    });

    this.cargarListas();
  }

  cargarListas(): void {
    this.adminService.listarMarcas().subscribe((data) => (this.marcas = data));
    this.adminService
      .listarModelos()
      .subscribe((data) => (this.modelos = data));
    this.adminService
      .listarCategorias()
      .subscribe((data) => (this.categorias = data));
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
      categoria: () => this.adminService.crearCategoria(this.nuevoNombre),
    };

    crear[this.modalTipo]().subscribe({
      next: (entidad: any) => {
        this.cargarListas();
        // Seleccionar automáticamente la nueva entidad en el dropdown
        setTimeout(() => {
          if (this.modalTipo === 'marca')
            this.productoForm.patchValue({ idMarca: entidad.id });
          if (this.modalTipo === 'modelo')
            this.productoForm.patchValue({ idModelo: entidad.id });
          if (this.modalTipo === 'categoria')
            this.productoForm.patchValue({ idCategoria: entidad.id });
        }, 300);
        this.cerrarModal();
      },
      error: (err) => {
        console.error(err);
        alert(`Error al crear ${this.modalTipo}`);
      },
    });
  }

  guardarProducto(): void {
    if (this.productoForm.invalid) return;

    this.adminService.crearProducto(this.productoForm.value).subscribe({
      next: (res) => {
        const idProducto = res.idProducto;

        if (this.imagenFile) {
          const formData = new FormData();
          formData.append('imagen', this.imagenFile!);

          this.adminService
            .subirImagenProducto(idProducto, formData)
            .subscribe({
              next: () => {
                alert('Producto creado con imagen');
                this.limpiarFormulario();
              },
              error: (err) => {
                console.error(err);
                alert('Producto creado, pero falló la subida de imagen');
                this.limpiarFormulario();
              },
            });
        } else {
          alert('Producto creado sin imagen');
          this.limpiarFormulario();
        }
      },
      error: (err) => {
        alert('Error al crear producto');
        console.error(err);
      },
    });
  }

  limpiarFormulario(): void {
    this.productoCreado.emit();
    this.productoForm.reset();
    this.imagenFile = null;
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.imagenFile = file;
    }
  }
}
