import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { catchError, map, switchMap } from 'rxjs/operators';

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

  private endpoint(baseUrl: string, path: string): string {
    const normalizedBase = baseUrl.replace(/\/$/, '');
    const normalizedPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';
    return `${normalizedBase}${normalizedPath}`;
  }

  bookings(status?: string): Observable<Booking[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<Booking[]>(this.bookingsUrl, { params });
  }

  updateBookingStatus(id: number, status: string): Observable<Booking> {
    return this.http.put<Booking>(this.endpoint(this.bookingsUrl, `/${id}/status`), { status });
  }

  getBookingById(id: number): Observable<Booking> {
    return this.http.get<Booking>(this.endpoint(this.bookingsUrl, `/${id}`));
  }

  createBooking(payload: {
    studentId: string;
    studentEmail: string;
    resourceId: number;
    startTime: string;
    endTime: string;
    notes?: string;
  }): Observable<Booking> {
    return this.http.post<Booking>(this.bookingsUrl, payload);
  }

  deleteBooking(id: number): Observable<Booking> {
    return this.http.delete<Booking>(this.endpoint(this.bookingsUrl, `/${id}`));
  }

  resources(): Observable<Resource[]> {
    return this.http.get<Resource[]>(this.endpoint(this.catalogUrl, '/resources'));
  }

  getResourceById(id: number): Observable<Resource> {
    return this.http.get<Resource>(this.endpoint(this.catalogUrl, `/resources/${id}`));
  }

  createResource(payload: {
    code: string;
    name: string;
    description?: string;
    type: string;
    totalStock: number;
  }): Observable<Resource> {
    return this.http.post<Resource>(this.endpoint(this.catalogUrl, '/resources'), payload);
  }

  updateResource(id: number, payload: {
    code?: string;
    name?: string;
    description?: string;
    type?: string;
    totalStock?: number;
  }): Observable<Resource> {
    return this.http.put<Resource>(this.endpoint(this.catalogUrl, `/resources/${id}/details`), payload);
  }

  deleteResource(id: number): Observable<Resource> {
    return this.http.delete<Resource>(this.endpoint(this.catalogUrl, `/resources/${id}`));
  }

  kpis(): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(this.endpoint(this.reportUrl, '/kpis'), {
      params: { range: 'last24h' },
    });
  }

  audit(): Observable<Array<{ id?: number; eventType?: string; correlationId?: string; traceId?: string; createdAt?: string; payload?: string; timestamp?: number }>> {
    return this.http.get<Array<{ id?: number; eventType?: string; correlationId?: string; traceId?: string; createdAt?: string; payload?: string; timestamp?: number }>>(this.endpoint(this.auditUrl, '/timeline'));
  }

  /**
   * Obtiene estadísticas de reportes basadas en reservas
   */
  getReportStats(): Observable<{
    totalBookings: number;
    averageCycleTime: number;
    topResources: Array<{ resourceId: number; resourceName: string; bookingCount: number }>;
    bookingsByStatus: Record<string, number>;
  }> {
    return this.bookings().pipe(
      map((bookings) => {
        // Total de reservas
        const totalBookings = bookings.length;

        // Calcular ciclo de tiempo promedio (diferencia entre endTime y startTime)
        let totalCycleTimeMinutes = 0;
        bookings.forEach((booking) => {
          const start = new Date(booking.startTime).getTime();
          const end = new Date(booking.endTime).getTime();
          const diffMinutes = (end - start) / (1000 * 60);
          totalCycleTimeMinutes += diffMinutes;
        });
        const averageCycleTime = bookings.length > 0 ? totalCycleTimeMinutes / bookings.length : 0;

        // Recursos más usados
        const resourceMap = new Map<number, { name: string; count: number }>();
        bookings.forEach((booking) => {
          const entry = resourceMap.get(booking.resourceId) || { name: booking.resourceName, count: 0 };
          entry.count++;
          resourceMap.set(booking.resourceId, entry);
        });

        const topResources = Array.from(resourceMap.entries())
          .map(([resourceId, data]) => ({
            resourceId,
            resourceName: data.name,
            bookingCount: data.count,
          }))
          .sort((a, b) => b.bookingCount - a.bookingCount)
          .slice(0, 5);

        // Agrupar por estado
        const bookingsByStatus: Record<string, number> = {};
        bookings.forEach((booking) => {
          const status = booking.status || 'UNKNOWN';
          bookingsByStatus[status] = (bookingsByStatus[status] || 0) + 1;
        });

        return {
          totalBookings,
          averageCycleTime,
          topResources,
          bookingsByStatus,
        };
      }),
      catchError(() => {
        return of({
          totalBookings: 0,
          averageCycleTime: 0,
          topResources: [],
          bookingsByStatus: {},
        });
      })
    );
  }

  /**
   * Obtiene eventos de auditoría con información de reservas
   */
  getAuditWithBookings(): Observable<Array<{
    id: string;
    user: string;
    timestamp: string;
    action: string;
    resourceName: string;
    status: string;
  }>> {
    return this.bookings().pipe(
      map((bookings) => {
        return bookings.map((booking, index) => ({
          id: `${booking.id}`,
          user: booking.studentId,
          timestamp: booking.createdAt || booking.startTime,
          action: `Reserva de ${booking.resourceName}`,
          resourceName: booking.resourceName,
          status: booking.status || 'UNKNOWN',
        }));
      }),
      catchError(() => {
        return of([]);
      })
    );
  }

  /**
   * Obtiene métricas del dashboard para rol Admin
   */
  getAdminMetrics(): Observable<{
    labOccupancy: number;
    bookingsToday: number;
    criticalResources: number;
  }> {
    return this.bookings().pipe(
      switchMap((bookings) => {
        return this.resources().pipe(
          map((resources) => {
            // Calcular ocupación de laboratorios
            const todayBookings = bookings.filter((b) => {
              const bookingDate = new Date(b.startTime);
              const today = new Date();
              return bookingDate.toDateString() === today.toDateString();
            });

            const confirmedToday = todayBookings.filter((b) => b.status === 'CONFIRMED').length;
            const totalSlots = Math.max(resources.length * 4, 1); // Asumir 4 slots por recurso
            const occupancy = Math.round((confirmedToday / totalSlots) * 100);

            return {
              labOccupancy: occupancy,
              bookingsToday: todayBookings.length,
              criticalResources: resources.filter((r) => r.availableStock === 0).length,
            };
          })
        );
      }),
      catchError(() => {
        return of({
          labOccupancy: 0,
          bookingsToday: 0,
          criticalResources: 0,
        });
      })
    );
  }

  /**
   * Obtiene métricas del dashboard para rol Técnico
   */
  getTechnicianMetrics(): Observable<{
    bookingsToPrepare: number;
    pendingEquipment: number;
    complianceRate: number;
  }> {
    return this.bookings().pipe(
      map((bookings) => {
        // Reservas para preparar (CONFIRMED que no han empezado)
        const now = new Date();
        const bookingsToPrepare = bookings.filter((b) => {
          const startTime = new Date(b.startTime);
          return b.status === 'CONFIRMED' && startTime > now;
        }).length;

        // Equipos pendientes (recursos sin stock)
        const pendingEquipment = bookings.filter((b) => b.status === 'PENDING').length;

        // Tasa de cumplimiento (reservas completadas / total)
        const completed = bookings.filter((b) => b.status === 'COMPLETED').length;
        const complianceRate = bookings.length > 0 ? Math.round((completed / bookings.length) * 100) : 0;

        return {
          bookingsToPrepare,
          pendingEquipment,
          complianceRate,
        };
      }),
      catchError(() => {
        return of({
          bookingsToPrepare: 0,
          pendingEquipment: 0,
          complianceRate: 0,
        });
      })
    );
  }

  /**
   * Obtiene métricas del dashboard para rol Estudiante
   */
  getStudentMetrics(studentId: string): Observable<{
    upcomingBookings: number;
    confirmedBookings: number;
    pendingBookings: number;
  }> {
    return this.bookings().pipe(
      map((bookings) => {
        // Filtrar por estudiante
        const studentBookings = bookings.filter((b) => b.studentId === studentId);

        // Próximas (futuras)
        const now = new Date();
        const upcoming = studentBookings.filter((b) => new Date(b.startTime) > now);

        // Por estado
        const confirmed = studentBookings.filter((b) => b.status === 'CONFIRMED');
        const pending = studentBookings.filter((b) => b.status === 'PENDING');

        return {
          upcomingBookings: upcoming.length,
          confirmedBookings: confirmed.length,
          pendingBookings: pending.length,
        };
      }),
      catchError(() => {
        return of({
          upcomingBookings: 0,
          confirmedBookings: 0,
          pendingBookings: 0,
        });
      })
    );
  }

  /**
   * Obtiene métricas del dashboard para rol Auditor
   */
  getAuditorMetrics(): Observable<{
    eventsReviewed: number;
    anomalies: number;
    incidencesClosed: number;
  }> {
    return this.getAuditWithBookings().pipe(
      map((events) => {
        // Total de eventos
        const eventsReviewed = events.length;

        // Anomalías (canceladas)
        const anomalies = events.filter((e) => e.status === 'CANCELLED').length;

        // Incidencias cerradas (completadas)
        const incidencesClosed = events.filter((e) => e.status === 'COMPLETED').length;
        const incidenceRate =
          events.length > 0 ? Math.round((incidencesClosed / events.length) * 100) : 0;

        return {
          eventsReviewed,
          anomalies,
          incidencesClosed: incidenceRate,
        };
      }),
      catchError(() => {
        return of({
          eventsReviewed: 0,
          anomalies: 0,
          incidencesClosed: 0,
        });
      })
    );
  }
}
