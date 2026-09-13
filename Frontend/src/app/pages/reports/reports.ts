import { Component, OnInit, inject } from '@angular/core';
import { CampusLabApiService } from '../../services/campuslab-api.service';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
})
export class ReportsPage implements OnInit {
  private readonly api = inject(CampusLabApiService);

  rows: Array<{ label: string; value: string }> = [];

  ngOnInit(): void {
    this.api.kpis().subscribe({
      next: (kpis) => {
        const bookingTotal = Number(kpis['booking_total'] ?? 0);
        const bookingStatusCount = Number(kpis['booking_status_count'] ?? 0);

        this.rows = [
          { label: 'Reservas totales', value: String(bookingTotal) },
          { label: 'Estados reportados', value: String(bookingStatusCount) },
          { label: 'Fuente', value: 'Backend reportes' },
        ];
      },
      error: () => {
        this.rows = [
          { label: 'Reservas por hora', value: '0' },
          { label: 'Tiempo de ciclo', value: '0 h' },
          { label: 'Recursos más usados', value: 'Sin datos' },
        ];
      },
    });
  }
}
