import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'info' | 'error';

export interface AppToast {
  id: number;
  type: ToastType;
  title: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toastsSubject = new BehaviorSubject<AppToast[]>([]);
  readonly toasts$ = this.toastsSubject.asObservable();

  private counter = 0;

  show(message: string, type: ToastType = 'info', title?: string): void {
    const toast: AppToast = {
      id: ++this.counter,
      type,
      title: title ?? this.defaultTitle(type),
      message,
    };

    const current = this.toastsSubject.value;
    this.toastsSubject.next([...current, toast]);

    setTimeout(() => this.remove(toast.id), 3500);
  }

  success(message: string, title = 'Éxito'): void {
    this.show(message, 'success', title);
  }

  error(message: string, title = 'Error'): void {
    this.show(message, 'error', title);
  }

  info(message: string, title = 'Información'): void {
    this.show(message, 'info', title);
  }

  remove(id: number): void {
    const current = this.toastsSubject.value;
    this.toastsSubject.next(current.filter((toast) => toast.id !== id));
  }

  private defaultTitle(type: ToastType): string {
    switch (type) {
      case 'success': return 'Éxito';
      case 'error': return 'Error';
      default: return 'Información';
    }
  }
}
