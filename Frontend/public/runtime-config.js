// Configuración para desarrollo local.
// En producción, docker-entrypoint.sh genera este archivo dinámicamente.
window.__env = {
  apiCatalogUrl: 'http://localhost:8081/api/catalog',
  apiBookingsUrl: 'http://localhost:8082/api/bookings',
  apiReportUrl: 'http://localhost:8085/api/report',
  apiAuditUrl: 'http://localhost:8083/api/audit'
};
