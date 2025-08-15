import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  { 
    path: 'clientes', 
    loadComponent: () => import('./components/clientes/clientes.component').then(m => m.ClientesComponent)
  },
  { 
    path: 'obras', 
    loadComponent: () => import('./components/obras/obras.component').then(m => m.ObrasComponent)
  },
  { 
    path: 'presupuestos', 
    loadComponent: () => import('./components/presupuestos/presupuestos.component').then(m => m.PresupuestosComponent)
  },
  { 
    path: 'conceptos', 
    loadComponent: () => import('./components/conceptos/conceptos.component').then(m => m.ConceptosComponent)
  },
  { 
    path: 'areas', 
    loadComponent: () => import('./components/areas/areas.component').then(m => m.AreasComponent)
  },
  { path: '**', redirectTo: '/dashboard' }
];
