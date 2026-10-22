"use client";

import { useEffect } from "react";

// Dashboard invitations use an implicit fragment, unlike our PKCE signup links.
// Fragments never reach the server, so exchange them for SSR cookies here.
export function EmailLinkSession() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const access = params.get("access_token");
    const refresh = params.get("refresh_token");
    const type = params.get("type");
    if (!access && !refresh && !params.has("error")) return;
    // Remove bearer tokens from browser history before any asynchronous work.
    window.history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );
    const fail = () =>
      window.location.replace("/connexion?erreur=CALLBACK_FAILED");
    if (
      !access ||
      !refresh ||
      !["invite", "recovery", "signup", "magiclink"].includes(type ?? "")
    ) {
      fail();
      return;
    }
    void (async () => {
      try {
        const { createBrowserClient } = await import("@supabase/ssr");
        const client = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
          { auth: { detectSessionInUrl: false } },
        );
        const { error } = await client.auth.setSession({
          access_token: access,
          refresh_token: refresh,
        });
        if (error) return fail();
        const { data, error: userError } = await client.auth.getUser();
        if (userError || !data.user) return fail();
        window.location.replace(
          type === "invite" || type === "recovery"
            ? "/reinitialiser-mot-de-passe"
            : "/configuration-2fa",
        );
      } catch {
        fail();
      }
    })();
  }, []);
  return null;
}
