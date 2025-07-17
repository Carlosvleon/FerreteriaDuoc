# Ferretería Ferramas - Frontend

Este proyecto es el frontend de la aplicación e-commerce Ferretería Ferramas, desarrollado en Angular 17 y Bootstrap 5.

## Requisitos previos

- Node.js (v18 o superior recomendado)
- npm (v9 o superior recomendado)

## Instalación de dependencias

1. Clona el repositorio o descarga el código fuente.
2. Abre una terminal en la carpeta del proyecto (`FerreteriaDuoc`).
3. Ejecuta:

```bash
npm install
```

Esto instalará todas las dependencias listadas en `package.json`, incluyendo:

- @angular/animations@17.3.12
- @angular/common@17.3.12
- @angular/compiler@17.3.12
- @angular/core@17.3.12
- @angular/forms@17.3.12
- @angular/platform-browser@17.3.12
- @angular/platform-browser-dynamic@17.3.12
- @angular/router@17.3.12
- bootstrap@5.3.7
- jwt-decode@4.0.0
- rxjs@7.8.2
- tslib@2.8.1
- zone.js@0.14.10

## Variables de entorno

Crea o edita el archivo `src/environments/environment.ts` con la siguiente estructura:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000' // Cambia la URL según tu backend
};
```

Asegúrate de que la variable `apiUrl` apunte al backend correspondiente.

## Comandos útiles

### Iniciar el servidor de desarrollo

```bash
ng serve
```

La aplicación estará disponible en [http://localhost:4200](http://localhost:4200)

### Compilar para producción

```bash
ng build --configuration production
```
```

## Notas adicionales

- El proyecto utiliza Bootstrap 5 para estilos y componentes visuales.
- Para personalizar variables de entorno para producción, edita `src/environments/environment.prod.ts`.
- Si tienes problemas con dependencias, ejecuta `npm install` nuevamente.
