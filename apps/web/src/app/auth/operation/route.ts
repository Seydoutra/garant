import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getConfiguration, isConfigured } from "@/lib/config";
export const runtime = "nodejs";
const email = z.email().max(254);
const password = z.string().min(12).max(128);
export async function POST(request: Request) {
  const origin = isConfigured()
    ? new URL(getConfiguration().APP_URL).origin
    : new URL(request.url).origin;
  const go = (path: string) =>
    NextResponse.redirect(new URL(path, origin), 303);
  if (request.headers.get("origin") !== origin)
    return new Response("Origine refusée", { status: 403 });
  if (!isConfigured()) return go("/connexion?erreur=SUPABASE_NOT_CONFIGURED");
  if (Number(request.headers.get("content-length") ?? 0) > 8192)
    return new Response("Requête trop volumineuse", { status: 413 });
  const form = await request.formData();
  const operation = String(form.get("operation"));
  const client = await createClient();
  if (operation === "logout") {
    await client.rpc("end_session");
    await client.auth.signOut({ scope: "local" });
    return go("/connexion");
  }
  if (operation === "update-password") {
    const value = password.safeParse(form.get("password"));
    const { data } = await client.auth.getUser();
    if (!data.user || !value.success)
      return go("/reinitialiser-mot-de-passe?erreur=INVALID_INPUT");
    const { error } = await client.auth.updateUser({ password: value.data });
    if (error) return go("/reinitialiser-mot-de-passe?erreur=AUTH_FAILED");
    // Password recovery never bypasses MFA; require a fresh login afterwards.
    await client.rpc("end_session");
    await client.auth.signOut({ scope: "global" });
    return go("/connexion?message=PASSWORD_UPDATED");
  }
  const parsedEmail = email.safeParse(form.get("email"));
  if (!parsedEmail.success) return go("/connexion?erreur=INVALID_INPUT");
  if (operation === "reset") {
    await client.auth.resetPasswordForEmail(parsedEmail.data, {
      redirectTo: `${origin}/auth/callback?next=/reinitialiser-mot-de-passe`,
    });
    return go("/mot-de-passe-oublie?message=EMAIL_SENT");
  }
  const parsedPassword = password.safeParse(form.get("password"));
  if (!parsedPassword.success) return go("/connexion?erreur=INVALID_INPUT");
  if (operation === "signup") {
    await client.auth.signUp({
      email: parsedEmail.data,
      password: parsedPassword.data,
      options: { emailRedirectTo: `${origin}/auth/callback` },
    });
    // Same response for an existing account; no elevated membership on signup.
    return go("/inscription?message=EMAIL_SENT");
  }
  if (operation !== "login")
    return new Response("Opération inconnue", { status: 400 });
  const { error } = await client.auth.signInWithPassword({
    email: parsedEmail.data,
    password: parsedPassword.data,
  });
  if (error) return go("/connexion?erreur=AUTH_FAILED");
  const { data: active, error: dbError } = await client.rpc("touch_session");
  if (dbError || !active) return go("/connexion?erreur=DATABASE_UNAVAILABLE");
  return go("/configuration-2fa");
}
