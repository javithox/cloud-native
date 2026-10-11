#!/bin/sh
set -eu

cat > /app/dist/runtime-config.js <<EOF
window.__env = {
  apiCatalogUrl: "${API_CATALOG_URL:-/api/catalog/}",
  apiBookingsUrl: "${API_BOOKINGS_URL:-/api/bookings/}",
  apiReportUrl: "${API_REPORT_URL:-/api/report/}",
  apiAuditUrl: "${API_AUDIT_URL:-/api/audit/}"
};
EOF

mkdir -p /app/dist/public
cp /app/dist/runtime-config.js /app/dist/public/runtime-config.js
exec node /app/server.js
