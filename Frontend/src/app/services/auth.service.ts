
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
  getRoleDefinition
} from './role-permissions';

const ROLE_STORAGE_KEY = 'campuslab-role';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {

  private readonly destroying$ = new Subject<void>();

  private interactionStatus: InteractionStatus =
    InteractionStatus.None;

  constructor(
    private readonly msalService: MsalService,
    private readonly msalBroadcastService: MsalBroadcastService
  ) {

    /*
     * Mantener actualizado el estado de interacción de MSAL.
     */
    this.msalBroadcastService.inProgress$
      .pipe(
        takeUntil(this.destroying$)
      )
      .subscribe((status: InteractionStatus) => {
        this.interactionStatus = status;

        /*
         * Cuando MSAL termina cualquier interacción,
         * aseguramos que exista una cuenta activa.
         */
        if (status === InteractionStatus.None) {
          this.setActiveAccount();
        }
      });

    /*
     * Login exitoso.
     */
    this.msalBroadcastService.msalSubject$
      .pipe(
        filter(
          (msg: EventMessage) =>
            msg.eventType === EventType.LOGIN_SUCCESS
        ),
        takeUntil(this.destroying$)
      )
      .subscribe(() => {
        this.setActiveAccount();
      });
  }

  /**
   * Indica si existe una sesión autenticada.
   */
  isLoggedIn(): boolean {

    if (typeof window === 'undefined') {
      return false;
    }

    const accounts =
      this.msalService.instance.getAllAccounts();

    return (
      accounts.length > 0 ||
      this.getRole() !== null
    );
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

    if (
      typeof window === 'undefined' ||
      typeof localStorage === 'undefined'
    ) {
      return null;
    }

    const storedRole =
      localStorage.getItem(
        ROLE_STORAGE_KEY
      ) as AppRole | null;

    if (
      storedRole &&
      Object.keys(ROLE_DEFINITIONS).includes(storedRole)
    ) {
      return storedRole;
    }

    /*
     * Si no existe rol almacenado,
     * intentar obtenerlo desde el token.
     */
    const claimsRole = this.getRoleFromClaims();

    return claimsRole ?? null;
  }

  /**
   * Obtiene el rol desde los claims del token.
   */
  getRoleFromClaims(): AppRole | null {

    const activeAccount =
      this.msalService.instance.getActiveAccount();

    if (!activeAccount) {
      return null;
    }

    const idTokenClaims =
      activeAccount.idTokenClaims as
        Record<string, unknown> | undefined;

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

    const normalized =
      String(rawRole).toLowerCase();

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

    return getRoleDefinition(
      role ??
      this.getRole() ??
      DEFAULT_ROLE
    );
  }

  /**
   * Comprueba permisos de una ruta.
   */
  canAccessRoute(route: string): boolean {

    return canAccessRoute(
      this.getRole(),
      route
    );
  }

  /**
   * Guarda el rol seleccionado.
   */
  setRole(role: AppRole): void {

    if (
      typeof window === 'undefined' ||
      typeof localStorage === 'undefined'
    ) {
      return;
    }

    localStorage.setItem(
      ROLE_STORAGE_KEY,
      role
    );
  }

  /**
   * Inicia sesión con Microsoft Entra ID.
   *
   * Evita iniciar una segunda interacción
   * mientras MSAL ya está procesando una.
   */
  login(role?: AppRole): void {

    if (role) {
      this.setRole(role);
    }

    /*
     * Evitar interaction_in_progress.
     */
    if (
      this.interactionStatus !==
      InteractionStatus.None
    ) {
      console.warn(
        'MSAL ya está procesando una interacción:',
        this.interactionStatus
      );

      return;
    }

    this.msalService.loginRedirect({
      scopes: [
        'User.Read',
        ...this.getProtectedResourceScopes()
      ]
    });
  }

  /**
   * Obtiene los scopes de nuestra API.
   */
  private getProtectedResourceScopes(): string[] {

    return [
      'api://e03479f6-d22d-4624-aa81-6e724d570329/archivos'
    ];
  }

  /**
   * Cierra la sesión.
   */
  logout(): void {

    if (
      typeof window !== 'undefined' &&
      typeof localStorage !== 'undefined'
    ) {
      localStorage.removeItem(
        ROLE_STORAGE_KEY
      );
    }

    this.msalService.instance.setActiveAccount(null);

    this.msalService.logoutRedirect({
      postLogoutRedirectUri:
        window.location.origin + '/login'
    });
  }

  /**
   * Establece automáticamente la primera cuenta
   * como cuenta activa si no existe una.
   */
  private setActiveAccount(): void {

    const accounts =
      this.msalService.instance.getAllAccounts();

    if (
      accounts.length > 0 &&
      !this.msalService.instance.getActiveAccount()
    ) {
      this.msalService.instance.setActiveAccount(
        accounts[0]
      );
    }
  }

  /**
   * Liberar suscripciones.
   */
  ngOnDestroy(): void {

    this.destroying$.next();
    this.destroying$.complete();
  }
}
