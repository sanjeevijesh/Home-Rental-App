// scripts/seed-super-admin.js
// Run ONCE: node scripts/seed-super-admin.js
// Creates a super_admin account in Supabase.

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const { createClient } = require("@supabase/supabase-js");

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY   // must be the service role key, not anon
);

const SUPER_ADMIN_EMAIL    = "admin@yourapp.com";   // ← change this
const SUPER_ADMIN_PASSWORD = "SuperSecret123!";     // ← change this

async function seed() {
  console.log("Creating super admin user...");

  // 1. Create the auth user
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: SUPER_ADMIN_EMAIL,
    password: SUPER_ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: { name: "Super Admin", role: "super_admin" },
  });

  if (error) {
    // If user already exists, just look them up
    if (error.message.includes("already")) {
      console.log("User already exists — updating role in profiles...");
      const { data: existing } = await supabaseAdmin.auth.admin.listUsers();
      const found = existing.users.find(u => u.email === SUPER_ADMIN_EMAIL);
      if (!found) { console.error("Could not find existing user."); process.exit(1); }
      await updateRole(found.id);
      return;
    }
    console.error("Auth error:", error.message);
    process.exit(1);
  }

  console.log("Auth user created:", data.user.id);
  await updateRole(data.user.id);
}

async function updateRole(userId) {
  // 2. Set role = 'super_admin' in the profiles table
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ role: "super_admin" })
    .eq("id", userId);

  if (error) {
    console.error("Failed to set role:", error.message);
    process.exit(1);
  }

  console.log("✅ Super admin ready!");
  console.log("   Email:   ", SUPER_ADMIN_EMAIL);
  console.log("   Password:", SUPER_ADMIN_PASSWORD);
}

seed();