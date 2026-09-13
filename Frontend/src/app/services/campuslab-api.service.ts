import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Booking {
  id: number;
  studentId: string;
  studentEmail: string;
  resourceId: number;
  resourceName: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string;
  createdAt?: string;
}

export interface Resource {
  id: number;
  code: string;
  name: string;
  description?: string;
  type: string;
  totalStock: number;
  availableStock: number;
  active: boolean;
}

@Injectable({ providedIn: 'root' })
export class CampusLabApiService {
  private readonly http = inject(HttpClient);
  private readonly bookingsUrl = environment.apiBookingsUrl.replace(/\/$/, '');
  private readonly catalogUrl = environment.apiCatalogUrl.replace(/\/$/, '');
  private readonly reportUrl = environment.apiReportUrl.replace(/\/$/, '');
  private readonly auditUrl = environment.apiAuditUrl.replace(/\/$/, '');

  bookings(status?: string): Observable<Booking[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<Booking[]>(`${this.bookingsUrl}/bookings`, { params });
  }

  updateBookingStatus(id: number, status: string): Observable<Booking> {
    return this.http.put<Booking>(`${this.bookingsUrl}/bookings/${id}/status`, { status });
  }

  createBooking(payload: {
    studentId: string;
    studentEmail: string;
    resourceId: number;
    startTime: string;
    endTime: string;
    notes?: string;
  }): Observable<Booking> {
    return this.http.post<Booking>(`${this.bookingsUrl}/bookings`, payload);
  }

  resources(): Observable<Resource[]> {
    return this.http.get<Resource[]>(`${this.catalogUrl}/catalog/resources`);
  }

  kpis(): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(`${this.reportUrl}/report/kpis`, {
      params: { range: 'last24h' },
    });
  }

  audit(): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.auditUrl}/audit/events`);
  }
}
