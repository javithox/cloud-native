import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CampusLabApiService } from '../../services/campuslab-api.service';
import { getRoleDefinition, AppRole, ROLE_DEFINITIONS } from '../../services/role-permissions';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface DashboardMetric {
  label: string;
  value: string | number;
  icon?: string;
  unit?: string;
}

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardPage implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly api = inject(CampusLabApiService);
  private readonly destroy$ = new Subject<void>();

  // Roles disponibles (solo para Admin)
  availableRoles: Array<{ value: AppRole; label: string }> = [
    { value: 'Admin', label: 'Administrador' },
    { value: 'Técnico', label: 'Técnico' },
    { value: 'Estudiante', label: 'Estudiante' },
    { value: 'Auditor', label: 'Auditor' },
  ];

  selectedRole: AppRole = (this.authService.getRole() as AppRole) || 'Estudiante';
  isAdmin = false;

  get currentRole(): string {
    return this.selectedRole;
  }

  get roleDefinition() {
    return getRoleDefinition(this.selectedRole);
  }

  metrics: DashboardMetric[] = [];
  isLoadingMetrics = false;
  metricsError: string | null = null;

  ngOnInit(): void {
    // Establecer rol actual y verificar si es Admin
    this.selectedRole = (this.authService.getRole() as AppRole) || 'Estudiante';
    this.isAdmin = this.selectedRole === 'Admin';
    
    // Si no es Admin, no permitir cambio de rol
    if (!this.isAdmin) {
      this.selectedRole = this.authService.getRole() as AppRole;
    }

    this.loadDashboardMetrics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onRoleChange(): void {
    // Solo Admin puede cambiar de rol
    if (this.isAdmin) {
      this.loadDashboardMetrics();
    }
  }

  private loadDashboardMetrics(): void {
    this.isLoadingMetrics = true;
    this.metricsError = null;
    this.metrics = [];

    switch (this.selectedRole) {
      case 'Admin':
        this.api
          .getAdminMetrics()
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (data) => {
              this.metrics = [
                {
                  label: 'Ocupación de laboratorios',
                  value: `${data.labOccupancy}%`,
                  icon: '📊',
                  unit: '%',
                },
                {
                  label: 'Reservas hoy',
                  value: data.bookingsToday,
                  icon: '📅',
                },
                {
                  label: 'Recursos críticos',
                  value: data.criticalResources,
                  icon: '⚠️',
                },
              ];
              this.isLoadingMetrics = false;
            },
            error: (err) => {
              this.metricsError = 'Error al cargar métricas de administrador';
              this.loadFallbackMetrics();
            },
          });
        break;

      case 'Técnico':
        this.api
          .getTechnicianMetrics()
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (data) => {
              this.metrics = [
                {
                  label: 'Reservas por preparar',
                  value: data.bookingsToPrepare,
                  icon: '🔧',
                },
                {
                  label: 'Equipos pendientes',
                  value: data.pendingEquipment,
                  icon: '⚙️',
                },
                {
                  label: 'Tasa de cumplimiento',
                  value: `${data.complianceRate}%`,
                  icon: '✅',
                  unit: '%',
                },
              ];
              this.isLoadingMetrics = false;
            },
            error: (err) => {
              this.metricsError = 'Error al cargar métricas de técnico';
              this.loadFallbackMetrics();
            },
          });
        break;

      case 'Estudiante':
        const studentId = this.authService.getUserId() || 'unknown';
        this.api
          .getStudentMetrics(studentId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (data) => {
              this.metrics = [
                {
                  label: 'Próximas reservas',
                  value: data.upcomingBookings,
                  icon: '📆',
                },
                {
                  label: 'Reservas confirmadas',
                  value: data.confirmedBookings,
                  icon: '✔️',
                },
                {
                  label: 'Pendientes',
                  value: data.pendingBookings,
                  icon: '⏳',
                },
              ];
              this.isLoadingMetrics = false;
            },
            error: (err) => {
              this.metricsError = 'Error al cargar métricas de estudiante';
              this.loadFallbackMetrics();
            },
          });
        break;

      case 'Auditor':
        this.api
          .getAuditorMetrics()
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (data) => {
              this.metrics = [
                {
                  label: 'Eventos revisados',
                  value: data.eventsReviewed,
                  icon: '📋',
                },
                {
                  label: 'Anomalías',
                  value: data.anomalies,
                  icon: '🚨',
                },
                {
                  label: 'Incidencias cerradas',
                  value: `${data.incidencesClosed}%`,
                  icon: '📊',
                  unit: '%',
                },
              ];
              this.isLoadingMetrics = false;
            },
            error: (err) => {
              this.metricsError = 'Error al cargar métricas de auditor';
              this.loadFallbackMetrics();
            },
          });
        break;

      default:
        this.loadFallbackMetrics();
    }
  }

  private loadFallbackMetrics(): void {
    this.metrics = this.roleDefinition.metrics.map((m) => ({
      ...m,
      icon: '📊',
    }));
    this.isLoadingMetrics = false;
  }

  capabilities() {
    return this.roleDefinition.capabilities;
  }

  actions() {
    return this.roleDefinition.actions;
  }
}

  private loadDashboardMetrics(): void {
    this.isLoadingMetrics = true;
    this.metricsError = null;
    this.metrics = [];

    switch (this.selectedRole) {
      case 'Admin':
        this.api
          .getAdminMetrics()
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (data) => {
              this.metrics = [
                {
                  label: 'Ocupación de laboratorios',
                  value: `${data.labOccupancy}%`,
                  icon: '📊',
                  unit: '%',
                },
                {
                  label: 'Reservas hoy',
                  value: data.bookingsToday,
                  icon: '📅',
                },
                {
                  label: 'Recursos críticos',
                  value: data.criticalResources,
                  icon: '⚠️',
                },
              ];
              this.isLoadingMetrics = false;
            },
            error: (err) => {
              this.metricsError = 'Error al cargar métricas de administrador';
              this.loadFallbackMetrics();
            },
          });
        break;

      case 'Técnico':
        this.api
          .getTechnicianMetrics()
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (data) => {
              this.metrics = [
                {
                  label: 'Reservas por preparar',
                  value: data.bookingsToPrepare,
                  icon: '🔧',
                },
                {
                  label: 'Equipos pendientes',
                  value: data.pendingEquipment,
                  icon: '⚙️',
                },
                {
                  label: 'Tasa de cumplimiento',
                  value: `${data.complianceRate}%`,
                  icon: '✅',
                  unit: '%',
                },
              ];
              this.isLoadingMetrics = false;
            },
            error: (err) => {
              this.metricsError = 'Error al cargar métricas de técnico';
              this.loadFallbackMetrics();
            },
          });
        break;

      case 'Estudiante':
        const studentId = this.authService.getUserId() || 'unknown';
        this.api
          .getStudentMetrics(studentId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (data) => {
              this.metrics = [
                {
                  label: 'Próximas reservas',
                  value: data.upcomingBookings,
                  icon: '📆',
                },
                {
                  label: 'Reservas confirmadas',
                  value: data.confirmedBookings,
                  icon: '✔️',
                },
                {
                  label: 'Pendientes',
                  value: data.pendingBookings,
                  icon: '⏳',
                },
              ];
              this.isLoadingMetrics = false;
            },
            error: (err) => {
              this.metricsError = 'Error al cargar métricas de estudiante';
              this.loadFallbackMetrics();
            },
          });
        break;

      case 'Auditor':
        this.api
          .getAuditorMetrics()
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (data) => {
              this.metrics = [
                {
                  label: 'Eventos revisados',
                  value: data.eventsReviewed,
                  icon: '📋',
                },
                {
                  label: 'Anomalías',
                  value: data.anomalies,
                  icon: '🚨',
                },
                {
                  label: 'Incidencias cerradas',
                  value: `${data.incidencesClosed}%`,
                  icon: '📊',
                  unit: '%',
                },
              ];
              this.isLoadingMetrics = false;
            },
            error: (err) => {
              this.metricsError = 'Error al cargar métricas de auditor';
              this.loadFallbackMetrics();
            },
          });
        break;

      default:
        this.loadFallbackMetrics();
    }
  }

  private loadFallbackMetrics(): void {
    this.metrics = this.roleDefinition.metrics.map((m) => ({
      ...m,
      icon: '📊',
    }));
    this.isLoadingMetrics = false;
  }

  capabilities() {
    return this.roleDefinition.capabilities;
  }

  actions() {
    return this.roleDefinition.actions;
  }
}
