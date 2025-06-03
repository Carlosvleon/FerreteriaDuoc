import { Routes } from '@angular/router';
import { LoginComponent } from './modules/auth/login/login.component';
import { RegisterComponent } from './modules/auth/register/register.component';

export const routes: Routes = [
    // se declara temporalmente el path "" como login
    { path: '', component: LoginComponent },
    { path: 'register', component: RegisterComponent }
];

