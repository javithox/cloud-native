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
  confirmDelete: Resource | null = null;
  confirmCreateResource = false;

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

  requestDeleteResource(resource: Resource): void {
    this.confirmDelete = resource;
  }

  confirmDeleteResource(): void {
    if (!this.confirmDelete) {
      return;
    }

    const resource = this.confirmDelete;
    this.api.deleteResource(resource.id).subscribe({
      next: () => {
        this.toastService.success(`Recurso "${resource.name}" eliminado correctamente.`);
        this.confirmDelete = null;
        this.reload();
      },
      error: () => {
        this.toastService.error(`No se pudo eliminar el recurso "${resource.name}".`);
        this.confirmDelete = null;
      },
    });
  }

  closeDeleteConfirm(): void {
    this.confirmDelete = null;
  }

  requestCreateResource(): void {
    this.confirmCreateResource = true;
  }

  closeCreateResourceConfirm(): void {
    this.confirmCreateResource = false;
  }

  goToCreateResource(): void {
    this.confirmCreateResource = false;
    this.router.navigate(['/catalog/new']);
  }
}
