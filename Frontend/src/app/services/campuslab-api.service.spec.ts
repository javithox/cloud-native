import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CampusLabApiService } from './campuslab-api.service';

describe('CampusLabApiService booking endpoints', () => {
  let service: CampusLabApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CampusLabApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('lists bookings using the Spring mapping without a trailing slash', () => {
    service.bookings().subscribe((bookings) => expect(bookings).toEqual([]));

    const request = httpMock.expectOne('http://localhost:8082/api/bookings');
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

    const request = httpMock.expectOne('http://localhost:8082/api/bookings');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({});
  });
});
