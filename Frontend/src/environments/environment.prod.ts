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
const apiOrigin = globalThis.location?.origin ?? 'https://localhost';
const apiUrl = (port: string) => `${apiOrigin.replace(/:\d+$/, '')}:${port}/api/`;

export const environment = {
  production: true,
  apiCatalogUrl: runtime.apiCatalogUrl || apiUrl('8081'),
  apiBookingsUrl: runtime.apiBookingsUrl || apiUrl('8082'),
  apiReportUrl: runtime.apiReportUrl || apiUrl('8085'),
  apiAuditUrl: runtime.apiAuditUrl || apiUrl('8083'),
  azure: {
    clientId: 'e03479f6-d22d-4624-aa81-6e724d570329',
    tenantId: 'bda559f7-26d8-4062-88a2-da66f2286b5f',
    authority: 'https://login.microsoftonline.com/bda559f7-26d8-4062-88a2-da66f2286b5f',
    redirectUri: globalThis.location?.origin ?? 'https://localhost',
    postLogoutRedirectUri: globalThis.location?.origin ?? 'https://localhost',
    protectedResourceScopes: ['api://TU_API_ID_URI/TU_SCOPE'],
  },
  apiBaseUrl: runtime.apiBaseUrl || apiUrl('8080'),
};

export {};
