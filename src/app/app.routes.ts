import { Routes } from '@angular/router';
import { ShellComponent } from './core/layout/shell.component';
import { Landing } from './features/landing/landing';
import { Auth } from './features/auth/auth';
import { Inventory } from './features/inventory/inventory';
import { Stock } from './features/stock/stock';
import { Distribution } from './features/distribution/distribution';
import { Procurement } from './features/procurement/procurement';
import { Organization } from './features/organization/organization';
import { Forecasting } from './features/forecasting/forecasting';
import { Audit } from './features/audit/audit';
import { Login } from './features/login/login';
import { roleGuard } from './core/services/role.guard';

export const routes: Routes = [
  { path: '', component: Landing },
  { path: 'login', component: Login },
  {
    path: 'app',
    component: ShellComponent,
    children: [
      { path: '', redirectTo: 'inventory', pathMatch: 'full' },
      {
        path: 'inventory',
        component: Inventory,
        canActivate: [roleGuard],
        data: { feature: 'inventory' },
      },
      {
        path: 'auth',
        component: Auth,
        canActivate: [roleGuard],
        data: { feature: 'auth' }, // E.g., Only ADMIN has this in the AuthService map
      },
      {
        path: 'stock',
        component: Stock,
        canActivate: [roleGuard],
        data: { feature: 'stock' },
      },
      {
        path: 'distribution',
        component: Distribution,
        canActivate: [roleGuard],
        data: { feature: 'distribution' },
      },
      {
        path: 'procurement',
        component: Procurement,
        canActivate: [roleGuard],
        data: { feature: 'procurement' },
      },
      {
        path: 'organization',
        component: Organization,
        canActivate: [roleGuard],
        data: { feature: 'organization' },
      },
      {
        path: 'forecasting',
        component: Forecasting,
        canActivate: [roleGuard],
        data: { feature: 'forecasting' },
      },
      {
        path: 'audit',
        component: Audit,
        canActivate: [roleGuard],
        data: { feature: 'audit' },
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
