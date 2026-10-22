import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { parseConfiguration } from "./lib/config";
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const parsed = parseConfiguration(process.env);
  if (parsed.success) {
    const env = parsed.data;
    const client = createServerClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll(values, headers) {
            for (const { name, value } of values)
              request.cookies.set(name, value);
            response = NextResponse.next({ request });
            for (const { name, value, options } of values)
              response.cookies.set(name, value, options);
            for (const [key, value] of Object.entries(headers ?? {}))
              response.headers.set(key, value);
          },
        },
      },
    );
    await client.auth.getClaims();
  }
  response.headers.set("Cache-Control", "private, no-store");
  // Preserve Origin on same-site HTML form POSTs; no-referrer makes it null.
  // Cross-site navigation still receives no Referer.
  response.headers.set("Referrer-Policy", "same-origin");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  return response;
}
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
