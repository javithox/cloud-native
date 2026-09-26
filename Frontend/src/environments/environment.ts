declare global {
  var __env: {
    apiCatalogUrl?: string;
    apiBookingsUrl?: string;
    apiReportUrl?: string;
    apiAuditUrl?: string;
    apiBaseUrl?: string;
  } | undefined;
}

const runtime = globalThis.__env ?? {};
const apiOrigin = globalThis.location?.origin ?? 'http://localhost:4200';
const apiUrl = (port: string) => `${apiOrigin.replace(/:4200$/, `:${port}`)}/api/`;

export const environment = {
  production: true,
  apiCatalogUrl: runtime.apiCatalogUrl || apiUrl('8081'),
  apiBookingsUrl: runtime.apiBookingsUrl || apiUrl('8082'),
  apiReportUrl: runtime.apiReportUrl || apiUrl('8085'),
  apiAuditUrl: runtime.apiAuditUrl || apiUrl('8083'),
  apiUrl: runtime.apiBaseUrl || apiUrl('8080'),
  azure: {
    clientId: 'e03479f6-d22d-4624-aa81-6e724d570329',
    tenantId: 'bda559f7-26d8-4062-88a2-da66f2286b5f',
    authority: 'https://login.microsoftonline.com/bda559f7-26d8-4062-88a2-da66f2286b5f',
    redirectUri: globalThis.location?.origin ?? 'http://localhost:4200',
    postLogoutRedirectUri: globalThis.location?.origin ?? 'http://localhost:4200',
    protectedResourceScopes: ['api://e03479f6-d22d-4624-aa81-6e724d570329'],
  },
  apiBaseUrl: runtime.apiBaseUrl || apiUrl('8080'),
};

export {};
