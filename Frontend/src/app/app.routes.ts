import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AuditPage } from './pages/audit/audit';
import { BookingsPage } from './pages/bookings/bookings';
import { CatalogPage } from './pages/catalog/catalog';
import { DashboardPage } from './pages/dashboard/dashboard';
import { LoginPage } from './pages/login/login';
import { ReportsPage } from './pages/reports/reports';

export const routes: Routes = [
  { path: 'login', component: LoginPage },
  {
    path: 'dashboard',
    component: DashboardPage,
    canActivate: [AuthGuard],
    data: { roles: ['Admin', 'Técnico', 'Estudiante', 'Auditor'] },
  },
  {
    path: 'bookings',
    component: BookingsPage,
    canActivate: [AuthGuard],
    data: { roles: ['Admin', 'Técnico', 'Estudiante'] },
  },
  {
    path: 'catalog',
    component: CatalogPage,
    canActivate: [AuthGuard],
    data: { roles: ['Admin', 'Técnico'] },
  },
  {
    path: 'reports',
    component: ReportsPage,
    canActivate: [AuthGuard],
    data: { roles: ['Admin'] },
  },
  {
    path: 'audit',
    component: AuditPage,
    canActivate: [AuthGuard],
    data: { roles: ['Admin', 'Auditor'] },
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' },
];
