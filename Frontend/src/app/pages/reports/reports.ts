import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CampusLabApiService } from '../../services/campuslab-api.service';

interface ReportMetric {
  label: string;
  value: string;
  icon?: string;
  color?: string;
}

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
})
export class ReportsPage implements OnInit {
  private readonly api = inject(CampusLabApiService);

  // Métricas principales
  rows: ReportMetric[] = [];
  
  // Recursos más usados
  topResources: Array<{ name: string; count: number; percentage: number }> = [];
  
  // Estados de reservas
  bookingStatusChart: Array<{ status: string; count: number }> = [];

  isLoading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.loadReportStats();
  }

  private loadReportStats(): void {
    this.isLoading = true;
    this.error = null;

    this.api.getReportStats().subscribe({
      next: (stats) => {
        // Cargar métricas principales
        this.rows = [
          {
            label: 'Reservas totales',
            value: String(stats.totalBookings),
            icon: '📊',
            color: '#3498db',
          },
          {
            label: 'Tiempo de ciclo promedio',
            value: `${Math.round(stats.averageCycleTime)} min`,
            icon: '⏱️',
            color: '#e74c3c',
          },
          {
            label: 'Recursos más usado',
            value: stats.topResources.length > 0 ? stats.topResources[0].resourceName : 'N/A',
            icon: '🎯',
            color: '#2ecc71',
          },
          {
            label: 'Estados diferentes',
            value: String(Object.keys(stats.bookingsByStatus).length),
            icon: '📈',
            color: '#f39c12',
          },
        ];

        // Cargar recursos más usados
        const totalBookings = stats.topResources.reduce((sum, r) => sum + r.bookingCount, 0);
        this.topResources = stats.topResources.map((resource) => ({
          name: resource.resourceName,
          count: resource.bookingCount,
          percentage: totalBookings > 0 ? Math.round((resource.bookingCount / totalBookings) * 100) : 0,
        }));

        // Cargar estados
        this.bookingStatusChart = Object.entries(stats.bookingsByStatus).map(([status, count]) => ({
          status,
          count,
        }));

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading report stats:', err);
        this.error = 'Error al cargar las estadísticas de reportes';
        this.rows = [
          { label: 'Reservas totales', value: '0' },
          { label: 'Tiempo de ciclo promedio', value: '0 min' },
          { label: 'Recursos más usado', value: 'Sin datos' },
          { label: 'Estados diferentes', value: '0' },
        ];
        this.isLoading = false;
      },
    });
  }
}
