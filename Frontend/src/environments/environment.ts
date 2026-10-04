declare global {
  var __env: {
    apiCatalogUrl?: string;
    apiBookingsUrl?: string;
    apiReportUrl?: string;
    apiAuditUrl?: string;
    apiBaseUrl?: string;
  } | undefined;
}

const runtime = globalThis.__env ?? {};

// Construye la URL respetando el protocolo actual (http/https) y el dominio (campuslab.ddns.net)
const getApiUrl = (port: string): string => {
  if (typeof window === 'undefined' || !globalThis.location?.hostname) {
    return `https://campuslab.ddns.net:${port}/api`;
  }

  const protocol = globalThis.location.protocol; // 'https:' o 'http:'
  const hostname = globalThis.location.hostname; // 'campuslab.ddns.net' o 'localhost'

  return `${protocol}//${hostname}:${port}/api`;
};

export const environment = {
  production: true,
  apiCatalogUrl: runtime.apiCatalogUrl || getApiUrl('8081'),
  apiBookingsUrl: runtime.apiBookingsUrl || getApiUrl('8082'),
  apiAuditUrl: runtime.apiAuditUrl || getApiUrl('8083'),
  apiReportUrl: runtime.apiReportUrl || getApiUrl('8085'),
  apiBaseUrl: runtime.apiBaseUrl || getApiUrl('8082'),
  azure: {
    clientId: 'e03479f6-d22d-4624-aa81-6e724d570329',
    tenantId: 'bda559f7-26d8-4062-88a2-da66f2286b5f',
    authority: 'https://login.microsoftonline.com/bda559f7-26d8-4062-88a2-da66f2286b5f',
    redirectUri: typeof window !== 'undefined' ? globalThis.location.origin : 'https://campuslab.ddns.net/',
    postLogoutRedirectUri: typeof window !== 'undefined' ? globalThis.location.origin : 'https://campuslab.ddns.net/',
    protectedResourceScopes: ['api://e03479f6-d22d-4624-aa81-6e724d570329/archivos'],
  }
};

export {};