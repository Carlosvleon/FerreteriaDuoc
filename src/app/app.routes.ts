import { Routes } from '@angular/router';
import { LoginComponent } from './modules/auth/login/login.component';
import { RegisterComponent } from './modules/auth/register/register.component';
import { ListarProductosComponent } from './modules/product/listar-productos/listar-productos.component';
import { CarritoDetalleComponent } from './modules/carrito/carrito-detalle/carrito-detalle.component';

export const routes: Routes = [
    // se declara temporalmente el path "" como login
    { path: '', component: LoginComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'productos', component: ListarProductosComponent },
    { path: 'carrito', component: CarritoDetalleComponent }
];

