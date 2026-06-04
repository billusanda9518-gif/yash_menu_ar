const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const url = 'https://czdoacwauhvvsssyfpue.supabase.co';
const envContent = fs.readFileSync('/Users/yashfulkar/Documents/ar-menu/.env.local', 'utf8');
const anonMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);
const anonKey = anonMatch ? anonMatch[1].trim() : null;
const serviceMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);
const serviceRoleKey = serviceMatch ? serviceMatch[1].trim() : null;

if (!anonKey || !serviceRoleKey) {
  console.error("Missing keys!");
  process.exit(1);
}

const supabaseAdmin = createClient(url, serviceRoleKey);
const supabaseClient = createClient(url, anonKey);

async function run() {
  const email = `testuser_client_${Date.now()}@example.com`;
  const password = 'Password123!';

  console.log("Creating test user via Admin...");
  const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (createError) {
    console.error("Create user error:", createError);
    return;
  }

  const userId = userData.user.id;
  console.log("User created:", userId);

  console.log("Signing in via Client...");
  const { data: sessionData, error: loginError } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (loginError) {
    console.error("Login error:", loginError);
    return;
  }

  console.log("Login successful. Session user ID:", sessionData.user.id);

  console.log("Calling supabaseClient.auth.getUser()...");
  const uStart = Date.now();
  const { data: { user }, error: uErr } = await supabaseClient.auth.getUser();
  console.log(`getUser completed in ${Date.now() - uStart}ms. User:`, user ? user.email : "null", uErr || "");

  console.log("Querying menu_categories slug column using supabaseAdmin...");
  const { data: catData, error: catError } = await supabaseAdmin.from('menu_categories').select('slug').limit(1);
  console.log("menu_categories slug query result:", catData, catError || "Success");

  console.log("Querying dishes slug and model_ios_url columns using supabaseAdmin...");
  const { data: dishData, error: dishError } = await supabaseAdmin.from('dishes').select('slug, model_ios_url').limit(1);
  console.log("dishes columns query result:", dishData, dishError || "Success");

  // Cleanup
  console.log("Cleaning up test user...");
  await supabaseAdmin.auth.admin.deleteUser(userId);
  console.log("Cleanup done.");
}

run().catch(console.error);
