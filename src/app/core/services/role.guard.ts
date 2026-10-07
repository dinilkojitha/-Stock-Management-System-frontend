import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If the user isn't logged in at all, kick them to login
  if (!authService.isLoggedIn()) {
    return router.parseUrl('/login');
  }

  // Get the required feature from the route's data object
  const requiredFeature = route.data?.['feature'];

  // If a feature is specified and the user doesn't have access to it
  if (requiredFeature && !authService.hasAccess(requiredFeature)) {
    console.warn(
      `Access denied. Role ${authService.getCurrentRole()} lacks permission for ${requiredFeature}`,
    );
    // Redirect to a safe fallback route, like the main dashboard or inventory
    return router.parseUrl('/app/inventory');
  }

  return true; // Access granted
};
