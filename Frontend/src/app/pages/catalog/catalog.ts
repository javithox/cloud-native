import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CampusLabApiService, Resource } from '../../services/campuslab-api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-catalog-page',
  standalone: true,
  templateUrl: './catalog.html',
  styleUrl: './catalog.scss',
})
export class CatalogPage implements OnInit {
  private readonly api = inject(CampusLabApiService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  resources: Resource[] = [];
  error = '';

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.api.resources().subscribe({
      next: (resources) => this.resources = resources,
      error: () => {
        this.error = 'No fue posible cargar el catálogo.';
        this.toastService.error('No fue posible cargar el catálogo.');
      },
    });
  }

  editResource(resource: Resource): void {
    this.router.navigate(['/catalog', resource.id, 'edit']);
  }

  deleteResource(resource: Resource): void {
    this.api.deleteResource(resource.id).subscribe({
      next: () => {
        this.toastService.success(`Recurso "${resource.name}" eliminado correctamente.`);
        this.reload();
      },
      error: () => this.toastService.error(`No se pudo eliminar el recurso "${resource.name}".`),
    });
  }

  goToCreateResource(): void {
    this.router.navigate(['/catalog/new']);
  }
}
