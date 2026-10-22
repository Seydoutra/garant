import { z } from "zod";
export const credentialsSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(12).max(128),
});
export const organizationSchema = z.object({
  name: z.string().trim().min(2).max(180),
  acronym: z.string().trim().max(30).default(""),
  category: z.enum(["public", "private", "association", "other"]),
  country: z.string().regex(/^[A-Z]{2}$/),
  city: z.string().trim().min(1).max(120),
});
export const documentSchema = z.object({
  fields: z
    .record(
      z.string().regex(/^[a-z][a-zA-Z0-9_]{0,59}$/),
      z.object({ type: z.literal("string"), required: z.boolean() }),
    )
    .refine(
      (fields) =>
        Object.keys(fields).length > 0 && Object.keys(fields).length <= 30,
    ),
});
export const starterTypes = [
  {
    code: "attestation",
    name: "Attestation nominative",
    schema: {
      fields: {
        subjectName: { type: "string", required: true },
        statement: { type: "string", required: true },
      },
    },
  },
  {
    code: "lettre",
    name: "Lettre officielle",
    schema: {
      fields: {
        recipient: { type: "string", required: true },
        subject: { type: "string", required: true },
        body: { type: "string", required: true },
      },
    },
  },
  {
    code: "rapport",
    name: "Rapport technique avec annexe",
    schema: {
      fields: {
        project: { type: "string", required: true },
        findings: { type: "string", required: true },
        annexReference: { type: "string", required: true },
      },
    },
  },
] as const;
export function contentSchema(schema: z.infer<typeof documentSchema>) {
  const fields = Object.fromEntries(
    Object.entries(schema.fields).map(([key, spec]) => [
      key,
      spec.required
        ? z.string().trim().min(1).max(5000)
        : z.string().max(5000).optional(),
    ]),
  );
  return z.object(fields).strict();
}
