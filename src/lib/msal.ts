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
      console.info("[auth] Initializing MSAL");
      await msalInstance.initialize();
      const response = await msalInstance.handleRedirectPromise();
      const account = response?.account ?? msalInstance.getAllAccounts()[0] ?? null;
      if (account) msalInstance.setActiveAccount(account);
      console.info("[auth] MSAL initialized", {
        authenticated: Boolean(account),
        account: account?.username ?? null,
        redirectResponse: Boolean(response),
      });
      return account;
    })();
  }
  return initializationPromise;
}

export async function startLogin() {
  if (!process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID || !apiScope) {
    throw new Error("Microsoft Entra login is not configured. Set the Entra client ID and API scope.");
  }
  console.info("[auth] Starting login redirect", { redirectUri, scopes: [apiScope] });
  await msalInstance.loginRedirect({
    scopes: ["openid", "profile", "email", "offline_access", apiScope],
    // The backend API's delegated scope is consented by the signed-in user
    // in this tenant. Prompting explicitly prevents a stale cached session
    // from silently returning only an ID token.
    prompt: "consent",
  });
}

export async function getAccessToken(): Promise<string | null> {
  if (!apiScope) {
    console.warn("[auth] Access token unavailable: API scope is not configured");
    return null;
  }
  await initializeMsal();
  const account = msalInstance.getActiveAccount() ?? msalInstance.getAllAccounts()[0];
  console.info("[auth] Checking authentication state", {
    authenticated: Boolean(account),
    account: account?.username ?? null,
  });
  if (!account) {
    console.warn("[auth] Access token unavailable: no signed-in account");
    return null;
  }
  msalInstance.setActiveAccount(account);

  try {
    const result = await msalInstance.acquireTokenSilent({ account, scopes: [apiScope] });
    console.info("[auth] Access token acquired silently", {
      authenticated: true,
      tokenAcquired: Boolean(result.accessToken),
      expiresOn: result.expiresOn?.toISOString() ?? null,
    });
    return result.accessToken;
  } catch (error) {
    console.warn("[auth] Silent access-token acquisition failed", {
      interactionRequired: error instanceof InteractionRequiredAuthError,
      error: error instanceof Error ? error.message : String(error),
    });
    // Do not start a redirect from an API request. The caller would otherwise
    // continue without a token, receive 401, and enter the login/dashboard loop.
    return null;
  }
}
