import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CampusLabApiService } from '../../services/campuslab-api.service';

@Component({
  selector: 'app-catalog-form-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page form-page">
      <header class="page-header">
        <div>
          <p class="eyebrow">Catálogo</p>
          <h1>Nuevo recurso</h1>
        </div>
      </header>

      <form class="form-card" (ngSubmit)="submit()">
        <div class="field-grid">
          <label>
            <span>Código</span>
            <input [(ngModel)]="form.code" name="code" required />
          </label>
          <label>
            <span>Nombre</span>
            <input [(ngModel)]="form.name" name="name" required />
          </label>
          <label>
            <span>Tipo</span>
            <select [(ngModel)]="form.type" name="type" required>
              <option value="LABORATORIO">Laboratorio</option>
              <option value="EQUIPO">Equipo</option>
              <option value="INSUMO">Insumo</option>
            </select>
          </label>
          <label>
            <span>Stock total</span>
            <input [(ngModel)]="form.totalStock" name="totalStock" type="number" min="0" required />
          </label>
          <label class="full-width">
            <span>Descripción</span>
            <textarea [(ngModel)]="form.description" name="description" rows="4"></textarea>
          </label>
        </div>

        <div class="form-actions">
          <button type="button" class="secondary-action" (click)="cancel()">Cancelar</button>
          <button type="submit" class="primary-action">Guardar recurso</button>
        </div>
      </form>
    </section>
  `,
  styles: [
    '.page { display: grid; gap: 24px; }',
    '.page-header { display: flex; justify-content: space-between; align-items: center; }',
    '.eyebrow { margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.12em; color: #3b82f6; font-weight: 700; font-size: 0.72rem; }',
    'h1 { margin: 0; font-size: clamp(2rem, 3vw, 2.5rem); }',
    '.form-card { background: white; border: 1px solid rgba(148,163,184,0.2); border-radius: 20px; padding: 24px; }',
    '.field-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 18px; }',
    'label { display: grid; gap: 8px; font-weight: 600; color: #334155; }',
    'input, select, textarea { width: 100%; border: 1px solid #cbd5e1; border-radius: 12px; padding: 10px 12px; font: inherit; }',
    '.full-width { grid-column: 1 / -1; }',
    '.form-actions { margin-top: 24px; display: flex; justify-content: flex-end; gap: 12px; }',
    '.primary-action { border: none; background: #111827; color: white; border-radius: 12px; padding: 12px 18px; cursor: pointer; }',
    '.secondary-action { border: 1px solid #cbd5e1; background: white; color: #0f172a; border-radius: 12px; padding: 12px 18px; cursor: pointer; }'
  ]
})
export class CatalogFormPage implements OnInit {
  private readonly api = inject(CampusLabApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  isEditMode = false;
  resourceId: number | null = null;

  form = {
    code: '',
    name: '',
    description: '',
    type: 'LABORATORIO',
    totalStock: 1,
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.isEditMode = false;
      return;
    }

    this.resourceId = Number(id);
    this.isEditMode = true;
    this.api.getResourceById(this.resourceId).subscribe({
      next: (resource) => {
        this.form = {
          code: resource.code,
          name: resource.name,
          description: resource.description ?? '',
          type: resource.type,
          totalStock: resource.totalStock,
        };
      },
      error: () => alert('No se pudo cargar el recurso para editar.'),
    });
  }

  submit(): void {
    const payload = {
      code: this.form.code,
      name: this.form.name,
      description: this.form.description || undefined,
      type: this.form.type,
      totalStock: Number(this.form.totalStock),
    };

    const request$ = this.isEditMode && this.resourceId !== null
      ? this.api.updateResource(this.resourceId, payload)
      : this.api.createResource(payload);

    request$.subscribe({
      next: () => this.router.navigate(['/catalog']),
      error: () => alert(this.isEditMode ? 'No se pudo actualizar el recurso.' : 'No se pudo crear el recurso.'),
    });
  }

  cancel(): void {
    this.router.navigate(['/catalog']);
  }
}
