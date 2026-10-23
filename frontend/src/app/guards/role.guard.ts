import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { userRole } from '../models/user';

export const roleGuard = (allowedRole: userRole): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const user = authService.currentUser();

    if (user && user.role === allowedRole) {
      return true;
    }

    if (user) {
      return router.createUrlTree([authService.redirectPathFor(user.role)]);
    }

    return router.createUrlTree(['/login']);
  };
};
