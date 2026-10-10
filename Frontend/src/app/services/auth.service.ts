import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import {
  MsalBroadcastService,
  MsalService
} from '@azure/msal-angular';
import {
  AccountInfo,
  EventMessage,
  EventType,
  InteractionStatus,
  AuthenticationResult
} from '@azure/msal-browser';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  AppRole,
  DEFAULT_ROLE,
  ROLE_DEFINITIONS,
  canAccessRoute,
  getRoleDefinition
} from './role-permissions';

const ROLE_STORAGE_KEY = 'campuslab-role';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {

  private readonly destroying$ = new Subject<void>();

  private interactionStatus: InteractionStatus = InteractionStatus.None;
  private pendingLogin = false;

  constructor(
    private readonly msalService: MsalService,
    private readonly msalBroadcastService: MsalBroadcastService,
    private readonly router: Router
  ) {
    // 1. Establecer inmediatamente la cuenta activa desde localStorage si existe
    this.setActiveAccount();

    // 2. Escuchar el cambio de estado de interacción sin disparar un login nuevo cada vez.
    this.msalBroadcastService.inProgress$
      .pipe(takeUntil(this.destroying$))
      .subscribe((status: InteractionStatus) => {
        this.interactionStatus = status;

        if (status === InteractionStatus.None) {
          this.setActiveAccount();
        }
      });

    // 3. Escuchar eventos clave de MSAL para actualizar la cuenta activa
    this.msalBroadcastService.msalSubject$
      .pipe(
        filter((msg: EventMessage) =>
          msg.eventType === EventType.LOGIN_SUCCESS ||
          msg.eventType === EventType.HANDLE_REDIRECT_END ||
          msg.eventType === EventType.ACQUIRE_TOKEN_SUCCESS
        ),
        takeUntil(this.destroying$)
      )
      .subscribe((msg: EventMessage) => {
        const payload = msg.payload as AuthenticationResult;

        if (payload?.account) {
          this.msalService.instance.setActiveAccount(payload.account);
        } else {
          this.setActiveAccount();
        }

        if (msg.eventType === EventType.LOGIN_SUCCESS) {
          this.pendingLogin = false;

          const currentUrl = this.router.url;
          const landingRoute = this.getLandingRoute(this.getRole());

          if (currentUrl === '/login' || currentUrl === '/') {
            this.router.navigate([landingRoute]);
          }
        }

      });
  }

  /**
   * Indica si existe una sesión autenticada activa.
   */
  isLoggedIn(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    const activeAccount = this.getActiveAccount();
    const accounts = this.msalService.instance.getAllAccounts();

    return activeAccount !== null || accounts.length > 0;
  }

  /**
   * Devuelve la cuenta activa de MSAL.
   */
  getActiveAccount(): AccountInfo | null {
    return this.msalService.instance.getActiveAccount();
  }

  /**
   * Obtiene el rol almacenado.
   */
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

  /**
   * Obtiene el ID del usuario desde la cuenta activa.
   */
  getUserId(): string | null {
    const activeAccount = this.getActiveAccount();
    if (!activeAccount) {
      return null;
    }

    // Intentar obtener del claim 'oid' (Object ID) o 'sub' (Subject)
    const idTokenClaims = activeAccount.idTokenClaims as Record<string, unknown> | undefined;
    if (idTokenClaims) {
      return (idTokenClaims['oid'] as string) ?? 
             (idTokenClaims['sub'] as string) ?? 
             (idTokenClaims['email'] as string) ??
             activeAccount.localAccountId;
    }

    // Fallback a localAccountId o username
    return activeAccount.localAccountId || activeAccount.username || null;
  }

  /**
   * Obtiene el rol desde los claims del token.
   */
  getRoleFromClaims(): AppRole | null {
    const activeAccount = this.getActiveAccount();

    if (!activeAccount) {
      return null;
    }

    const idTokenClaims = activeAccount.idTokenClaims as
      | Record<string, unknown>
      | undefined;

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

    const normalized = String(rawRole)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    const mapping: Record<string, AppRole> = {
      admin: 'Admin',
      administrador: 'Admin',
      tecnico: 'Técnico',
      technician: 'Técnico',
      estudiante: 'Estudiante',
      student: 'Estudiante',
      auditor: 'Auditor',
      audit: 'Auditor'
    };

    const result = mapping[normalized];

    if (result) {
      this.setRole(result);
      return result;
    }

    return null;
  }

  /**
   * Obtiene la definición del rol.
   */
  getRoleDefinition(
    role?: AppRole | null
  ): ReturnType<typeof getRoleDefinition> {
    return getRoleDefinition(role ?? this.getRole() ?? DEFAULT_ROLE);
  }

  getLandingRoute(role?: AppRole | null): string {
    const selectedRole = role ?? this.getRole() ?? DEFAULT_ROLE;

    switch (selectedRole) {
      case 'Auditor':
        return '/audit';
      case 'Admin':
      case 'Técnico':
      case 'Estudiante':
      default:
        return '/dashboard';
    }
  }

  /**
   * Comprueba permisos de una ruta.
   */
  canAccessRoute(route: string): boolean {
    return canAccessRoute(this.getRole(), route);
  }

  /**
   * Guarda el rol seleccionado.
   */
  setRole(role: AppRole): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(ROLE_STORAGE_KEY, role);
  }

  /**
   * Inicia sesión con Microsoft Entra ID.
   */
  login(role?: AppRole): void {
    if (role) {
      this.setRole(role);
    }

    if (this.pendingLogin) {
      return;
    }

    if (
      this.interactionStatus === InteractionStatus.Logout ||
      this.interactionStatus === InteractionStatus.AcquireToken ||
      this.interactionStatus === InteractionStatus.HandleRedirect
    ) {
      return;
    }

    this.pendingLogin = true;
    this.executeLoginRedirect();
  }

  private executeLoginRedirect(): void {
    this.pendingLogin = true;
    this.msalService.loginRedirect({
      scopes: [
        'User.Read',
        ...this.getProtectedResourceScopes()
      ]
    });
  }

  private getProtectedResourceScopes(): string[] {
    return [...environment.azure.protectedResourceScopes];
  }

  /**
   * Cierra la sesión.
   */
  logout(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem(ROLE_STORAGE_KEY);
    }

    this.msalService.instance.setActiveAccount(null);

    this.msalService.logoutRedirect({
      postLogoutRedirectUri: window.location.origin + '/login'
    });
  }

  /**
   * Establece automáticamente la primera cuenta como cuenta activa si no existe una.
   */
  syncActiveAccount(): void {
    this.setActiveAccount();
  }

  private setActiveAccount(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const activeAccount = this.msalService.instance.getActiveAccount();

    if (!activeAccount) {
      const accounts = this.msalService.instance.getAllAccounts();
      if (accounts.length > 0) {
        this.msalService.instance.setActiveAccount(accounts[0]);
      }
    }
  }

  ngOnDestroy(): void {
    this.destroying$.next();
    this.destroying$.complete();
  }
}
