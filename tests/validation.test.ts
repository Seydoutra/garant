import { it, expect } from "vitest";
import {
  documentSchema,
  contentSchema,
  organizationSchema,
  starterTypes,
} from "../apps/web/src/lib/validation";
it("validates all three transversal starter models", () => {
  for (const type of starterTypes)
    expect(documentSchema.safeParse(type.schema).success).toBe(true);
});
it("rejects extra properties and missing required content", () => {
  const schema = contentSchema(documentSchema.parse(starterTypes[0].schema));
  expect(schema.safeParse({ subjectName: "A", statement: "B" }).success).toBe(
    true,
  );
  expect(schema.safeParse({ subjectName: "A" }).success).toBe(false);
  expect(
    schema.safeParse({ subjectName: "A", statement: "B", privateLeak: "x" })
      .success,
  ).toBe(false);
});
it("rejects invalid organization inputs", () => {
  expect(
    organizationSchema.safeParse({
      name: "X",
      category: "super_admin",
      country: "Guinée",
      city: "",
    }).success,
  ).toBe(false);
});
it("does not accept arbitrary executable schema fields", () => {
  expect(
    documentSchema.safeParse({
      fields: { script: { type: "function", required: true } },
    }).success,
  ).toBe(false);
});
