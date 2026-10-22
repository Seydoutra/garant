import { z } from "zod";
import { authenticatedClient, requireMfa } from "@/lib/auth";
import { jsonInput, apiError } from "@/lib/http";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const data = z
      .object({
        organizationId: z.uuid(),
        userId: z.uuid(),
        role: z.enum(["organization_admin", "approver", "issuer", "reader"]),
      })
      .parse(await jsonInput(request));
    const { client } = await authenticatedClient();
    await requireMfa(client);
    const result = await client.rpc("grant_membership", {
      p_org: data.organizationId,
      p_user: data.userId,
      p_role: data.role,
    });
    if (result.error) throw result.error;
    return Response.json({ ok: true, id: result.data });
  } catch (error) {
    return apiError(error);
  }
}
