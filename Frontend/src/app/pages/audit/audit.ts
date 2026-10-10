import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CampusLabApiService } from '../../services/campuslab-api.service';

interface AuditEvent {
  id: string;
  user: string;
  timestamp: string;
  action: string;
  resourceName: string;
  status: string;
}

@Component({
  selector: 'app-audit-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audit.html',
  styleUrl: './audit.scss',
})
export class AuditPage implements OnInit {
  private readonly api = inject(CampusLabApiService);

  events: AuditEvent[] = [];
  isLoading = true;
  error: string | null = null;

  // Estadísticas de auditoría
  totalEvents = 0;
  eventsByStatus: Record<string, number> = {};
  eventsByUser = new Map<string, number>();

  ngOnInit(): void {
    this.loadAuditData();
  }

  private loadAuditData(): void {
    this.isLoading = true;
    this.error = null;

    this.api.getAuditWithBookings().subscribe({
      next: (items) => {
        this.events = items
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 100); // Últimos 100 eventos

        this.totalEvents = this.events.length;

        // Estadísticas por estado
        this.eventsByStatus = {};
        this.events.forEach((event) => {
          this.eventsByStatus[event.status] = (this.eventsByStatus[event.status] || 0) + 1;
        });

        // Estadísticas por usuario (últimos 10)
        const userMap = new Map<string, number>();
        this.events.forEach((event) => {
          userMap.set(event.user, (userMap.get(event.user) || 0) + 1);
        });

        this.eventsByUser = new Map(
          Array.from(userMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
        );

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading audit data:', err);
        this.error = 'Error al cargar los datos de auditoría';
        this.events = [];
        this.isLoading = false;
      },
    });
  }

  getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      PENDING: '#f59e0b',
      CONFIRMED: '#10b981',
      CANCELLED: '#ef4444',
      COMPLETED: '#3b82f6',
    };
    return colorMap[status] || '#6b7280';
  }

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  }
}
