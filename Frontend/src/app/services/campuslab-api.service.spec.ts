import { TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { firstValueFrom } from 'rxjs';
import { CampusLabApiService } from './campuslab-api.service';

TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

describe('CampusLabApiService booking endpoints', () => {
  let service: CampusLabApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CampusLabApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('lists bookings using the Spring mapping without a trailing slash', () => {
    service.bookings().subscribe((bookings) => expect(bookings).toEqual([]));

    const request = httpMock.expectOne('http://localhost:8090/api/bookings');
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('creates a booking using the same Spring mapping without a trailing slash', () => {
    const payload = {
      studentId: 'S-1',
      studentEmail: 'student@example.test',
      resourceId: 1,
      startTime: '2099-12-10T09:00:00',
      endTime: '2099-12-10T11:00:00',
    };

    service.createBooking(payload).subscribe();

    const request = httpMock.expectOne('http://localhost:8090/api/bookings');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({});
  });

  it('derives a student id automatically when the UI does not send one', () => {
    service.createBooking({
      studentEmail: 'alice@example.test',
      resourceId: 3,
      startTime: '2099-12-12T09:00:00',
      endTime: '2099-12-12T10:00:00',
    }).subscribe();

    const request = httpMock.expectOne('http://localhost:8090/api/bookings');
    expect(request.request.method).toBe('POST');
    expect(request.request.body.studentId).toBe('alice');
    expect(request.request.body.studentEmail).toBe('alice@example.test');
    request.flush({});
  });

  it('builds audit events from the audit timeline, including error entries', async () => {
    const promise = firstValueFrom(service.getAuditWithBookings());

    const request = httpMock.expectOne('http://localhost:8090/api/audit/timeline');
    expect(request.request.method).toBe('GET');
    request.flush([
      {
        id: 1,
        eventType: 'RESOURCE_CREATED',
        eventId: 'evt-1',
        correlationId: 'corr-1',
        traceId: 'trace-1',
        timestamp: 1761979200000,
        payload: JSON.stringify({
          type: 'RESOURCE_CREATED',
          payload: {
            id: 10,
            name: 'Laboratorio 1',
            code: 'LAB-01',
            status: 'SUCCESS',
            details: 'Recurso creado correctamente',
            createdBy: 'student-42',
          },
        }),
      },
      {
        id: 2,
        eventType: 'BOOKING_CREATE_ERROR',
        eventId: 'evt-2',
        correlationId: 'corr-2',
        traceId: 'trace-2',
        timestamp: 1761979500000,
        payload: JSON.stringify({
          type: 'BOOKING_CREATE_ERROR',
          payload: {
            resourceName: 'Laboratorio 1',
            status: 'ERROR',
            details: 'La fecha de fin debe ser posterior a la fecha de inicio',
            user: 'system',
          },
        }),
      },
    ]);

    const events = await promise;

    expect(events).toEqual([
      {
        id: 'evt-1',
        user: 'student-42',
        timestamp: '2025-11-01T06:40:00.000Z',
        action: 'Recurso creado',
        resourceName: 'Laboratorio 1',
        status: 'SUCCESS',
        details: 'Recurso creado correctamente',
        category: 'RESOURCE',
        isError: false,
      },
      {
        id: 'evt-2',
        user: 'system',
        timestamp: '2025-11-01T06:45:00.000Z',
        action: 'Error al crear reserva',
        resourceName: 'Laboratorio 1',
        status: 'ERROR',
        details: 'La fecha de fin debe ser posterior a la fecha de inicio',
        category: 'BOOKING',
        isError: true,
      },
    ]);
  });
});
