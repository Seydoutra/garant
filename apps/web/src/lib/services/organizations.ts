import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  organizationSchema,
  documentSchema,
  contentSchema,
} from "../validation";
export async function createOrganization(
  client: SupabaseClient,
  input: unknown,
) {
  const data = organizationSchema.parse(input);
  const result = await client.rpc("create_organization", {
    p_name: data.name,
    p_acronym: data.acronym,
    p_category: data.category,
    p_country: data.country,
    p_city: data.city,
  });
  if (result.error) throw result.error;
  return result.data as string;
}
export async function createType(client: SupabaseClient, input: unknown) {
  const data = z
    .object({
      organizationId: z.uuid(),
      code: z.string().regex(/^[a-z][a-z0-9_-]{1,60}$/),
      name: z.string().min(2).max(180),
      schema: documentSchema,
      confidentiality: z.enum(["private", "public_summary"]).default("private"),
    })
    .parse(input);
  const result = await client.rpc("create_document_type", {
    p_org: data.organizationId,
    p_code: data.code,
    p_name: data.name,
    p_schema: data.schema,
    p_confidentiality: data.confidentiality,
  });
  if (result.error) throw result.error;
  return result.data as string;
}
export async function createDraft(client: SupabaseClient, input: unknown) {
  const data = z
    .object({
      organizationId: z.uuid(),
      typeVersionId: z.uuid(),
      reference: z.string().trim().min(1).max(160),
      content: z.record(z.string(), z.unknown()),
    })
    .parse(input);
  const { data: type, error } = await client
    .from("document_type_versions")
    .select("schema")
    .eq("id", data.typeVersionId)
    .eq("organization_id", data.organizationId)
    .single();
  if (error || !type) throw Error("TYPE_UNAVAILABLE");
  const content = contentSchema(documentSchema.parse(type.schema)).parse(
    data.content,
  );
  const result = await client.rpc("create_draft", {
    p_org: data.organizationId,
    p_type_version: data.typeVersionId,
    p_reference: data.reference,
    p_content: content,
  });
  if (result.error) throw result.error;
  return result.data as string;
}
