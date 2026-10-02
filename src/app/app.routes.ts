import { Routes } from '@angular/router';
import { LandingComponent } from './features/landing/landing.component';
import { LoginComponent } from './features/auth/login.component';
import { ShellComponent } from './core/layout/shell.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'app',
    component: ShellComponent,
    children: [
      { path: '', redirectTo: 'inventory', pathMatch: 'full' },
      {
        path: 'inventory',
        loadComponent: () =>
          import('./features/inventory/inventory.component').then((m) => m.InventoryComponent),
      },
      {
        path: 'stock',
        loadComponent: () =>
          import('./features/stock/stock-transfers.component').then(
            (m) => m.StockTransfersComponent,
          ),
      },
      {
        path: 'distribution',
        loadComponent: () =>
          import('./features/distribution/distribution.component').then(
            (m) => m.DistributionComponent,
          ),
      },
      {
        path: 'procurement',
        loadComponent: () =>
          import('./features/procurement/procurement.component').then(
            (m) => m.ProcurementComponent,
          ),
      },
      {
        path: 'organization',
        loadComponent: () =>
          import('./features/organization/organization.component').then(
            (m) => m.OrganizationComponent,
          ),
      },
      {
        path: 'forecasting',
        loadComponent: () =>
          import('./features/forecasting/forecasting.component').then(
            (m) => m.ForecastingComponent,
          ),
      },
      {
        path: 'audit',
        loadComponent: () =>
          import('./features/audit/audit.component').then((m) => m.AuditComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
