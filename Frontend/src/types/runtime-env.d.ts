export {};

declare global {
  var __env:
    | {
        ec2PublicHost?: string;
        apiScheme?: string;
        frontendPort?: string;

        apiCatalogUrl?: string;
        apiBookingsUrl?: string;
        apiReportUrl?: string;
        apiAuditUrl?: string;
        apiBaseUrl?: string;
      }
    | undefined;
}
