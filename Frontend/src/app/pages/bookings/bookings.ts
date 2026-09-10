import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
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
  bookings: Booking[] = [];
  loading = true;
  error = '';

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
}
