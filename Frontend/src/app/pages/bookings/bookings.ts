import { Component } from '@angular/core';

@Component({
  selector: 'app-bookings-page',
  standalone: true,
  templateUrl: './bookings.html',
  styleUrl: './bookings.scss',
})
export class BookingsPage {
  readonly bookings = [
    { id: 'BK-101', resource: 'Laboratorio 3', user: 'Ana Pérez', status: 'Confirmada' },
    { id: 'BK-102', resource: 'Equipo de audio', user: 'Luis Gómez', status: 'En preparación' },
    { id: 'BK-103', resource: 'Insumos', user: 'Maria Torres', status: 'Finalizada' },
  ];
}
