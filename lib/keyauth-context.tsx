"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getAppDetails, getStats, type AppDetails, type AppStats } from "./keyauth-api";
import { getSellerKey, saveSellerKey } from "./actions";

type UserRole = "owner" | "user" | null;

interface FlakeContextType {
  sellerKey: string;
  setSellerKey: (key: string) => void;
  isOwner: boolean;
  role: UserRole;
  setRole: (role: UserRole) => void;
  appDetails: AppDetails | null;
  stats: AppStats | null;
  isLoading: boolean;
  isVerifying: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  clearOwnerKey: () => void;
  // Legacy alias
  isConfigured: boolean;
}

const FlakeContext = createContext<FlakeContextType | undefined>(undefined);

export function KeyAuthProvider({ children }: { children: React.ReactNode }) {
  const [sellerKey, setSellerKeyState] = useState<string>("");
  const [role, setRoleState] = useState<UserRole>(null);
  const [appDetails, setAppDetails] = useState<AppDetails | null>(null);
  const [stats, setStats] = useState<AppStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwner = role === "owner";
  // isConfigured is true when we have a valid seller key (owner) OR a user has selected a role
  const isConfigured = isOwner;

  const setRole = useCallback((r: UserRole) => {
    setRoleState(r);
    if (typeof window !== "undefined") {
      if (r) {
        localStorage.setItem("flake_role", r);
      } else {
        localStorage.removeItem("flake_role");
      }
    }
  }, []);

  // The KeyAuth owner ID for Flake Services — only this owner gets full dashboard access
  const OWNER_ID = "Bv200ABmNA";

  const setSellerKey = useCallback(async (key: string) => {
    if (!key || key.trim().length < 5) {
      setError("Please enter a valid seller key.");
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const tempKey = key.trim();

      // Use "stats" first — it's the lightest call and doesn't 423
      const statsParams = new URLSearchParams({ sellerkey: tempKey, type: "stats" });
      const statsRes = await fetch(`/api/keyauth?${statsParams.toString()}`);
      const statsData = await statsRes.json();

      if (!statsData.success) {
        setError(statsData.message || "Invalid seller key. Please check and try again.");
        return;
      }

      // Now fetch app details to verify the owner ID
      const detailsParams = new URLSearchParams({ sellerkey: tempKey, type: "appdetails" });
      const detailsRes = await fetch(`/api/keyauth?${detailsParams.toString()}`);
      const detailsData = await detailsRes.json();

      const ownerMatches =
        detailsData.success &&
        detailsData.appdetails &&
        (detailsData.appdetails as AppDetails).ownerid === OWNER_ID;

      if (!ownerMatches) {
        setError("Owner ID mismatch. This seller key does not belong to the Flake Services owner account.");
        return;
      }

      setSellerKeyState(tempKey);
      setAppDetails(detailsData.appdetails as AppDetails);
      setRoleState("owner");
      setStats({
        totusers: statsData.totusers ?? "0",
        totalkeys: statsData.totalkeys ?? "0",
        onlineusers: statsData.onlineusers ?? "0",
        totalfiles: statsData.totalfiles ?? "0",
      });

      // Persist seller key to Supabase (service role bypasses RLS)
      saveSellerKey(tempKey).catch((err) =>
        console.error("[keyauth] failed to persist seller key:", err)
      );

      if (typeof window !== "undefined") {
        localStorage.setItem("flake_seller_key", tempKey);
        localStorage.setItem("flake_role", "owner");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify seller key.");
    } finally {
      setIsVerifying(false);
    }
  }, []);

  const clearOwnerKey = useCallback(() => {
    setSellerKeyState("");
    setRoleState(null);
    setAppDetails(null);
    setStats(null);
    setError(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("flake_seller_key");
      localStorage.removeItem("flake_role");
    }
  }, []);

  const refreshData = useCallback(async () => {
    if (!sellerKey || !isOwner) return;

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
        const s = statsRes as Record<string, unknown>;
        setStats({
          totusers: (s.totusers as string) || "0",
          totalkeys: (s.totalkeys as string) || "0",
          onlineusers: (s.onlineusers as string) || "0",
          totalfiles: (s.totalfiles as string) || "0",
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [sellerKey, isOwner]);

  // Restore session on mount — localStorage first, then fall back to Supabase DB
  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedKey = localStorage.getItem("flake_seller_key");
    const savedRole = localStorage.getItem("flake_role") as UserRole;

    if (savedKey && savedRole === "owner") {
      setSellerKeyState(savedKey);
      setRoleState("owner");
    } else if (savedRole === "user") {
      setRoleState("user");
    } else {
      // If no localStorage entry, try loading from DB (e.g. after clearing browser data)
      getSellerKey().then((dbKey) => {
        if (dbKey) {
          setSellerKeyState(dbKey);
          setRoleState("owner");
          localStorage.setItem("flake_seller_key", dbKey);
          localStorage.setItem("flake_role", "owner");
        }
      }).catch(() => {
        // DB unavailable — silently continue
      });
    }
  }, []);

  // Fetch data when seller key is restored from localStorage (not via setSellerKey)
  useEffect(() => {
    if (sellerKey && isOwner && !appDetails) {
      refreshData();
    }
  }, [sellerKey, isOwner, appDetails, refreshData]);

  return (
    <FlakeContext.Provider
      value={{
        sellerKey,
        setSellerKey,
        isOwner,
        role,
        setRole,
        appDetails,
        stats,
        isLoading,
        isVerifying,
        error,
        refreshData,
        clearOwnerKey,
        isConfigured,
      }}
    >
      {children}
    </FlakeContext.Provider>
  );
}

export function useKeyAuth() {
  const context = useContext(FlakeContext);
  if (context === undefined) {
    throw new Error("useKeyAuth must be used within a KeyAuthProvider");
  }
  return context;
}
