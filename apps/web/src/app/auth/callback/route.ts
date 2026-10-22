import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getConfiguration, isConfigured } from "@/lib/config";
export const runtime = "nodejs";
export async function GET(request: Request) {
  if (!isConfigured())
    return NextResponse.redirect(
      new URL("/connexion?erreur=SUPABASE_NOT_CONFIGURED", request.url),
    );
  const origin = getConfiguration().APP_URL;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next =
    url.searchParams.get("next") === "/reinitialiser-mot-de-passe"
      ? "/reinitialiser-mot-de-passe"
      : "/configuration-2fa";
  if (code) {
    const client = await createClient();
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, origin));
  }
  return NextResponse.redirect(
    new URL("/connexion?erreur=CALLBACK_FAILED", origin),
  );
}
