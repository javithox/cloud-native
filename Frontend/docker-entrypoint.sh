#!/bin/sh
set -eu

cat > /app/dist/runtime-config.js <<EOF
window.__env = {
  apiCatalogUrl: "${API_CATALOG_URL:-https://campuslab.ddns.net/api/catalog/}",
  apiBookingsUrl: "${API_BOOKINGS_URL:-https://campuslab.ddns.net/api/bookings/}",
  apiReportUrl: "${API_REPORT_URL:-https://campuslab.ddns.net/api/report/}",
  apiAuditUrl: "${API_AUDIT_URL:-https://campuslab.ddns.net/api/audit/}"
};
EOF

echo "Runtime configuration:"
cat /app/dist/runtime-config.js

exec node /app/server.js
