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
          <button type="submit" class="primary-action" [disabled]="isSubmitDisabled || isSubmitting">
            {{ isSubmitting ? 'Guardando...' : (isEditMode ? 'Actualizar recurso' : 'Guardar recurso') }}
          </button>
        </div>
      </form>
    </section>
  `,
  styles: [
    '.page { display: grid; gap: 24px; }',
    '.page-header { display: flex; justify-content: space-between; align-items: center; }',
    '.eyebrow { margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.12em; color: #3b82f6; font-weight: 700; font-size: 0.72rem; }',
    'h1 { margin: 0; font-size: clamp(2rem, 3vw, 2.5rem); }',
    '.form-card { background: white; border: 1px solid rgba(148,163,184,0.2); border-radius: 20px; padding: 24px; box-shadow: 0 8px 30px rgba(15, 23, 42, 0.05); }',
    '.field-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 18px; }',
    'label { display: grid; gap: 8px; font-weight: 600; color: #334155; }',
    'input, select, textarea { width: 100%; border: 1px solid #cbd5e1; border-radius: 12px; padding: 10px 12px; font: inherit; background: #fff; color: #0f172a; box-sizing: border-box; }',
    'input:focus, select:focus, textarea:focus { outline: 2px solid rgba(37, 99, 235, 0.2); border-color: #3b82f6; }',
    '.full-width { grid-column: 1 / -1; }',
    '.form-actions { margin-top: 24px; display: flex; justify-content: flex-end; gap: 12px; }',
    '.primary-action { border: none; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; border-radius: 12px; padding: 12px 18px; cursor: pointer; font-weight: 700; box-shadow: 0 10px 20px rgba(37,99,235,0.2); transition: transform 0.2s ease, box-shadow 0.2s ease; }',
    '.primary-action:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 14px 24px rgba(37,99,235,0.28); }',
    '.primary-action:disabled { opacity: 0.55; cursor: not-allowed; }',
    '.secondary-action { border: 1px solid #cbd5e1; background: white; color: #0f172a; border-radius: 12px; padding: 12px 18px; cursor: pointer; font-weight: 600; transition: all 0.2s ease; }',
    '.secondary-action:hover { background: #f8fafc; border-color: #94a3b8; }'
  ]
})
export class CatalogFormPage implements OnInit {
  private readonly api = inject(CampusLabApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  isEditMode = false;
  resourceId: number | null = null;
  isSubmitting = false;

  form = {
    code: '',
    name: '',
    description: '',
    type: 'LABORATORIO',
    totalStock: 1,
  };

  get isSubmitDisabled(): boolean {
    return !this.form.code.trim() || !this.form.name.trim() || !this.form.type || Number(this.form.totalStock) < 0;
  }

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
    if (this.isSubmitDisabled) {
      alert('Completa los campos obligatorios del recurso antes de guardar.');
      return;
    }

    this.isSubmitting = true;

    const payload = {
      code: this.form.code.trim(),
      name: this.form.name.trim(),
      description: this.form.description.trim() || undefined,
      type: this.form.type,
      totalStock: Number(this.form.totalStock),
    };

    const request$ = this.isEditMode && this.resourceId !== null
      ? this.api.updateResource(this.resourceId, payload)
      : this.api.createResource(payload);

    request$.subscribe({
      next: () => this.router.navigate(['/catalog']),
      error: () => {
        this.isSubmitting = false;
        alert(this.isEditMode ? 'No se pudo actualizar el recurso.' : 'No se pudo crear el recurso.');
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/catalog']);
  }
}
