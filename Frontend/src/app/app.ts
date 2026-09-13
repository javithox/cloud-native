import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AppRole } from './services/role-permissions';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  menuOpen = false;

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

  currentRoleLabel(): string {
    return this.authService.getRoleDefinition().label;
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  logout(): void {
    this.menuOpen = false;
    this.authService.logout();
  }
}
