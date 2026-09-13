import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AppRole } from '../services/role-permissions';

export const AuthGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const allowedRoles = (route.data['roles'] as AppRole[] | undefined) ?? [];
  const routePath = route.routeConfig?.path ?? '';

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const currentRole = authService.getRole();

  if (allowedRoles.length > 0 && currentRole && !allowedRoles.includes(currentRole)) {
    router.navigate(['/dashboard']);
    return false;
  }

  if (routePath && currentRole && !authService.canAccessRoute(`/${routePath}`)) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
