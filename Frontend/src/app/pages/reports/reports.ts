import { Component } from '@angular/core';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
})
export class ReportsPage {
  readonly rows = [
    { label: 'Reservas por hora', value: '128' },
    { label: 'Tiempo de ciclo', value: '4.2 h' },
    { label: 'Recursos más usados', value: 'Laboratorio 3 / Equipo 2' },
  ];
}
