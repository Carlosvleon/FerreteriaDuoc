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

@Component({
  selector: 'app-admin-producto-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-producto-edit.component.html',
  styleUrls: ['./admin-producto-edit.component.css'],
})
export class AdminProductoEditComponent implements OnInit {
  @Input() producto: any = null;
  @Output() productoActualizado = new EventEmitter<void>();
  productoForm: FormGroup;
  marcas: any[] = [];
  modelos: any[] = [];
  categorias: any[] = [];
  mensaje: string | null = null;
  stockPorBodegaEditable: { idBodega: number; stock: number }[] = [];

  constructor(private fb: FormBuilder, private adminService: AdminService) {
    this.productoForm = this.fb.group({
      codigoProducto: ['', Validators.required],
      nombre: ['', Validators.required],
      idMarca: ['', Validators.required],
      idModelo: ['', Validators.required],
      idCategoria: ['', Validators.required],
      precioOnline: [null, [Validators.required, Validators.min(0)]],
    });
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
      });

      // preparar stock editable
      this.stockPorBodegaEditable = [];
      const sedes = this.producto.sedes || {};
      Object.values(sedes).forEach((sede: any) => {
        sede.bodegas.forEach((bodega: any) => {
          this.stockPorBodegaEditable.push({
            idBodega: bodega.idBodega,
            stock: bodega.stock,
          });
        });
      });
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

  guardarCambios(): void {
    if (this.productoForm.invalid || !this.producto?.idProducto) return;

    const datos = {
      ...this.productoForm.value,
      stockPorBodega: this.stockPorBodegaEditable
    };

    this.adminService.actualizarProducto(this.producto.idProducto, datos).subscribe({
      next: () => {
        this.mensaje = 'Producto actualizado correctamente';
        this.productoForm.markAsPristine(); // Marca como no modificado
        this.productoActualizado.emit();
      },
      error: err => {
        console.error(err);
        this.mensaje = 'Error al actualizar producto';
      }
    });
  }


  getSedeIds(sedes: any): string[] {
    return Object.keys(sedes);
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

    const idx = this.stockPorBodegaEditable.findIndex(b => b.idBodega === idBodega);
    if (idx !== -1) {
      this.stockPorBodegaEditable[idx].stock = nuevo;
    }
  }

}
