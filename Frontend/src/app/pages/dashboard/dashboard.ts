import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardPage {
  constructor(private readonly authService: AuthService) {}

  get currentRole(): string {
    return this.authService.getRole() ?? 'Estudiante';
  }

  metrics() {
    const role = this.currentRole;

    const map = {
      Admin: [
        { label: 'Ocupación de laboratorios', value: '74%' },
        { label: 'Reservas hoy', value: '48' },
        { label: 'Recursos críticos', value: '6' },
      ],
      Técnico: [
        { label: 'Reservas por preparar', value: '12' },
        { label: 'Equipos pendientes', value: '4' },
        { label: 'Tasa de cumplimiento', value: '91%' },
      ],
      Estudiante: [
        { label: 'Próximas reservas', value: '3' },
        { label: 'Reservas confirmadas', value: '2' },
        { label: 'Pendientes', value: '1' },
      ],
      Auditor: [
        { label: 'Eventos revisados', value: '132' },
        { label: 'Anomalías', value: '3' },
        { label: 'Incidencias cerradas', value: '96%' },
      ],
    } as const;

    return map[role as keyof typeof map] ?? map.Estudiante;
  }
}
