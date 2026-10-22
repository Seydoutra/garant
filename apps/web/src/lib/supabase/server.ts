import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getConfiguration } from "../config";
// Per-request client. Never use a secret/service-role key in the user data path.
export async function createClient() {
  const env = getConfiguration();
  const store = await cookies();
  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll(values) {
          try {
            for (const { name, value, options } of values)
              store.set(name, value, options);
          } catch {
            /* Server Component: proxy handles refresh cookies before rendering. */
          }
        },
      },
    },
  );
}
