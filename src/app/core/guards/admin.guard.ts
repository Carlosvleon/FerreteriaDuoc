import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

export const AdminGuard: CanActivateFn = () => {
  const token = localStorage.getItem('token');

  if (!token) return false;

  try {
    const decoded: any = jwtDecode(token);
    return decoded.tipo_usuario === 3;
  } catch (err) {
    return false;
  }
};
