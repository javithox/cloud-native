import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './services/auth.service';
import { getRoleDefinition, ROLE_DEFINITIONS } from './services/role-permissions';

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
          },
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
});
