import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  jsonb,
  boolean,
  unique,
  index,
  foreignKey,
} from "drizzle-orm/pg-core";
// Initial core projection. SQL migrations remain authoritative for RPCs, grants and RLS.
export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  acronym: text("acronym").notNull().default(""),
  category: text("category").notNull(),
  country: text("country").notNull().default("GN"),
  city: text("city").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
export const documentTypes = pgTable(
  "document_types",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id),
    code: text("code").notNull(),
    name: text("name").notNull(),
  },
  (t) => [
    unique().on(t.organizationId, t.id),
    unique().on(t.organizationId, t.code),
  ],
);
export const documentTypeVersions = pgTable(
  "document_type_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id").notNull(),
    documentTypeId: uuid("document_type_id").notNull(),
    version: integer("version").notNull(),
    schema: jsonb("schema").notNull(),
    confidentiality: text("confidentiality").notNull(),
    photoRequired: boolean("photo_required").notNull().default(false),
    approvalRequired: boolean("approval_required").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique().on(t.organizationId, t.id),
    unique().on(t.documentTypeId, t.version),
    foreignKey({
      columns: [t.organizationId, t.documentTypeId],
      foreignColumns: [documentTypes.organizationId, documentTypes.id],
    }),
    index().on(t.organizationId, t.documentTypeId),
  ],
);
export const documents = pgTable(
  "documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id),
    documentTypeId: uuid("document_type_id").notNull(),
    reference: text("reference").notNull(),
    createdBy: uuid("created_by").notNull(),
    unitId: uuid("unit_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique().on(t.organizationId, t.id),
    unique().on(t.organizationId, t.reference),
    foreignKey({
      columns: [t.organizationId, t.documentTypeId],
      foreignColumns: [documentTypes.organizationId, documentTypes.id],
    }),
    index().on(t.organizationId, t.documentTypeId),
    index().on(t.createdBy),
  ],
);
export const documentVersions = pgTable(
  "document_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id").notNull(),
    documentId: uuid("document_id").notNull(),
    typeVersionId: uuid("type_version_id").notNull(),
    version: integer("version").notNull(),
    content: jsonb("content").notNull(),
    contentHash: text("content_hash").notNull(),
    state: text("state").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique().on(t.organizationId, t.id),
    unique().on(t.documentId, t.version),
    foreignKey({
      columns: [t.organizationId, t.documentId],
      foreignColumns: [documents.organizationId, documents.id],
    }),
    foreignKey({
      columns: [t.organizationId, t.typeVersionId],
      foreignColumns: [
        documentTypeVersions.organizationId,
        documentTypeVersions.id,
      ],
    }),
    index().on(t.organizationId, t.documentId),
    index().on(t.organizationId, t.typeVersionId),
  ],
);
