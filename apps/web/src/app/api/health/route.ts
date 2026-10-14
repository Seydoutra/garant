import { parseShellConfiguration } from "../../../lib/config";
export const runtime = "nodejs";
export function GET() {
  parseShellConfiguration(process.env);
  return Response.json({
    service: "garant-web",
    mode: "shell",
    authentication: "not_implemented",
    database: "not_connected",
  });
}
