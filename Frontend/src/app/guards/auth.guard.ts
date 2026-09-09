import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppRole, AuthService } from '../services/auth.service';

export const AuthGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const allowedRoles = (route.data['roles'] as AppRole[] | undefined) ?? [];

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const currentRole = authService.getRole();

  if (allowedRoles.length > 0 && currentRole && !allowedRoles.includes(currentRole)) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
