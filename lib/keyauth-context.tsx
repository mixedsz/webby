"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getAppDetails, getStats, type AppDetails, type AppStats } from "./keyauth-api";

interface KeyAuthContextType {
  sellerKey: string;
  setSellerKey: (key: string) => void;
  isConfigured: boolean;
  appDetails: AppDetails | null;
  stats: AppStats | null;
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

const KeyAuthContext = createContext<KeyAuthContextType | undefined>(undefined);

export function KeyAuthProvider({ children }: { children: React.ReactNode }) {
  const [sellerKey, setSellerKeyState] = useState<string>("");
  const [appDetails, setAppDetails] = useState<AppDetails | null>(null);
  const [stats, setStats] = useState<AppStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConfigured = sellerKey.length === 32;

  const setSellerKey = useCallback((key: string) => {
    setSellerKeyState(key);
    if (typeof window !== "undefined") {
      localStorage.setItem("keyauth_seller_key", key);
    }
  }, []);

  const refreshData = useCallback(async () => {
    if (!isConfigured) return;

    setIsLoading(true);
    setError(null);

    try {
      const [detailsRes, statsRes] = await Promise.all([
        getAppDetails(sellerKey),
        getStats(sellerKey),
      ]);

      if (detailsRes.success && detailsRes.appdetails) {
        setAppDetails(detailsRes.appdetails as AppDetails);
      } else {
        setError(detailsRes.message || "Failed to fetch app details");
      }

      if (statsRes.success) {
        setStats({
          totusers: (statsRes as Record<string, unknown>).totusers as string || "0",
          totalkeys: (statsRes as Record<string, unknown>).totalkeys as string || "0",
          onlineusers: (statsRes as Record<string, unknown>).onlineusers as string || "0",
          totalfiles: (statsRes as Record<string, unknown>).totalfiles as string || "0",
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [sellerKey, isConfigured]);

  // Load seller key from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedKey = localStorage.getItem("keyauth_seller_key");
      if (savedKey) {
        setSellerKeyState(savedKey);
      }
    }
  }, []);

  // Fetch data when seller key changes
  useEffect(() => {
    if (isConfigured) {
      refreshData();
    }
  }, [isConfigured, refreshData]);

  return (
    <KeyAuthContext.Provider
      value={{
        sellerKey,
        setSellerKey,
        isConfigured,
        appDetails,
        stats,
        isLoading,
        error,
        refreshData,
      }}
    >
      {children}
    </KeyAuthContext.Provider>
  );
}

export function useKeyAuth() {
  const context = useContext(KeyAuthContext);
  if (context === undefined) {
    throw new Error("useKeyAuth must be used within a KeyAuthProvider");
  }
  return context;
}
