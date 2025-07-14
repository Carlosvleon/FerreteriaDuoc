import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-producto-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-producto-edit.component.html',
  styleUrls: ['./admin-producto-edit.component.css'],
})
export class AdminProductoEditComponent implements OnInit {
  private _producto: any = null;

  @Input() set producto(value: any) {
    this._producto = value;
    if (value) {
      this.productoForm.patchValue({
        codigoProducto: value.codigoProducto ?? '',
        nombre: value.nombre ?? '',
        idMarca: value.idMarca ?? '',
        idModelo: value.idModelo ?? '',
        idCategoria: value.idCategoria ?? '',
        precioOnline: value.precioOnline ?? '',
        activo: value.activo === true,
      });
      this.stockPorBodegaEditable = Array.isArray(value.stock_por_bodega)
        ? value.stock_por_bodega.map((item: any) => ({
            idBodega: item.id_bodega,
            stock: item.stock,
          }))
        : [];
    }
  }
  get producto(): any {
    return this._producto;
  }

  @Output() productoActualizado = new EventEmitter<void>();
  @Output() cerrarModal = new EventEmitter<void>();

  productoForm: FormGroup;
  marcas: any[] = [];
  modelos: any[] = [];
  categorias: any[] = [];
  mensaje: string | null = null;
  timeoutRef: any;
  mensajeOculto = false;
  stockPorBodegaEditable: { idBodega: number; stock: number }[] = [];
  nuevaImagen: File | null = null;
  nuevaImagenPreview: string | null = null;
  imgUrl: string = environment.apiUrl;

  constructor(private fb: FormBuilder, private adminService: AdminService) {
    this.productoForm = this.fb.group({
      codigoProducto: ['', Validators.required],
      nombre: ['', Validators.required],
      idMarca: ['', Validators.required],
      idModelo: ['', Validators.required],
      idCategoria: ['', Validators.required],
      precioOnline: [null, [Validators.required, Validators.min(0)]],
      activo: [true],
    });
  }

  cerrar(): void {
    this.cerrarModal.emit();
  }
  ngOnInit(): void {
    this.cargarListas();

    if (this.producto) {
      this.productoForm.patchValue({
        codigoProducto: this.producto.codigoProducto,
        nombre: this.producto.nombre,
        idMarca: this.producto.idMarca,
        idModelo: this.producto.idModelo,
        idCategoria: this.producto.idCategoria,
        precioOnline: this.producto.precioOnline,
        activo: this.producto.activo === true,
      });

      // Ahora sí: stock editable directo
      this.stockPorBodegaEditable = Array.isArray(
        this.producto.stock_por_bodega
      )
        ? this.producto.stock_por_bodega.map((item: any) => ({
            idBodega: item.id_bodega,
            stock: item.stock,
          }))
        : [];
    }
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

  obtenerId(lista: any[], nombre: string): number | null {
    const item = lista.find((e) => e.nombre === nombre);
    return item?.id || null;
  }
  mostrarMensajeTemporal(texto: string) {
    this.mensaje = texto;

    // Limpia timeout anterior si existe
    if (this.timeoutRef) clearTimeout(this.timeoutRef);

    // Cierra automáticamente después de 2.5 segundos
    this.timeoutRef = setTimeout(() => {
      this.cerrarMensaje();
    }, 2500);
  }
  cerrarMensaje() {
    this.mensaje = null;
    if (this.timeoutRef) clearTimeout(this.timeoutRef);
  }

guardarCambios(): void {
  if (this.productoForm.invalid || !this.producto?.id_producto) return;

  const form = this.productoForm.value;
  const datos = {
    id_producto: this.producto.id_producto,
    codigo_producto: form.codigoProducto,
    nombre_producto: form.nombre,
    id_marca: form.idMarca,
    id_modelo: form.idModelo,
    id_categoria: form.idCategoria,
    precio_online: form.precioOnline,
    activo: form.activo,
    stock_por_bodega: this.stockPorBodegaEditable.map((s) => ({
      id_bodega: s.idBodega,
      stock: s.stock,
    })),
  };

  this.adminService.actualizarProducto(this.producto.id_producto, datos).subscribe({
    next: () => {
      if (this.nuevaImagen) {
        // Subir imagen después de actualizar datos
        const formData = new FormData();
        formData.append('imagen', this.nuevaImagen);
        this.adminService.subirImagenProducto(this.producto.id_producto, formData).subscribe({
          next: (resp: any) => {
            // Actualiza la ruta en el objeto producto (evita caché con timestamp)
            if (resp?.ruta) {
              this.producto.imagen = resp.ruta + '?t=' + Date.now();
            }
            this.mensaje = 'Producto e imagen actualizados correctamente';
            this.productoForm.markAsPristine();
            this.productoActualizado.emit();

            // Fade temporal del mensaje
            setTimeout(() => (this.mensajeOculto = true), 2500);
            setTimeout(() => {
              this.mensaje = null;
              this.mensajeOculto = false;
            }, 3000);
          },
          error: (err) => {
            this.mensaje = 'Producto actualizado, pero falló la imagen';
            this.productoActualizado.emit();
            setTimeout(() => (this.mensajeOculto = true), 2500);
            setTimeout(() => {
              this.mensaje = null;
              this.mensajeOculto = false;
            }, 3000);
          },
        });
      } else {
        // Solo datos, sin imagen
        this.mensaje = 'Producto actualizado correctamente';
        this.productoForm.markAsPristine();
        this.productoActualizado.emit();
        setTimeout(() => (this.mensajeOculto = true), 2500);
        setTimeout(() => {
          this.mensaje = null;
          this.mensajeOculto = false;
        }, 3000);
      }
    },
    error: (err) => {
      this.mensaje = 'Error al actualizar producto';
      setTimeout(() => (this.mensajeOculto = true), 2500);
      setTimeout(() => {
        this.mensaje = null;
        this.mensajeOculto = false;
      }, 3000);
    },
  });
}


  getSedeIds(sedes: any): string[] {
    return sedes ? Object.keys(sedes) : [];
  }
  getStockEditable(idBodega: number): number {
    return (
      this.stockPorBodegaEditable.find((b) => b.idBodega === idBodega)?.stock ||
      0
    );
  }

  actualizarStock(idBodega: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const nuevo = parseInt(input.value, 10);

    if (isNaN(nuevo) || nuevo < 0) return;

    const idx = this.stockPorBodegaEditable.findIndex(
      (b) => b.idBodega === idBodega
    );
    if (idx !== -1) {
      this.stockPorBodegaEditable[idx].stock = nuevo;
    }
  }
  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.nuevaImagen = file;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.nuevaImagenPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
}
