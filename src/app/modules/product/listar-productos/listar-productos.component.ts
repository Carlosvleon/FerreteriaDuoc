import { Component } from '@angular/core';
import { ProductoService } from '../../../core/services/producto.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-listar-productos',
  standalone: true,
  imports: [    CommonModule,
    FormsModule],
  templateUrl: './listar-productos.component.html',
  styleUrl: './listar-productos.component.css'
})
export class ListarProductosComponent {
  //aqui vamos a llamar al servicio que trae los productos con el metodo getProductos
  listaProductos: any[] = [];
  currentPage: number = 1;
  pageSize: number = 10; // or your default page size
  totalPages: number = 1;
  public searchTerm: string = '';

  constructor(private productoService: ProductoService) { }

  ngOnInit() {
    this.productoService.getProductos().subscribe({
      next: (productData) => {
        this.listaProductos = productData;
        this.totalPages = Math.ceil(this.listaProductos.length / this.pageSize);
      },
      error: (error) => {
        console.error('Error al obtener productos', error);
      }
    });
  }
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.filterProducts();
    }
  }
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.filterProducts();
    }
  }

  filterProducts(): void {
    // Implement your filtering logic here
    // For now, this is a placeholder to avoid errors
  }
}
