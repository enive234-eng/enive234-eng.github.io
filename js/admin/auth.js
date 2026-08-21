import { getClient, isConfigured } from "../supabase.js";
export const authConfigured = isConfigured;
export async function getAdminContext({ redirect = true } = {}) {
  if (!isConfigured) {
    if (redirect) location.replace("/admin/login.html?error=configuration");
    return null;
  }
  const client = await getClient();
  const {
    data: { session },
    error,
  } = await client.auth.getSession();
  if (error || !session) {
    if (redirect)
      location.replace(
        `/admin/login.html?next=${encodeURIComponent(location.pathname)}`,
      );
    return null;
  }
  const { data: admin, error: adminError } = await client
    .from("admins")
    .select("user_id,display_name")
    .eq("user_id", session.user.id)
    .maybeSingle();
  if (adminError || !admin) {
    await client.auth.signOut();
    if (redirect) location.replace("/admin/login.html?error=unauthorized");
    return null;
  }
  return { client, session, admin };
}
export async function signInAdmin(email, password) {
  if (!isConfigured)
    return { error: new Error("Supabase has not been configured yet.") };
  const client = await getClient();
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (error) return { error };
  const { data: admin, error: adminError } = await client
    .from("admins")
    .select("display_name")
    .eq("user_id", data.user.id)
    .maybeSingle();
  if (adminError || !admin) {
    await client.auth.signOut();
    return {
      error: new Error(
        "This account is not authorized to access ENIVÈ administration.",
      ),
    };
  }
  return { client, user: data.user, admin };
}
export async function sendRecoveryEmail(email) {
  if (!isConfigured)
    return { error: new Error("Supabase has not been configured yet.") };
  const client = await getClient();
  return client.auth.resetPasswordForEmail(email, {
    redirectTo: `${location.origin}/admin/reset-password.html`,
  });
}
