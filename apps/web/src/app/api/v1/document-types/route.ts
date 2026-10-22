import { authenticatedClient, requireMfa } from "@/lib/auth";
import { jsonInput, apiError } from "@/lib/http";
import { createType } from "@/lib/services/organizations";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const input = await jsonInput(request);
    const { client } = await authenticatedClient();
    await requireMfa(client);
    const id = await createType(client, input);
    return Response.json({ id }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
