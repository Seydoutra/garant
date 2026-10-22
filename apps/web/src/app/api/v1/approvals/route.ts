import { z } from "zod";
import { authenticatedClient, requireMfa } from "@/lib/auth";
import { jsonInput, apiError } from "@/lib/http";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const data = z
      .object({
        organizationId: z.uuid(),
        versionId: z.uuid(),
        expectedHash: z.string().regex(/^[a-f0-9]{64}$/),
      })
      .parse(await jsonInput(request));
    const { client } = await authenticatedClient();
    await requireMfa(client);
    const result = await client.rpc("approve_document", {
      p_org: data.organizationId,
      p_version: data.versionId,
      p_expected_hash: data.expectedHash,
    });
    if (result.error) throw result.error;
    return Response.json({ ok: true, id: result.data });
  } catch (error) {
    return apiError(error);
  }
}
