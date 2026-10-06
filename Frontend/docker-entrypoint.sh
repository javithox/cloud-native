#!/bin/sh
set -eu

# Genera la configuración de tiempo de ejecución para Angular
cat > /app/dist/runtime-config.js <<EOF
window.__env = {
  apiCatalogUrl: "${API_CATALOG_URL:-http://localhost:8081/api/catalog:-https://campuslab.ddns.net/api/catalog}",
  apiBookingsUrl: "${API_BOOKINGS_URL:-http://localhost:8082/api/bookings:-https://campuslab.ddns.net/api/bookings}",
  apiReportUrl: "${API_REPORT_URL:-http://localhost:8083/api/report:-https://campuslab.ddns.net/api/report}",
  apiAuditUrl: "${API_AUDIT_URL:-http://localhost:8084/api/audit:-https://campuslab.ddns.net/api/audit}"
};
EOF

# Copia de respaldo por si el servidor estático busca en subcarpetas
mkdir -p /app/dist/public
cp /app/dist/runtime-config.js /app/dist/public/runtime-config.js

echo "Configuración en tiempo de ejecución generada correctamente:"
cat /app/dist/runtime-config.js

exec node /app/server.js