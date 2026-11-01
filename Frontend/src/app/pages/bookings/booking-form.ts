import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CampusLabApiService } from '../../services/campuslab-api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-booking-form-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page form-page">
      <header class="page-header">
        <div>
          <p class="eyebrow">Reservas</p>
          <h1>Nueva reserva</h1>
        </div>
      </header>

      <form class="form-card" (ngSubmit)="submit()">
        <div class="field-grid">
          <label>
            <span>Email del estudiante</span>
            <input [(ngModel)]="form.studentEmail" name="studentEmail" type="email" required />
          </label>
          <label>
            <span>Recurso</span>
            <select [(ngModel)]="form.resourceId" name="resourceId" required [disabled]="resources.length === 0">
              <option value="">Selecciona un recurso</option>
              @for (resource of resources; track resource.id) {
                <option [value]="resource.id">{{ resource.name }} ({{ resource.code }})</option>
              }
            </select>
          </label>
          <label>
            <span>Fecha inicio</span>
            <input [(ngModel)]="form.startTime" name="startTime" type="datetime-local" required />
          </label>
          <label>
            <span>Fecha fin</span>
            <input [(ngModel)]="form.endTime" name="endTime" type="datetime-local" required />
          </label>
          <label class="full-width">
            <span>Notas</span>
            <textarea [(ngModel)]="form.notes" name="notes" rows="4" placeholder="Comentario opcional para la reserva"></textarea>
          </label>
        </div>

        <div class="form-actions">
          <button type="button" class="secondary-action" (click)="cancel()">Cancelar</button>
          <button type="submit" class="primary-action" [disabled]="isSubmitDisabled || isSubmitting">
            {{ isSubmitting ? 'Guardando...' : 'Guardar reserva' }}
          </button>
        </div>
      </form>

      @if (confirmSubmit) {
        <div class="confirm-overlay" (click)="confirmSubmit = false">
          <div class="confirm-panel" (click)="$event.stopPropagation()">
            <div class="confirm-header">
              <h3>Confirmar reserva</h3>
              <button type="button" class="close-button" (click)="confirmSubmit = false">×</button>
            </div>
            <p>¿Deseas confirmar la creación de esta reserva?</p>
            <div class="confirm-actions">
              <button type="button" class="secondary-action" (click)="confirmSubmit = false">Volver</button>
              <button type="button" class="primary-action" (click)="confirmBookingSubmit()">Confirmar reserva</button>
            </div>
          </div>
        </div>
      }
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
    '.secondary-action:hover { background: #f8fafc; border-color: #94a3b8; }',
    '.confirm-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1200; padding: 20px; }',
    '.confirm-panel { width: min(420px, 100%); background: white; border-radius: 18px; box-shadow: 0 20px 40px rgba(15, 23, 42, 0.2); padding: 22px; }',
    '.confirm-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; }',
    '.confirm-header h3 { margin: 0; font-size: 1.3rem; }',
    '.close-button { border: none; background: transparent; font-size: 1.7rem; line-height: 1; cursor: pointer; color: #475569; }',
    '.confirm-panel p { margin: 0 0 20px; color: #334155; line-height: 1.5; }',
    '.confirm-actions { display: flex; justify-content: flex-end; gap: 12px; }'
  ]
})
export class BookingFormPage implements OnInit {
  private readonly api = inject(CampusLabApiService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  resources: Array<{ id: number; name: string; code: string }> = [];
  isSubmitting = false;
  confirmSubmit = false;

  form = {
    studentEmail: '',
    resourceId: '',
    startTime: '',
    endTime: '',
    notes: '',
  };

  ngOnInit(): void {
    this.api.resources().subscribe({
      next: (items) => {
        this.resources = items.filter((resource) => resource.active !== false);
        if (this.resources.length > 0 && !this.form.resourceId) {
          this.form.resourceId = String(this.resources[0].id);
        }
      },
      error: () => this.toastService.error('No se pudo cargar la lista de recursos disponibles.'),
    });
  }

  get isSubmitDisabled(): boolean {
    return !this.form.studentEmail.trim() ||
      !this.form.resourceId ||
      !this.form.startTime ||
      !this.form.endTime;
  }

  submit(): void {
    if (this.isSubmitDisabled) {
      this.toastService.info('Completa todos los campos obligatorios para registrar la reserva.');
      return;
    }

    this.confirmSubmit = true;
  }

  confirmBookingSubmit(): void {
    this.confirmSubmit = false;
    this.isSubmitting = true;
    const studentEmail = this.form.studentEmail.trim();

    this.api.createBooking({
      studentEmail,
      resourceId: Number(this.form.resourceId),
      startTime: this.form.startTime,
      endTime: this.form.endTime,
      notes: this.form.notes.trim() || undefined,
    }).subscribe({
      next: () => {
        this.toastService.success('Reserva creada correctamente.');
        this.router.navigate(['/bookings']);
      },
      error: () => {
        this.isSubmitting = false;
        this.toastService.error('No se pudo crear la reserva. Revisa los datos o el recurso disponible.');
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/bookings']);
  }
}
