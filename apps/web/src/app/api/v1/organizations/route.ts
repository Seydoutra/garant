import { authenticatedClient, requireMfa } from "@/lib/auth";
import { jsonInput, apiError } from "@/lib/http";
import { createOrganization } from "@/lib/services/organizations";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const input = await jsonInput(request);
    const { client } = await authenticatedClient();
    await requireMfa(client);
    const id = await createOrganization(client, input);
    return Response.json({ id }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
export async function GET() {
  try {
    const { client } = await authenticatedClient();
    await requireMfa(client);
    const result = await client
      .from("organizations")
      .select("id,name,status")
      .order("name");
    if (result.error) throw result.error;
    return Response.json(
      { organizations: result.data },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return apiError(error);
  }
}
