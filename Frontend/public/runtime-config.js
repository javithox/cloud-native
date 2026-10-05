// Configuración para desarrollo local.
// En producción, docker-entrypoint.sh genera este archivo dinámicamente.
window.__env = {
  apiCatalogUrl: 'http://localhost:8081/api',
  apiBookingsUrl: 'http://localhost:8082/api',
  apiReportUrl: 'http://localhost:8085/api',
  apiAuditUrl: 'http://localhost:8083/api',
  apiBaseUrl: 'http://localhost:8080/api'
};
