import type { Configuration, PopupRequest } from "@azure/msal-browser";

const isDev = import.meta.env.MODE === "development";

export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${
      import.meta.env.VITE_AZURE_TENANT_ID
    }`,
    redirectUri: isDev
      ? "http://localhost:5173"
      : "https://todo-app-mu-ten-59.vercel.app",
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

const SHAREPOINT_TENANT = "nubiaville";

export const loginRequest: PopupRequest = {
  scopes: [
    `https://${SHAREPOINT_TENANT}.sharepoint.com/AllSites.Write`,
    // Alternative if you only need specific site:
    // `https://${SHAREPOINT_TENANT}.sharepoint.com/Sites.ReadWrite.All`
  ],
};

// For acquiring tokens later
export const sharepointScopes = {
  scopes: [`https://${SHAREPOINT_TENANT}.sharepoint.com/AllSites.Write`],
};

// export const loginRequest: PopupRequest = {
//   scopes: ["User.Read", "Sites.ReadWrite.All", "Files.ReadWrite.All"],
// };
