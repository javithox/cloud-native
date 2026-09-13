import { Injectable, OnDestroy } from '@angular/core';

import {
  MsalBroadcastService,
  MsalService
} from '@azure/msal-angular';

import {
  AccountInfo,
  EventMessage,
  EventType,
  InteractionStatus
} from '@azure/msal-browser';

import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import {
  AppRole,
  DEFAULT_ROLE,
  ROLE_DEFINITIONS,
  canAccessRoute,
  getRoleDefinition,
} from './role-permissions';

const ROLE_STORAGE_KEY = 'campuslab-role';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  private readonly destroying$ = new Subject<void>();

  constructor(
    private readonly msalService: MsalService,
    private readonly msalBroadcastService: MsalBroadcastService,
  ) {
    this.msalBroadcastService.msalSubject$
      .pipe(
        filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS),
        takeUntil(this.destroying$),
      )
      .subscribe(() => {
        this.setActiveAccount();
      });

    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this.destroying$),
      )
      .subscribe(() => {
        this.setActiveAccount();
      });
  }

  isLoggedIn(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    return this.msalService.instance.getAllAccounts().length > 0 || this.getRole() !== null;
  }

  getActiveAccount(): AccountInfo | null {
    return this.msalService.instance.getActiveAccount();
  }

  getRole(): AppRole | null {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return null;
    }

    const storedRole = localStorage.getItem(ROLE_STORAGE_KEY) as AppRole | null;
    if (storedRole && Object.keys(ROLE_DEFINITIONS).includes(storedRole)) {
      return storedRole;
    }

    const claimsRole = this.getRoleFromClaims();
    return claimsRole ?? null;
  }

  getRoleFromClaims(): AppRole | null {
    const activeAccount = this.msalService.instance.getActiveAccount();
    if (!activeAccount) {
      return null;
    }

    const idTokenClaims = activeAccount.idTokenClaims as Record<string, unknown> | undefined;
    if (!idTokenClaims) {
      return null;
    }

    const rawRole =
      (idTokenClaims['role'] as string | undefined) ??
      (idTokenClaims['roles'] as string[] | undefined)?.[0] ??
      (idTokenClaims['groups'] as string[] | undefined)?.[0] ??
      (idTokenClaims['appRole'] as string | undefined);

    if (!rawRole) {
      return null;
    }

    const normalized = String(rawRole).toLowerCase();
    const mapping: Record<string, AppRole> = {
      admin: 'Admin',
      administrador: 'Admin',
      tecnico: 'Técnico',
      technician: 'Técnico',
      estudiante: 'Estudiante',
      student: 'Estudiante',
      auditor: 'Auditor',
      audit: 'Auditor',
    };

    const result = mapping[normalized];
    if (result) {
      this.setRole(result);
      return result;
    }

    return null;
  }

  getRoleDefinition(role?: AppRole | null): ReturnType<typeof getRoleDefinition> {
    return getRoleDefinition(role ?? this.getRole() ?? DEFAULT_ROLE);
  }

  canAccessRoute(route: string): boolean {
    return canAccessRoute(this.getRole(), route);
  }

  setRole(role: AppRole): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(ROLE_STORAGE_KEY, role);
  }

  login(role?: AppRole): void {
    if (role) {
      this.setRole(role);
    }

    this.msalService.loginRedirect();
  }

  logout(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem(ROLE_STORAGE_KEY);
      localStorage.removeItem('msal.account.keys');
      localStorage.removeItem('msal.interactive.request');
    }

    this.msalService.instance.clearCache();
    this.msalService.instance.setActiveAccount(null);
    this.msalService.logoutRedirect({
      postLogoutRedirectUri: window.location.origin + '/login',
    });
  }

  private setActiveAccount(): void {
    const accounts = this.msalService.instance.getAllAccounts();

    if (accounts.length > 0 && !this.msalService.instance.getActiveAccount()) {
      this.msalService.instance.setActiveAccount(accounts[0]);
    }
  }

  ngOnDestroy(): void {
    this.destroying$.next();
    this.destroying$.complete();
  }
}
