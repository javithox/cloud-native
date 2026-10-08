import { describe, expect, it } from 'vitest';
import { msalInterceptorConfigFactory } from './msal.config';

describe('MSAL interceptor protected resources', () => {
  it('maps the exact bookings endpoint and nested endpoints to the API scope', () => {
    const config = msalInterceptorConfigFactory();
    const scopes = config.protectedResourceMap.get('http://localhost:8082/api/bookings');

    expect(scopes).toEqual([
      'api://e03479f6-d22d-4624-aa81-6e724d570329/archivos',
    ]);
    expect(config.protectedResourceMap.has('http://localhost:8082/api/bookings/*')).toBe(true);
  });
});
