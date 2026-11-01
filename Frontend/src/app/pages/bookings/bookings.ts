import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CampusLabApiService, Booking } from '../../services/campuslab-api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-bookings-page',
  standalone: true,
  imports: [DatePipe, CommonModule],
  templateUrl: './bookings.html',
  styleUrl: './bookings.scss',
})
export class BookingsPage implements OnInit {
  private readonly api = inject(CampusLabApiService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  bookings: Booking[] = [];
  loading = true;
  error = '';
  confirmAction: { type: 'approve' | 'cancel'; booking: Booking } | null = null;

  get currentRole() {
    return this.authService.getRole() ?? 'Estudiante';
  }

  canAcceptBooking(): boolean {
    return ['Admin', 'Técnico'].includes(this.currentRole);
  }

  canCancelBooking(): boolean {
    return ['Admin', 'Técnico', 'Estudiante'].includes(this.currentRole);
  }

  ngOnInit(): void { 
    this.reload(); 
  }

  reload(): void {
    this.loading = true;
    this.api.bookings().subscribe({
      next: (bookings) => { 
        this.bookings = bookings; 
        this.loading = false; 
      },
      error: () => { 
        this.error = 'No fue posible cargar las reservas.'; 
        this.loading = false; 
        this.toastService.error('No fue posible cargar las reservas.');
      },
    });
  }

  /**
   * Aceptar reserva - cambiar estado a CONFIRMED
   */

  /**
   * Aceptar una solicitud pendiente.
   */
  acceptBooking(booking: Booking): void {
    if (booking.status !== 'SOLICITADA') {
      this.error = 'Solo se pueden aceptar solicitudes pendientes.';
      return;
    }

    this.confirmAction = { type: 'approve', booking };
    this.error = '';
  }

  requestCancelBooking(booking: Booking): void {
    const cancellableStatuses = ['SOLICITADA', 'APROBADA', 'EN_PREPARACION'];

    if (!cancellableStatuses.includes(booking.status)) {
      this.error = 'Esta reserva no se puede cancelar en su estado actual.';
      return;
    }

    this.confirmAction = { type: 'cancel', booking };
    this.error = '';
  }

  confirmBookingAction(): void {
    if (!this.confirmAction) {
      return;
    }

    const { type, booking } = this.confirmAction;
    const nextStatus = type === 'approve' ? 'APROBADA' : 'CANCELADA';

    this.api.updateBookingStatus(booking.id, nextStatus).subscribe({
      next: () => {
        this.toastService.success(type === 'approve' ? 'Reserva aprobada correctamente.' : 'Reserva cancelada correctamente.');
        this.confirmAction = null;
        this.reload();
      },
      error: () => {
        this.error = type === 'approve' ? 'Error al aceptar la reserva.' : 'Error al cancelar la reserva.';
        this.toastService.error(type === 'approve' ? 'Error al aceptar la reserva.' : 'Error al cancelar la reserva.');
        this.confirmAction = null;
      },
    });
  }

  /**
   * Cancelar una solicitud o reserva que permita esta transición.
   */
  cancelBooking(booking: Booking): void {
    this.requestCancelBooking(booking);
  }

  closeConfirmModal(): void {
    this.confirmAction = null;
  }
  
  goToCreateBooking(): void {
    this.router.navigate(['/bookings/new']);
  }
}
