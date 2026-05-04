"use server"

import { createServiceClient } from "@/lib/supabase/service"
import { createClient } from "@/lib/supabase/server"

// ─── Seller Key (owner_config) ────────────────────────────────────────────────

/**
 * Read the seller key from owner_config.
 * Uses service role to bypass the deny-all RLS policy.
 * Returns null if no row exists yet.
 */
export async function getSellerKey(): Promise<string | null> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from("owner_config")
    .select("seller_key")
    .eq("id", 1)
    .maybeSingle()

  if (error) {
    console.error("[actions] getSellerKey error:", error.message)
    return null
  }
  return data?.seller_key ?? null
}

/**
 * Upsert the seller key into owner_config.
 * Also stores the current authenticated user's UID as owner_uid (if logged in).
 */
export async function saveSellerKey(sellerKey: string): Promise<{ error: string | null }> {
  const supabase = createServiceClient()
  const authClient = await createClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()

  const { error } = await supabase.from("owner_config").upsert(
    {
      id: 1,
      seller_key: sellerKey,
      owner_uid: user?.id ?? null,
      configured_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  )

  if (error) {
    console.error("[actions] saveSellerKey error:", error.message)
    return { error: error.message }
  }
  return { error: null }
}

// ─── Redeem History ───────────────────────────────────────────────────────────

/**
 * Log a redemption attempt to redeem_history.
 * The row is inserted using the anon client so RLS applies (auth.uid() = user_id).
 */
export async function logRedemption(params: {
  appName: string
  licenseKey: string
  success: boolean
  message: string
}): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const { error } = await supabase.from("redeem_history").insert({
    user_id: user.id,
    app_name: params.appName,
    license_key: params.licenseKey,
    success: params.success,
    message: params.message,
  })

  if (error) {
    console.error("[actions] logRedemption error:", error.message)
    return { error: error.message }
  }
  return { error: null }
}
