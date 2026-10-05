#!/bin/sh

set -e

cat > /app/dist/runtime-config.js <<EOF
window.__env = {
  apiCatalogUrl: "${API_CATALOG_URL:-http://localhost:8081/api}",
  apiBookingsUrl: "${API_BOOKINGS_URL:-http://localhost:8082/api}",
  apiReportUrl: "${API_REPORT_URL:-http://localhost:8085/api}",
  apiAuditUrl: "${API_AUDIT_URL:-http://localhost:8083/api}",
  apiBaseUrl: "${API_BASE_URL:-http://localhost:8082/api}"
};
EOF

echo "========================================="
echo "Runtime configuration:"
cat /app/dist/runtime-config.js
echo "========================================="

exec node /app/server.js