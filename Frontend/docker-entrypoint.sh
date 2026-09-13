#!/bin/sh
set -eu
cat > /app/dist/runtime-config.js <<EOF
window.__env = {
  apiCatalogUrl: "${API_CATALOG_URL:-}",
  apiBookingsUrl: "${API_BOOKINGS_URL:-}",
  apiReportUrl: "${API_REPORT_URL:-}",
  apiAuditUrl: "${API_AUDIT_URL:-}",
  apiBaseUrl: "${API_BASE_URL:-}"
};
EOF
exec node /app/server.js
