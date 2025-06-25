import { Routes } from '@angular/router';
import { LoginComponent } from './modules/auth/login/login.component';
import { RegisterComponent } from './modules/auth/register/register.component';
import { ListarProductosComponent } from './modules/product/listar-productos/listar-productos.component';
import { CarritoDetalleComponent } from './modules/carrito/carrito-detalle/carrito-detalle.component';
import { PerfilUsuarioComponent } from './modules/perfil/perfil-usuario/perfil-usuario.component';
import { WebpayExitoComponent } from './modules/webpay/webpay-exito/webpay-exito.component';
import { AdminGuard } from './core/guards/admin.guard';
import { AdminPanelComponent } from './modules/admin/admin-panel/admin-panel.component';

export const routes: Routes = [
    // se declara temporalmente el path "" como login
 { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'productos', component: ListarProductosComponent },
  { path: 'carrito', component: CarritoDetalleComponent },
  { path: 'perfil', component: PerfilUsuarioComponent },

    // Webpay 
  { path: 'webpay/exito', component: WebpayExitoComponent },
  { path: 'webpay/rechazo', component: WebpayExitoComponent }, // temporal
  { path: 'webpay-exito', redirectTo: 'webpay/exito', pathMatch: 'full' },
  { path: 'webpay-rechazo', redirectTo: 'webpay/rechazo', pathMatch: 'full' },

  // rutas admin
  { path: 'admin', component: AdminPanelComponent, canActivate: [AdminGuard] }
];

