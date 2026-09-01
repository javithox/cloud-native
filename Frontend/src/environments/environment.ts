export const environment = {
    production: false,

    azure: {
// ID de la aplicación (SPA) registrada en Microsoft Entra ID
clientId: 'e03479f6-d22d-4624-aa81-6e724d570329',
// ID del tenant (directorio) donde se registró la app
tenantId: 'bda559f7-26d8-4062-88a2-da66f2286b5f',
// Endpoint de autoridad: login.microsoftonline.com/<tenantId>
authority: 'https://login.microsoftonline.com/bda559f7-26d8-4062-88a2-da66f2286b5f',
// Debe coincidir EXACTAMENTE con el Redirect URI (tipo SPA) configurado en Entra ID
redirectUri: 'http://localhost:4200',
// URI a la que MSAL redirige después de cerrar sesión
postLogoutRedirectUri: 'http://localhost:4200',
// Solo si se consumirá una API propia protegida con scopes
protectedResourceScopes: ['api://TU_API_ID_URI/TU_SCOPE'],
},
// Solo si el frontend consume un backend propio
apiBaseUrl: 'http://localhost:8080',

};