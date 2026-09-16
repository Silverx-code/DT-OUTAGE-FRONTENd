import {
  BrowserCacheLocation,
  Configuration,
  AccountInfo,
  InteractionRequiredAuthError,
  PublicClientApplication,
} from "@azure/msal-browser";

const clientId = process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID ?? "missing-client-id";
const tenantId = process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID ?? "common";
const redirectUri = process.env.NEXT_PUBLIC_AZURE_AD_REDIRECT_URI ?? "http://localhost:3000/login";
const apiScope = process.env.NEXT_PUBLIC_AZURE_AD_API_SCOPE ?? "";

const msalConfig: Configuration = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri,
    postLogoutRedirectUri: redirectUri,
  },
  cache: {
    cacheLocation: BrowserCacheLocation.LocalStorage,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);
let initializationPromise: Promise<AccountInfo | null> | null = null;

export async function initializeMsal() {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      await msalInstance.initialize();
      const response = await msalInstance.handleRedirectPromise();
      const account = response?.account ?? msalInstance.getAllAccounts()[0] ?? null;
      if (account) msalInstance.setActiveAccount(account);
      return account;
    })();
  }
  return initializationPromise;
}

export async function startLogin() {
  if (!process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID || !apiScope) {
    throw new Error("Microsoft Entra login is not configured. Set the Entra client ID and API scope.");
  }
  await msalInstance.loginRedirect({ scopes: ["openid", "profile", "email", apiScope] });
}

export async function getAccessToken(): Promise<string | null> {
  if (!apiScope) return null;
  await initializeMsal();
  const account = msalInstance.getActiveAccount() ?? msalInstance.getAllAccounts()[0];
  if (!account) return null;
  msalInstance.setActiveAccount(account);

  try {
    const result = await msalInstance.acquireTokenSilent({ account, scopes: [apiScope] });
    return result.accessToken;
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      await msalInstance.acquireTokenRedirect({ scopes: [apiScope] });
    }
    return null;
  }
}
