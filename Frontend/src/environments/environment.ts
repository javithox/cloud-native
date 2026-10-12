declare global {
  var __env: {
    apiCatalogUrl?: string;
    apiBookingsUrl?: string;
    apiReportUrl?: string;
    apiAuditUrl?: string;
  } | undefined;
}

const runtime = globalThis.__env ?? {};
const origin = globalThis.location?.origin ?? 'https://localhost:4200';

export const environment = {
  production: false,

  apiCatalogUrl: 'http://localhost:8090/api/catalog/',
  apiBookingsUrl: 'http://localhost:8090/api/bookings/',
  apiReportUrl: 'http://localhost:8090/api/report/',
  apiAuditUrl: 'http://localhost:8090/api/audit/',

  azure: {
    clientId: 'e03479f6-d22d-4624-aa81-6e724d570329',
    tenantId: 'bda559f7-26d8-4062-88a2-da66f2286b5f',
    authority: 'https://login.microsoftonline.com/bda559f7-26d8-4062-88a2-da66f2286b5f',
    redirectUri: 'http://localhost:4200',
    postLogoutRedirectUri: 'http://localhost:4200',
    protectedResourceScopes: [
      'api://e03479f6-d22d-4624-aa81-6e724d570329/archivos'
    ],
  }
};
