import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AppToast, ToastService } from '../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" aria-live="polite" aria-atomic="true">
      @for (toast of toasts; track toast.id) {
        <div class="toast toast-{{ toast.type }}" role="status">
          <div class="toast-header">
            <strong>{{ toast.title }}</strong>
            <button type="button" aria-label="Cerrar mensaje" (click)="dismiss(toast.id)">×</button>
          </div>
          <p>{{ toast.message }}</p>
        </div>
      }
    </div>
  `,
  styles: [
    '.toast-container { position: fixed; right: 20px; bottom: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 12px; max-width: 360px; width: min(360px, calc(100vw - 24px)); }',
    '.toast { background: #fff; border-left: 6px solid #3b82f6; border-radius: 12px; box-shadow: 0 12px 30px rgba(15, 23, 42, 0.18); padding: 12px 14px; color: #0f172a; }',
    '.toast-success { border-left-color: #10b981; }',
    '.toast-error { border-left-color: #ef4444; }',
    '.toast-info { border-left-color: #3b82f6; }',
    '.toast-header { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 6px; }',
    '.toast-header strong { font-size: 0.9rem; }',
    '.toast-header button { border: none; background: transparent; color: #475569; font-size: 1.2rem; cursor: pointer; }',
    '.toast p { margin: 0; font-size: 0.9rem; line-height: 1.4; }'
  ]
})
export class ToastContainerComponent {
  private readonly toastService = inject(ToastService);
  toasts: AppToast[] = [];

  constructor() {
    this.toastService.toasts$.subscribe((toasts) => {
      this.toasts = toasts;
    });
  }

  dismiss(id: number): void {
    this.toastService.remove(id);
  }
}
