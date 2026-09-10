import { Component, OnInit, inject } from '@angular/core';
import { CampusLabApiService, Resource } from '../../services/campuslab-api.service';

@Component({
  selector: 'app-catalog-page',
  standalone: true,
  templateUrl: './catalog.html',
  styleUrl: './catalog.scss',
})
export class CatalogPage implements OnInit {
  private readonly api = inject(CampusLabApiService);
  resources: Resource[] = [];
  error = '';

  ngOnInit(): void {
    this.api.resources().subscribe({
      next: (resources) => this.resources = resources,
      error: () => this.error = 'No fue posible cargar el catálogo.',
    });
  }
}
