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

export const routes: Routes = [
  { path: '', component: Landing },
  { path: 'login', component: Auth },
  {
    path: 'app',
    component: ShellComponent,
    children: [
      { path: '', redirectTo: 'inventory', pathMatch: 'full' },
      {
        path: 'inventory',
        component: Inventory,
      },
      {
        path: 'stock',
        component: Stock,
      },
      {
        path: 'distribution',
        component: Distribution,
      },
      {
        path: 'procurement',
        component: Procurement,
      },
      {
        path: 'organization',
        component: Organization,
      },
      {
        path: 'forecasting',
        component: Forecasting,
      },
      {
        path: 'audit',
        component: Audit,
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
