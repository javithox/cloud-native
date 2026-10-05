#!/bin/sh

set -e

cat > /usr/share/nginx/html/runtime-config.js <<EOF
window.__env = {
  apiCatalogUrl: "/api/catalog",
  apiBookingsUrl: "/api/bookings",
  apiReportUrl: "/api/report",
  apiAuditUrl: "/api/audit",
  apiBaseUrl: "/api"
};
EOF

echo "========================================="
echo "Runtime configuration:"
cat /usr/share/nginx/html/runtime-config.js
echo "========================================="

exec nginx -g "daemon off;"