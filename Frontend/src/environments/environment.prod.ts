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

const runtime = globalThis.__env ?? {};

const ec2PublicHost =
  runtime.ec2PublicHost ||
  globalThis.location?.hostname ||
  '32.199.138.229:4200';

const apiScheme =
  runtime.apiScheme ||
  globalThis.location?.protocol.replace(':', '') ||
  'http';

const frontendPort =
  runtime.frontendPort ||
  globalThis.location?.port ||
  '4200';

const apiUrl = (port: string ) =>
  `${apiScheme}://${ec2PublicHost}:${port}/api/`;

const frontendOrigin =
  globalThis.location?.origin ||
  `${apiScheme}://${ec2PublicHost}:${frontendPort}`;

export const environment = {
  production: true,

  apiCatalogUrl:
    runtime.apiCatalogUrl || apiUrl('8081'),

  apiBookingsUrl:
    runtime.apiBookingsUrl || apiUrl('8082'),

  apiReportUrl:
    runtime.apiReportUrl || apiUrl('8085'),

  apiAuditUrl:
    runtime.apiAuditUrl || apiUrl('8083'),

  apiBaseUrl:
    runtime.apiBaseUrl || apiUrl('8080'),

  azure: {
    clientId:
      'e03479f6-d22d-4624-aa81-6e724d570329',

    tenantId:
      'bda559f7-26d8-4062-88a2-da66f2286b5f',

    authority:
      'https://login.microsoftonline.com/bda559f7-26d8-4062-88a2-da66f2286b5f',

    redirectUri:
      frontendOrigin,

    postLogoutRedirectUri:
      frontendOrigin,

    protectedResourceScopes: [
      'api://e03479f6-d22d-4624-aa81-6e724d570329/access_as_user',
    ],
  },
};

export {};
