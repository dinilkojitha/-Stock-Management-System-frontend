// import { Component } from '@angular/core';
// import { RouterLink, RouterLinkActive } from '@angular/router';
//
// @Component({
//   selector: 'app-sidebar',
//   standalone: true,
//   imports: [RouterLink, RouterLinkActive],
//   template: `
//     <aside
//       class="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-300 w-64 select-none"
//     >
//       <div class="flex items-center gap-3 px-6 h-16 border-b border-slate-800">
//         <div
//           class="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-white text-sm"
//         >
//           S
//         </div>
//         <span class="font-bold text-white tracking-wide text-sm">StockCore ERP</span>
//       </div>
//
//       <nav class="flex-1 px-3 py-4 space-y-1 text-xs font-medium overflow-y-auto">
//         <a
//           routerLink="/app/auth"
//           routerLinkActive="bg-indigo-600 text-white"
//           class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition"
//         >
//           <span>👤</span> User Registration
//         </a>
//
//         <a
//           routerLink="/app/inventory"
//           routerLinkActive="bg-indigo-600 text-white"
//           class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition"
//         >
//           <span>📦</span> Inventory
//         </a>
//         <aa
//           routerLink="/app/stock"
//           routerLinkActive="bg-indigo-600 text-white"
//           class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition"
//         >
//           <span>🔄</span> Stock Transfers
//         </aa>
//         <a
//           routerLink="/app/distribution"
//           routerLinkActive="bg-indigo-600 text-white"
//           class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition"
//         >
//           <span>📑</span> Distribution
//         </a>
//         <a
//           routerLink="/app/procurement"
//           routerLinkActive="bg-indigo-600 text-white"
//           class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition"
//         >
//           <span>🚚</span> Procurement
//         </a>
//         <a
//           routerLink="/app/organization"
//           routerLinkActive="bg-indigo-600 text-white"
//           class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition"
//         >
//           <span>🏢</span> Organization
//         </a>
//         <a
//           routerLink="/app/forecasting"
//           routerLinkActive="bg-indigo-600 text-white"
//           class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition"
//         >
//           <span>📈</span> AI Forecasting
//         </a>
//         <a
//           routerLink="/app/audit"
//           routerLinkActive="bg-indigo-600 text-white"
//           class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition"
//         >
//           <span>🔒</span> Audit Trails
//         </a>
//       </nav>
//     </aside>
//   `,
// })
// export class SidebarComponent {}
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Adjust path to match your AuthService location

interface NavItem {
  label: string;
  link: string;
  icon: string;
  feature: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside
      class="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-300 w-64 select-none"
    >
      <div class="flex items-center gap-3 px-6 h-16 border-b border-slate-800">
        <div
          class="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-white text-sm"
        >
          S
        </div>
        <span class="font-bold text-white tracking-wide text-sm">StockCore ERP</span>
      </div>

      <nav class="flex-1 px-3 py-4 space-y-1 text-xs font-medium overflow-y-auto">
        <a
          routerLink="/app/profile"
          routerLinkActive="bg-indigo-600 text-white"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition"
        >
          <span>👤</span> My Profile
        </a>
        @for (item of visibleNavItems; track item.link) {
          <a
            [routerLink]="item.link"
            routerLinkActive="bg-indigo-600 text-white"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition"
          >
            <span>{{ item.icon }}</span> {{ item.label }}
          </a>
        }
      </nav>
    </aside>
  `,
})
export class SidebarComponent {
  private authService = inject(AuthService);

  // Updated property name to `requiredRoles` across all items
  private allNavItems: NavItem[] = [
    { label: 'Dashboard', link: '/app/dashboard', icon: '📊', feature: 'dashboard' },
    { label: 'User Registration', link: '/app/auth', icon: '👤', feature: 'auth' },
    { label: 'Inventory', link: '/app/inventory', icon: '📦', feature: 'inventory' },
    { label: 'Batches & Expiry', link: '/app/batches', icon: '🧾', feature: 'stock' },
    { label: 'Stock Transfers', link: '/app/stock', icon: '🔄', feature: 'stock' },
    { label: 'Distribution', link: '/app/distribution', icon: '📑', feature: 'distribution' },
    { label: 'Procurement', link: '/app/procurement', icon: '🚚', feature: 'procurement' },
    { label: 'Organization', link: '/app/organization', icon: '🏢', feature: 'organization' },
    { label: 'AI Forecasting', link: '/app/forecasting', icon: '📈', feature: 'forecasting' },
    { label: 'Audit Trails', link: '/app/audit', icon: '🔒', feature: 'audit' },
    { label: 'Reports', link: '/app/reports', icon: '📄', feature: 'reports' },
  ];

  /**
   * Getter that filters items based on whether the current user has access
   */
  get visibleNavItems(): NavItem[] {
    return this.allNavItems.filter((item) => this.authService.hasAccess(item.feature));
  }
}
