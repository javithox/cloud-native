import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CampusLabApiService } from '../../services/campuslab-api.service';

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
            <span>ID del estudiante</span>
            <input [(ngModel)]="form.studentId" name="studentId" required />
          </label>
          <label>
            <span>Email del estudiante</span>
            <input [(ngModel)]="form.studentEmail" name="studentEmail" type="email" required />
          </label>
          <label>
            <span>ID del recurso</span>
            <input [(ngModel)]="form.resourceId" name="resourceId" type="number" required />
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
            <textarea [(ngModel)]="form.notes" name="notes" rows="4"></textarea>
          </label>
        </div>

        <div class="form-actions">
          <button type="button" class="secondary-action" (click)="cancel()">Cancelar</button>
          <button type="submit" class="primary-action">Guardar reserva</button>
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
    'input, textarea { width: 100%; border: 1px solid #cbd5e1; border-radius: 12px; padding: 10px 12px; font: inherit; }',
    '.full-width { grid-column: 1 / -1; }',
    '.form-actions { margin-top: 24px; display: flex; justify-content: flex-end; gap: 12px; }',
    '.primary-action { border: none; background: #111827; color: white; border-radius: 12px; padding: 12px 18px; cursor: pointer; }',
    '.secondary-action { border: 1px solid #cbd5e1; background: white; color: #0f172a; border-radius: 12px; padding: 12px 18px; cursor: pointer; }'
  ]
})
export class BookingFormPage {
  private readonly api = inject(CampusLabApiService);
  private readonly router = inject(Router);

  form = {
    studentId: '',
    studentEmail: '',
    resourceId: 1,
    startTime: '',
    endTime: '',
    notes: '',
  };

  submit(): void {
    this.api.createBooking({
      studentId: this.form.studentId,
      studentEmail: this.form.studentEmail,
      resourceId: Number(this.form.resourceId),
      startTime: this.form.startTime,
      endTime: this.form.endTime,
      notes: this.form.notes || undefined,
    }).subscribe({
      next: () => this.router.navigate(['/bookings']),
      error: () => alert('No se pudo crear la reserva.'),
    });
  }

  cancel(): void {
    this.router.navigate(['/bookings']);
  }
}
