import { Component } from '@angular/core';

@Component({
  selector: 'app-audit-page',
  standalone: true,
  templateUrl: './audit.html',
  styleUrl: './audit.scss',
})
export class AuditPage {
  readonly events = [
    { user: 'Ana Pérez', date: '2026-09-08', type: 'Reserva', outcome: 'Confirmada' },
    { user: 'Luis Gómez', date: '2026-09-08', type: 'Cambio de estado', outcome: 'Preparación' },
    { user: 'Maria Torres', date: '2026-09-07', type: 'Cancelación', outcome: 'Rechazada' },
  ];
}
