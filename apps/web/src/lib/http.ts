import { AccessError } from "./auth";
import { getConfiguration, isConfigured } from "./config";
import { z } from "zod";
export function assertSameOrigin(request: Request) {
  if (!isConfigured()) throw new AccessError(503, "SUPABASE_NOT_CONFIGURED");
  if (
    request.headers.get("origin") !== new URL(getConfiguration().APP_URL).origin
  )
    throw new AccessError(403, "ORIGIN_DENIED");
}
export async function jsonInput(request: Request) {
  assertSameOrigin(request);
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new AccessError(415, "JSON_REQUIRED");
  const text = await request.text();
  if (new TextEncoder().encode(text).length > 65536)
    throw new AccessError(413, "BODY_TOO_LARGE");
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new AccessError(400, "INVALID_JSON");
  }
}
export function apiError(error: unknown) {
  if (error instanceof AccessError)
    return Response.json(
      { error: error.code },
      { status: error.status, headers: { "Cache-Control": "no-store" } },
    );
  if (error instanceof z.ZodError)
    return Response.json({ error: "INVALID_INPUT" }, { status: 400 });
  // Never return raw database errors, SQL, user content or credentials.
  return Response.json({ error: "OPERATION_FAILED" }, { status: 400 });
}
