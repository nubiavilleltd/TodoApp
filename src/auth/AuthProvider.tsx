import React, { createContext, useContext, useEffect, useState } from "react";
import { PublicClientApplication } from "@azure/msal-browser";
import type { AccountInfo } from "@azure/msal-browser";
import { msalConfig, sharepointScopes } from "./msalConfig";

const msalInstance = new PublicClientApplication(msalConfig);

interface AuthContextType {
  account: AccountInfo | null;
  signIn: () => Promise<void>;
  signOut: () => void;
  getAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [account, setAccount] = useState<AccountInfo | null>(null);

  // Combine initialization and account check in ONE effect
  useEffect(() => {
    const init = async () => {
      try {
        // Initialize MSAL first
        await msalInstance.initialize();
        
        // Handle redirect promise (for redirect flow)
        await msalInstance.handleRedirectPromise();
        
        // NOW it's safe to check for existing accounts
        const currentAccounts = msalInstance.getAllAccounts();
        
        if (currentAccounts.length > 0) {
          // User is already logged in
          msalInstance.setActiveAccount(currentAccounts[0]);
          setAccount(currentAccounts[0]);
        } else {
          // No active account
          const activeAccount = msalInstance.getActiveAccount();
          setAccount(activeAccount);
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error("MSAL initialization failed:", error);
        setIsInitialized(true); // Still set to true to show UI
      }
    };
    
    init();
  }, []); // Run only once on mount

  const signIn = async () => {
    if (!isInitialized) {
      console.warn("MSAL not initialized yet. Please wait.");
      return;
    }
    try {
      const result = await msalInstance.loginPopup(sharepointScopes);
      msalInstance.setActiveAccount(result.account);
      setAccount(result.account);
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const signOut = () => {
    msalInstance.logoutPopup();
    setAccount(null);
  };

  const getAccessToken = async (): Promise<string | null> => {
    const activeAccount = msalInstance.getActiveAccount();
    if (!activeAccount) return null;

    try {
      const result = await msalInstance.acquireTokenSilent({
        ...sharepointScopes,
        account: activeAccount,
      });
      return result.accessToken;
    } catch (err) {
      console.error("Token acquisition failed:", err);
      // Try interactive login if silent fails
      try {
        const result = await msalInstance.acquireTokenPopup(sharepointScopes);
        return result.accessToken;
      } catch (popupErr) {
        console.error("Popup token acquisition failed:", popupErr);
        return null;
      }
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400">Loading authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ account, signIn, signOut, getAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};