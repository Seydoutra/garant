import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { isConfigured } from "./config";
export class AccessError extends Error {
  constructor(
    public status: number,
    public code: string,
  ) {
    super(code);
  }
}
export async function authenticatedClient() {
  if (!isConfigured()) throw new AccessError(503, "SUPABASE_NOT_CONFIGURED");
  const client = await createClient();
  const { data, error } = await client.auth.getUser();
  if (error || !data.user)
    throw new AccessError(401, "AUTHENTICATION_REQUIRED");
  const { data: active, error: sessionError } =
    await client.rpc("touch_session");
  if (sessionError) throw new AccessError(503, "DATABASE_UNAVAILABLE");
  if (!active) {
    await client.auth.signOut({ scope: "local" });
    throw new AccessError(401, "SESSION_EXPIRED");
  }
  return { client, user: data.user };
}
export async function pageSession() {
  try {
    return await authenticatedClient();
  } catch (error) {
    if (error instanceof AccessError)
      redirect(`/connexion?erreur=${error.code}`);
    throw error;
  }
}
export async function requireMfa(
  client: Awaited<ReturnType<typeof createClient>>,
) {
  const { data, error } =
    await client.auth.mfa.getAuthenticatorAssuranceLevel();
  if (error || data?.currentLevel !== "aal2")
    throw new AccessError(403, "MFA_REQUIRED");
}
