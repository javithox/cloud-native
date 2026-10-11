import { describe, expect, it } from 'vitest';
import { msalInterceptorConfigFactory } from './msal.config';

describe('MSAL interceptor protected resources', () => {
  it('maps the exact bookings endpoint and nested endpoints to the API scope', () => {
    const config = msalInterceptorConfigFactory();
    const scopes = config.protectedResourceMap.get('http://localhost:8090/api/bookings');

    expect(scopes).toEqual([
      'api://00000000-0000-0000-0000-000000000000/archivos',
    ]);
    expect(config.protectedResourceMap.has('http://localhost:8090/api/bookings/*')).toBe(true);
  });
});
