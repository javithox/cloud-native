import { Component, OnInit, inject } from '@angular/core';
import { CampusLabApiService } from '../../services/campuslab-api.service';

@Component({
  selector: 'app-audit-page',
  standalone: true,
  templateUrl: './audit.html',
  styleUrl: './audit.scss',
})
export class AuditPage implements OnInit {
  private readonly api = inject(CampusLabApiService);

  events: Array<{ user: string; date: string; type: string; outcome: string }> = [];

  ngOnInit(): void {
    this.api.audit().subscribe({
      next: (items) => {
        this.events = items.map((event) => ({
          user: event.correlationId ?? 'Sistema',
          date: event.createdAt ? new Date(event.createdAt).toLocaleDateString() : 'Sin fecha',
          type: event.eventType ?? 'Evento',
          outcome: event.payload ? 'Registrado' : 'Sin detalle',
        }));
      },
      error: () => {
        this.events = [
          { user: 'Sistema', date: 'Sin datos', type: 'Sin eventos', outcome: 'No disponible' },
        ];
      },
    });
  }
}
