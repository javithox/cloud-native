// src/environments/environment.prod.ts
export const environment = {
production: true,
azure: {
// ID de la aplicación (SPA) registrada en Microsoft Entra ID
// ID de la aplicación (SPA) registrada en Microsoft Entra ID
clientId: 'e03479f6-d22d-4624-aa81-6e724d570329',
// ID del tenant (directorio) donde se registró la app
tenantId: 'bda559f7-26d8-4062-88a2-da66f2286b5f',
authority: 'https://login.microsoftonline.com/bda559f7-26d8-4062-88a2-da66f2286b5f',
// En producción, redirectUri debe apuntar al dominio real de la SPA
redirectUri: 'https://mi-app.midominio.cl',
postLogoutRedirectUri: 'https://mi-app.midominio.cl',
protectedResourceScopes: ['api://TU_API_ID_URI/TU_SCOPE'],
},
apiBaseUrl: 'https://api.midominio.cl',
};