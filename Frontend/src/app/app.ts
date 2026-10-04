import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { InteractionStatus } from '@azure/msal-browser';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { AppRole } from './services/role-permissions';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit, OnDestroy {
  menuOpen = false;
  private readonly destroy$ = new Subject<void>();

  readonly navItems: Array<{ label: string; path: string; roles: AppRole[] }> = [
    { label: 'Dashboard', path: '/dashboard', roles: ['Admin', 'Técnico', 'Estudiante', 'Auditor'] },
    { label: 'Reservas', path: '/bookings', roles: ['Admin', 'Técnico', 'Estudiante'] },
    { label: 'Catálogo', path: '/catalog', roles: ['Admin', 'Técnico'] },
    { label: 'Reportes', path: '/reports', roles: ['Admin'] },
    { label: 'Auditoría', path: '/audit', roles: ['Admin', 'Auditor'] },
  ];

  constructor(
    public authService: AuthService,
    private readonly msalService: MsalService,
    private readonly msalBroadcastService: MsalBroadcastService
  ) {}

  ngOnInit(): void {
    this.msalService.handleRedirectObservable().subscribe({
      next: () => undefined,
      error: (err) => console.error('MSAL redirect error:', err),
    });

    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.authService.syncActiveAccount();
      });
  }

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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
