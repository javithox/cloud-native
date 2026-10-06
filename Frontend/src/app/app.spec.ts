import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './services/auth.service';
import { getRoleDefinition, ROLE_DEFINITIONS } from './services/role-permissions';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { InteractionStatus } from '@azure/msal-browser';
import { of } from 'rxjs';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        {
          provide: AuthService,
          useValue: {
            isLoggedIn: () => false,
            getRole: () => null,
            logout: () => undefined,
            getRoleDefinition: () => getRoleDefinition(null),
            syncActiveAccount: () => undefined,
          },
        },
        {
          provide: MsalService,
          useValue: { handleRedirectObservable: () => of(null) },
        },
        {
          provide: MsalBroadcastService,
          useValue: { inProgress$: of(InteractionStatus.None) },
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should define role-specific permissions for every role', () => {
    expect(ROLE_DEFINITIONS.Admin.capabilities).toContain('Gestionar todas las reservas');
    expect(ROLE_DEFINITIONS.Técnico.capabilities).toContain('Preparar equipos y recursos');
    expect(ROLE_DEFINITIONS.Estudiante.capabilities).toContain('Solicitar reservas propias');
    expect(ROLE_DEFINITIONS.Auditor.capabilities).toContain('Ver auditoría y trazabilidad');
    expect(getRoleDefinition('Admin').label).toBe('Administrador');
  });

  it('should allow nested booking and catalog routes within the same role area', () => {
    expect(getRoleDefinition('Estudiante').routes).toContain('/bookings');
    expect(getRoleDefinition('Estudiante').routes).not.toContain('/bookings/new');

    const canAccessNestedBooking = (role: string, route: string) => {
      const segments = getRoleDefinition(role as any).routes;
      return segments.some((item) => route === item || route.startsWith(`${item}/`));
    };

    expect(canAccessNestedBooking('Estudiante', '/bookings/new')).toBe(true);
    expect(canAccessNestedBooking('Técnico', '/catalog/new')).toBe(true);
    expect(canAccessNestedBooking('Admin', '/catalog/12/edit')).toBe(true);
  });
});
