export const environment = {
  production: false,

  apiCatalogUrl: 'http://localhost:8081/api/catalog/',
  apiBookingsUrl: 'http://localhost:8082/api/bookings/',
  apiReportUrl: 'http://localhost:8085/api/report/',
  apiAuditUrl: 'http://localhost:8083/api/audit/',

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
