declare global {
  var __env: {
    apiCatalogUrl?: string;
    apiBookingsUrl?: string;
    apiReportUrl?: string;
    apiAuditUrl?: string;
  } | undefined;
}

const runtime = globalThis.__env ?? {};
const origin = globalThis.location?.origin ?? 'https://campuslab.ddns.net';

export const environment = {
  production: true,

  apiCatalogUrl: runtime.apiCatalogUrl || `${origin}/api/catalog/`,
  apiBookingsUrl: runtime.apiBookingsUrl || `${origin}/api/bookings/`,
  apiReportUrl: runtime.apiReportUrl || `${origin}/api/report/`,
  apiAuditUrl: runtime.apiAuditUrl || `${origin}/api/audit/`,

  azure: {
    clientId: '00000000-0000-0000-0000-000000000000',
    tenantId: '00000000-0000-0000-0000-000000000000',
    authority: 'https://login.microsoftonline.com/00000000-0000-0000-0000-000000000000',
    redirectUri: globalThis.location?.origin ?? 'https://campuslab.ddns.net',
    postLogoutRedirectUri: globalThis.location?.origin ?? 'https://campuslab.ddns.net',
    protectedResourceScopes: [
      'api://00000000-0000-0000-0000-000000000000/archivos'
    ],
  },
};

export {};
