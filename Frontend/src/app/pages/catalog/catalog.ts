import { Component } from '@angular/core';

@Component({
  selector: 'app-catalog-page',
  standalone: true,
  templateUrl: './catalog.html',
  styleUrl: './catalog.scss',
})
export class CatalogPage {
  readonly resources = [
    { name: 'Laboratorio 3', type: 'Laboratorio', status: 'Disponible' },
    { name: 'Equipo de audio', type: 'Equipo', status: 'En mantenimiento' },
    { name: 'Insumos de laboratorio', type: 'Insumos', status: 'Bajo stock' },
  ];
}
