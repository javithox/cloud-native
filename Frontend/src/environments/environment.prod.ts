const runtime = globalThis.__env ?? {};

const apiScheme =
  runtime.apiScheme ||
  globalThis.location?.protocol.replace(':', '') ||
  'http';

const ec2PublicHost =
  runtime.ec2PublicHost ||
  globalThis.location?.hostname ||
  'localhost';

const frontendPort =
  runtime.frontendPort ||
  globalThis.location?.port ||
  '4200';

const apiUrl = (port: string) =>
  `${apiScheme}://${ec2PublicHost}:${port}/api/`;

const frontendOrigin =
  globalThis.location?.origin ||
  `${apiScheme}://${ec2PublicHost}:${frontendPort}`;

export const environment = {
  production: false,

  apiCatalogUrl:
    runtime.apiCatalogUrl ||
    'http://localhost:8081/api/',

  apiBookingsUrl:
    runtime.apiBookingsUrl ||
    'http://localhost:8082/api/',

  apiReportUrl:
    runtime.apiReportUrl ||
    'http://localhost:8085/api/',

  apiAuditUrl:
    runtime.apiAuditUrl ||
    'http://localhost:8083/api/',

  apiBaseUrl:
    runtime.apiBaseUrl ||
    'http://localhost:8080',

  apiUrl:
    'https://<TU_API_GATEWAY_ID>.execute-api.us-east-1.amazonaws.com/api',

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