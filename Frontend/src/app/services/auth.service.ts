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

export type AppRole = 'Admin' | 'Técnico' | 'Estudiante' | 'Auditor';

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
    return storedRole && ['Admin', 'Técnico', 'Estudiante', 'Auditor'].includes(storedRole)
      ? storedRole
      : null;
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
    }

    this.msalService.logoutRedirect();
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
