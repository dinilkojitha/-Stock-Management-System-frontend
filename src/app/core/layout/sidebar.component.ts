import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

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
          routerLink="/app/inventory"
          routerLinkActive="bg-indigo-600 text-white"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition"
        >
          <span>📦</span> Inventory
        </a>
        <a
          routerLink="/app/stock"
          routerLinkActive="bg-indigo-600 text-white"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition"
        >
          <span>🔄</span> Stock Transfers
        </a>
        <a
          routerLink="/app/distribution"
          routerLinkActive="bg-indigo-600 text-white"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition"
        >
          <span>📑</span> Distribution
        </a>
        <a
          routerLink="/app/procurement"
          routerLinkActive="bg-indigo-600 text-white"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition"
        >
          <span>🚚</span> Procurement
        </a>
        <a
          routerLink="/app/organization"
          routerLinkActive="bg-indigo-600 text-white"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition"
        >
          <span>🏢</span> Organization
        </a>
        <a
          routerLink="/app/forecasting"
          routerLinkActive="bg-indigo-600 text-white"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition"
        >
          <span>📈</span> AI Forecasting
        </a>
        <a
          routerLink="/app/audit"
          routerLinkActive="bg-indigo-600 text-white"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition"
        >
          <span>🔒</span> Audit Trails
        </a>
      </nav>
    </aside>
  `,
})
export class SidebarComponent {}
