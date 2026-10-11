export const environment = {
  production: false,

  apiCatalogUrl: 'http://localhost:8090/api/catalog/',
  apiBookingsUrl: 'http://localhost:8090/api/bookings/',
  apiReportUrl: 'http://localhost:8090/api/report/',
  apiAuditUrl: 'http://localhost:8090/api/audit/',

  azure: {
    clientId: '00000000-0000-0000-0000-000000000000',
    tenantId: '00000000-0000-0000-0000-000000000000',
    authority: 'https://login.microsoftonline.com/00000000-0000-0000-0000-000000000000',
    redirectUri: 'http://localhost:4200',
    postLogoutRedirectUri: 'http://localhost:4200',
    protectedResourceScopes: [
      'api://00000000-0000-0000-0000-000000000000/archivos'
    ],
  }
};
