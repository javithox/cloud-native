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

  getBookingById(id: number): Observable<Booking> {
    return this.http.get<Booking>(`${this.bookingsUrl}/bookings/${id}`);
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

  deleteBooking(id: number): Observable<Booking> {
    return this.http.delete<Booking>(`${this.bookingsUrl}/bookings/${id}`);
  }

  resources(): Observable<Resource[]> {
    return this.http.get<Resource[]>(`${this.catalogUrl}/catalog/resources`);
  }

  getResourceById(id: number): Observable<Resource> {
    return this.http.get<Resource>(`${this.catalogUrl}/catalog/resources/${id}`);
  }

  createResource(payload: {
    code: string;
    name: string;
    description?: string;
    type: string;
    totalStock: number;
  }): Observable<Resource> {
    return this.http.post<Resource>(`${this.catalogUrl}/catalog/resources`, payload);
  }

  updateResource(id: number, payload: {
    code?: string;
    name?: string;
    description?: string;
    type?: string;
    totalStock?: number;
  }): Observable<Resource> {
    return this.http.put<Resource>(`${this.catalogUrl}/catalog/resources/${id}/details`, payload);
  }

  deleteResource(id: number): Observable<Resource> {
    return this.http.delete<Resource>(`${this.catalogUrl}/catalog/resources/${id}`);
  }

  kpis(): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(`${this.reportUrl}/report/kpis`, {
      params: { range: 'last24h' },
    });
  }

  audit(): Observable<Array<{ id?: number; eventType?: string; correlationId?: string; traceId?: string; createdAt?: string; payload?: string; timestamp?: number }>> {
    return this.http.get<Array<{ id?: number; eventType?: string; correlationId?: string; traceId?: string; createdAt?: string; payload?: string; timestamp?: number }>>(`${this.auditUrl}/audit/timeline`);
  }
}
