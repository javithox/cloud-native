import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService, AppRole } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly navItems: Array<{ label: string; path: string; roles: AppRole[] }> = [
    { label: 'Dashboard', path: '/dashboard', roles: ['Admin', 'Técnico', 'Estudiante', 'Auditor'] },
    { label: 'Reservas', path: '/bookings', roles: ['Admin', 'Técnico', 'Estudiante'] },
    { label: 'Catálogo', path: '/catalog', roles: ['Admin', 'Técnico'] },
    { label: 'Reportes', path: '/reports', roles: ['Admin'] },
    { label: 'Auditoría', path: '/audit', roles: ['Admin', 'Auditor'] },
  ];

  constructor(public authService: AuthService) {}

  visibleNavItems(): Array<{ label: string; path: string; roles: AppRole[] }> {
    const currentRole = this.authService.getRole() ?? 'Estudiante';

    return this.navItems.filter((item) => item.roles.includes(currentRole));
  }

  logout(): void {
    this.authService.logout();
  }
}
