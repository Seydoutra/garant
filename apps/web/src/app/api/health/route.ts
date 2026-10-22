import { isConfigured } from "../../../lib/config";
export const runtime = "nodejs";
export function GET() {
  return Response.json(
    {
      service: "garant-web",
      configuration: isConfigured() ? "configured" : "missing",
      database: "not_probed",
      version: "v3-development",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
