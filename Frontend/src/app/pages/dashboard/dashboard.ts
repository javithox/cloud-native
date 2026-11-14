import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CampusLabApiService } from '../../services/campuslab-api.service';
import { getRoleDefinition, AppRole, ROLE_DEFINITIONS } from '../../services/role-permissions';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface DashboardMetric {
  label: string;
  value: string | number;
  icon?: string;
  unit?: string;
}

interface ResourceUsageChartItem {
  name: string;
  count: number;
  percentage: number;
  color: string;
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
  isRefreshingMetrics = false;
  metricsError: string | null = null;
  isLoadingResourceChart = false;
  isRefreshingResourceChart = false;
  isLoadingStatusChart = false;
  isRefreshingStatusChart = false;
  resourceUsageChart: ResourceUsageChartItem[] = [];
  statusUsageChart: ResourceUsageChartItem[] = [];
  donutStyle: string = 'conic-gradient(#dbeafe 0 100%)';
  statusDonutStyle: string = 'conic-gradient(#dbeafe 0 100%)';

  ngOnInit(): void {
    // Establecer rol actual y verificar si es Admin
    this.selectedRole = (this.authService.getRole() as AppRole) || 'Estudiante';
    this.isAdmin = this.selectedRole === 'Admin';

    // Si no es Admin, no permitir cambio de rol
    if (!this.isAdmin) {
      this.selectedRole = this.authService.getRole() as AppRole;
    }

    this.loadDashboardMetrics();
    this.loadResourceUsageChart();
    this.loadBookingStatusChart();
    this.startPolling();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private startPolling(): void {
    interval(5000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadDashboardMetrics();
        this.loadResourceUsageChart();
        this.loadBookingStatusChart();
      });
  }

  private loadResourceUsageChart(): void {
    const hasExistingData = this.resourceUsageChart.length > 0;
    this.isLoadingResourceChart = !hasExistingData;
    this.isRefreshingResourceChart = hasExistingData;

    this.api.getReportStats().subscribe({
      next: (stats) => {
        const total = stats.topResources.reduce((sum, resource) => sum + resource.bookingCount, 0);
        const palette = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

        this.resourceUsageChart = stats.topResources.slice(0, 6).map((resource, index) => ({
          name: resource.resourceName,
          count: resource.bookingCount,
          percentage: total > 0 ? Math.round((resource.bookingCount / total) * 100) : 0,
          color: palette[index % palette.length],
        }));

        this.donutStyle = this.toConicGradient(this.resourceUsageChart);
        this.isLoadingResourceChart = false;
        this.isRefreshingResourceChart = false;
      },
      error: () => {
        this.resourceUsageChart = [];
        this.donutStyle = 'conic-gradient(#dbeafe 0 100%)';
        this.isLoadingResourceChart = false;
        this.isRefreshingResourceChart = false;
      },
    });
  }

  private loadBookingStatusChart(): void {
    const hasExistingData = this.statusUsageChart.length > 0;
    this.isLoadingStatusChart = !hasExistingData;
    this.isRefreshingStatusChart = hasExistingData;

    this.api.getReportStats().subscribe({
      next: (stats) => {
        const total = Object.values(stats.bookingsByStatus).reduce((sum, value) => sum + value, 0);
        const palette = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6'];

        this.statusUsageChart = Object.entries(stats.bookingsByStatus || {})
          .map(([status, count], index) => ({
            name: status,
            count,
            percentage: total > 0 ? Math.round((count / total) * 100) : 0,
            color: palette[index % palette.length],
          }))
          .slice(0, 6);

        this.statusDonutStyle = this.toConicGradient(this.statusUsageChart);
        this.isLoadingStatusChart = false;
        this.isRefreshingStatusChart = false;
      },
      error: () => {
        this.statusUsageChart = [];
        this.statusDonutStyle = 'conic-gradient(#dbeafe 0 100%)';
        this.isLoadingStatusChart = false;
        this.isRefreshingStatusChart = false;
      },
    });
  }

  private toConicGradient(items: ResourceUsageChartItem[]): string {
    if (!items.length) return 'conic-gradient(#dbeafe 0 100%)';

    let accumulated = 0;
    const gradient = items
      .map((item) => {
        const start = accumulated;
        accumulated += item.percentage;
        return `${item.color} ${start}% ${accumulated}%`;
      })
      .join(', ');

    return `conic-gradient(${gradient || '#dbeafe 0 100%'})`;
  }

  onRoleChange(): void {
    // Solo Admin puede cambiar de rol
    if (this.isAdmin) {
      this.loadDashboardMetrics();
    }
  }

  private loadDashboardMetrics(): void {
    const hasExistingMetrics = this.metrics.length > 0;
    this.isLoadingMetrics = !hasExistingMetrics;
    this.isRefreshingMetrics = hasExistingMetrics;
    this.metricsError = null;

    if (!hasExistingMetrics) {
      this.metrics = [];
    }

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
              this.isRefreshingMetrics = false;
            },
            error: (err) => {
              this.metricsError = 'Error al cargar métricas de administrador';
              this.isLoadingMetrics = false;
              this.isRefreshingMetrics = false;
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
              this.isRefreshingMetrics = false;
            },
            error: (err) => {
              this.metricsError = 'Error al cargar métricas de técnico';
              this.isLoadingMetrics = false;
              this.isRefreshingMetrics = false;
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
              this.isRefreshingMetrics = false;
            },
            error: (err) => {
              this.metricsError = 'Error al cargar métricas de estudiante';
              this.isLoadingMetrics = false;
              this.isRefreshingMetrics = false;
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

