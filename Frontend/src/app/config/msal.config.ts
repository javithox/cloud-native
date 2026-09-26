import {
  BrowserCacheLocation,
  InteractionType,
  LogLevel,
  PublicClientApplication
} from '@azure/msal-browser';

import {
  MsalGuardConfiguration,
  MsalInterceptorConfiguration
} from '@azure/msal-angular';

import { environment } from '../../environments/environment';

export function msalInstanceFactory(): PublicClientApplication {
  if (typeof window === 'undefined') {
    return {
      getAllAccounts: () => [],
      getActiveAccount: () => null,
      setActiveAccount: () => undefined,
      loginRedirect: () => Promise.resolve(),
      logoutRedirect: () => Promise.resolve(),
    } as unknown as PublicClientApplication;
  }

  return new PublicClientApplication({
    auth: {
      clientId: environment.azure.clientId,
      authority: environment.azure.authority,
      redirectUri: environment.azure.redirectUri,
      postLogoutRedirectUri: environment.azure.postLogoutRedirectUri
    },

    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage
    },

    system: {
      loggerOptions: {
        loggerCallback: (level, message, containsPii) => {
          if (containsPii) {
            return;
          }

          switch (level) {
            case LogLevel.Error:
              console.error(message);
              return;

            case LogLevel.Warning:
              console.warn(message);
              return;

            default:
              return;
          }
        },

        logLevel: environment.production
          ? LogLevel.Error
          : LogLevel.Warning,

        piiLoggingEnabled: false
      }
    }
  });
}

export function msalGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,

    authRequest: {
      scopes: ['User.Read']
    },

    loginFailedRoute: '/login-failed'
  };
}

export function msalInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap =
    new Map<string, Array<string> | null>();

  const protectedResources = [
    environment.apiBaseUrl,
    environment.apiCatalogUrl,
    environment.apiBookingsUrl,
    environment.apiReportUrl,
    environment.apiAuditUrl,
  ];
  for (const resource of protectedResources) {
    protectedResourceMap.set(
      `${resource.replace(/\/$/, '')}/*`,
      environment.azure.protectedResourceScopes
    );
  }

  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap
  };
}
