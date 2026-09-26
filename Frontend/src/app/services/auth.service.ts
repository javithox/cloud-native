
import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
  UrlTree,
} from '@angular/router';

import { AuthService } from '../services/auth.service';
import { AppRole } from '../services/role-permissions';

export const AuthGuard: CanActivateFn = (route): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles =
    (route.data['roles'] as AppRole[] | undefined) ?? [];

  const routePath =
    route.routeConfig?.path ?? '';

  /*
   * 1. Verificar autenticación
   */
  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  /*
   * 2. Obtener rol actual
   */
  const currentRole = authService.getRole();

  /*
   * 3. La ruta requiere roles específicos
   */
  if (
    allowedRoles.length > 0 &&
    (!currentRole || !allowedRoles.includes(currentRole))
  ) {
    return router.createUrlTree(['/dashboard']);
  }

  /*
   * 4. Verificar permisos adicionales de la aplicación
   */
  if (
    routePath &&
    currentRole &&
    !authService.canAccessRoute(`/${routePath}`)
  ) {
    return router.createUrlTree(['/dashboard']);
  }

  /*
   * 5. Acceso permitido
   */
  return true;
};
