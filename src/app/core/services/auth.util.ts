// Utilidad para decodificar el token y obtener el tipo de usuario
export function getTipoUsuarioFromToken(): number | null {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    // Decodificación básica JWT (sin validación de firma)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.tipo_usuario ?? null;
  } catch {
    return null;
  }
}
