// ============================================================
// Supabase Edge Function: notify-on-new-property
// 
// Triggered by INSERT on the properties table via a database
// webhook configured in the Supabase Dashboard.
//
// Logic (Supabase-only, no Firebase):
// 1. Query tenants whose preferred_areas include the new property's area
//    AND whose budget range matches the new property's rent
// 2. Insert in-app alerts into the `alerts` table
// 3. Tenants receive these via Supabase Realtime on the frontend
// ============================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// These are set automatically in Supabase Edge Functions environment
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface PropertyPayload {
  id: string;
  title: string;
  area: string;
  rent: number;
  type: string;
  phone: string;
  owner_id: string;
  status: string;
}

interface Profile {
  id: string;
  preferred_areas: string[];
  budget_min: number;
  budget_max: number;
}

serve(async (req: Request) => {
  try {
    // Parse the webhook payload
    const payload = await req.json();
    
    // The payload structure from a database webhook:
    // { type: 'INSERT', table: 'properties', record: {...}, ... }
    const property: PropertyPayload = payload.record || payload;

    if (!property.area || !property.rent) {
      return new Response(
        JSON.stringify({ error: "Invalid property data" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role key (bypasses RLS)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // ── Step 1: Find matching tenants ──────────────────────
    // Query tenants whose:
    //   - role is 'tenant'
    //   - preferred_areas array contains the new property's area
    //   - budget range encompasses the property's rent
    const { data: matchingTenants, error: queryError } = await supabase
      .from("profiles")
      .select("id, preferred_areas, budget_min, budget_max")
      .eq("role", "tenant")
      .lte("budget_min", property.rent)
      .gte("budget_max", property.rent)
      .contains("preferred_areas", [property.area]);

    if (queryError) {
      console.error("Error querying tenants:", queryError);
      return new Response(
        JSON.stringify({ error: "Failed to query tenants", details: queryError }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!matchingTenants || matchingTenants.length === 0) {
      console.log(`No matching tenants found for property in ${property.area} at ₹${property.rent}`);
      return new Response(
        JSON.stringify({ message: "No matching tenants", notified: 0 }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${matchingTenants.length} matching tenants for ${property.area}`);

    // ── Step 2: Insert in-app alerts ──────────────────────
    // Create alert records for each matching tenant
    const alertRows = matchingTenants.map((tenant: Profile) => ({
      user_id: tenant.id,
      property_id: property.id,
      title: `🏠 New House in ${property.area}`,
      body: `${property.type || "Property"} for ₹${property.rent.toLocaleString("en-IN")} just posted`,
    }));

    const { data: alerts, error: insertError } = await supabase
      .from("alerts")
      .insert(alertRows)
      .select();

    if (insertError) {
      console.error("Error inserting alerts:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to create alerts", details: insertError }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const sentCount = alerts?.length || 0;
    console.log(`Created ${sentCount}/${matchingTenants.length} in-app alerts`);

    // Tenants will receive these alerts via Supabase Realtime
    // subscriptions on the frontend (no FCM needed!)

    return new Response(
      JSON.stringify({
        message: "Notifications processed",
        total: matchingTenants.length,
        sent: sentCount,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
