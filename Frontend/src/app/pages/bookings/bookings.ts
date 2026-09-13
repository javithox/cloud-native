import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CampusLabApiService, Booking } from '../../services/campuslab-api.service';

@Component({
  selector: 'app-bookings-page',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './bookings.html',
  styleUrl: './bookings.scss',
})
export class BookingsPage implements OnInit {
  private readonly api = inject(CampusLabApiService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  bookings: Booking[] = [];
  loading = true;
  error = '';

  get currentRole() {
    return this.authService.getRole() ?? 'Estudiante';
  }

  canAdvanceStatus(): boolean {
    return ['Admin', 'Técnico'].includes(this.currentRole);
  }

  ngOnInit(): void { this.reload(); }

  reload(): void {
    this.loading = true;
    this.api.bookings().subscribe({
      next: (bookings) => { this.bookings = bookings; this.loading = false; },
      error: () => { this.error = 'No fue posible cargar las reservas.'; this.loading = false; },
    });
  }

  advance(booking: Booking): void {
    const next: Record<string, string> = {
      SOLICITADA: 'APROBADA', APROBADA: 'EN_PREPARACION',
      EN_PREPARACION: 'EN_USO', EN_USO: 'DEVUELTA',
    };
    const status = next[booking.status];
    if (status) this.api.updateBookingStatus(booking.id, status).subscribe({ next: () => this.reload() });
  }

  deleteBooking(booking: Booking): void {
    this.api.deleteBooking(booking.id).subscribe({ next: () => this.reload() });
  }

  goToCreateBooking(): void {
    this.router.navigate(['/bookings/new']);
  }
}
