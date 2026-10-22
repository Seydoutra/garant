import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFile, readdir } from "node:fs/promises";
const ids = {
  admin: "10000000-0000-4000-8000-000000000001",
  alice: "10000000-0000-4000-8000-000000000002",
  bob: "10000000-0000-4000-8000-000000000003",
  approver: "10000000-0000-4000-8000-000000000004",
  outsider: "10000000-0000-4000-8000-000000000005",
};
const sessions = Object.fromEntries(
  Object.entries(ids).map(([key, id]) => [
    key,
    id.replace("10000000", "20000000"),
  ]),
);
let db: PGlite;
let orgA: string;
let orgB: string;
let typeA: string;
let tvA: string;
let versionA: string;
const schema = { fields: { subject: { type: "string", required: true } } };
async function value<T>(sql: string, params: unknown[] = []) {
  const r = await db.query<Record<string, T>>(sql, params);
  return Object.values(r.rows[0] ?? {})[0] as T;
}
async function login(key: keyof typeof ids, aal = "aal2", age = 0) {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claims',$1,false)", [
    JSON.stringify({
      sub: ids[key],
      session_id: sessions[key],
      aal,
      amr: [{ method: "totp", timestamp: Math.floor(Date.now() / 1000) - age }],
    }),
  ]);
  await db.exec("set role authenticated");
  return value<boolean>("select public.touch_session()");
}
beforeAll(async () => {
  db = new PGlite();
  await db.exec(await readFile("tests/database/prelude.sql", "utf8"));
  for (const file of (await readdir("supabase/migrations"))
    .filter((f) => f.endsWith(".sql"))
    .sort())
    await db.exec(await readFile(`supabase/migrations/${file}`, "utf8"));
  for (const [key, id] of Object.entries(ids)) {
    await db.query("insert into auth.users values($1,now())", [id]);
    await db.query("insert into auth.sessions values($1,$2)", [
      sessions[key],
      id,
    ]);
  }
  await db.query("insert into private.platform_admins(user_id) values($1)", [
    ids.admin,
  ]);
  await login("admin");
  orgA = await value(
    "select public.create_organization('Organisation A','A','private','GN','Conakry')",
  );
  orgB = await value(
    "select public.create_organization('Organisation B','B','public','GN','Labé')",
  );
  await db.query("select public.grant_membership($1,$2,'issuer')", [
    orgA,
    ids.alice,
  ]);
  await db.query("select public.grant_membership($1,$2,'issuer')", [
    orgB,
    ids.bob,
  ]);
  await db.query("select public.grant_membership($1,$2,'approver')", [
    orgA,
    ids.approver,
  ]);
  typeA = await value(
    "select public.create_document_type($1,'attestation','Attestation',$2)",
    [orgA, schema],
  );
  tvA = await value(
    "select id from public.document_type_versions where document_type_id=$1",
    [typeA],
  );
  await login("alice");
  versionA = await value("select public.create_draft($1,$2,'A-001',$3)", [
    orgA,
    tvA,
    { subject: "Projet de démonstration" },
  ]);
  await db.exec("reset role");
  await db.query(
    "insert into public.document_attachments(organization_id,version_id,bucket_id,object_path,sha256,mime_type,size_bytes) values($1,$2,'document-attachments',$3,$4,'application/pdf',100)",
    [orgA, versionA, `${orgA}/${versionA}/annexe.pdf`, "a".repeat(64)],
  );
  await db.query(
    "insert into storage.objects(bucket_id,name) values('document-attachments',$1)",
    [`${orgA}/${versionA}/annexe.pdf`],
  );
}, 60000);
afterAll(async () => {
  await db?.close();
});
describe("PostgreSQL réel isolé : permissions, RLS, versions", () => {
  it("uses an authenticated non-owner without BYPASSRLS", async () => {
    await login("alice");
    expect(await value("select current_user")).toBe("authenticated");
    expect(
      await value(
        "select rolbypassrls from pg_roles where rolname=current_user",
      ),
    ).toBe(false);
  });
  it("allows A to read only its document", async () => {
    await login("alice");
    expect(
      await value<number>("select count(*)::int from public.documents"),
    ).toBe(1);
  });
  it("denies private document reads before MFA", async () => {
    await login("alice", "aal1");
    expect(await value("select count(*)::int from public.documents")).toBe(0);
  });
  it("prevents B reading A", async () => {
    await login("bob");
    expect(
      await value<number>(
        "select count(*)::int from public.document_versions where id=$1",
        [versionA],
      ),
    ).toBe(0);
  });
  it("prevents B preparing a document for A through a definer RPC", async () => {
    await login("bob");
    await expect(
      db.query("select public.create_draft($1,$2,'ATTACK',$3)", [
        orgA,
        tvA,
        { subject: "Intrusion" },
      ]),
    ).rejects.toThrow(/refusé/i);
  });
  it("allows only A to read linked private file metadata", async () => {
    await login("alice");
    expect(await value("select count(*)::int from storage.objects")).toBe(1);
    await login("bob");
    expect(await value("select count(*)::int from storage.objects")).toBe(0);
  });
  it("denies unauthorized revocation", async () => {
    await login("bob");
    await expect(
      db.query(
        "update public.document_versions set state='revoked' where id=$1",
        [versionA],
      ),
    ).rejects.toThrow(/permission denied/i);
  });
  it("denies direct updates even inside the user's own organization", async () => {
    await login("alice");
    await expect(
      db.query(
        "update public.document_versions set state='issued' where id=$1",
        [versionA],
      ),
    ).rejects.toThrow(/permission denied/i);
  });
  it("denies cross-tenant membership changes", async () => {
    await login("alice");
    await expect(
      db.query("select public.grant_membership($1,$2,'organization_admin')", [
        orgB,
        ids.alice,
      ]),
    ).rejects.toThrow();
  });
  it("does not grant platform privileges on public signup identity", async () => {
    await login("outsider");
    expect(await value("select count(*)::int from public.organizations")).toBe(
      0,
    );
    await expect(
      db.query(
        "select public.create_organization('Attaque','X','private','GN','Conakry')",
      ),
    ).rejects.toThrow();
  });
  it("rejects AAL1 writes even for platform administrators", async () => {
    await login("admin", "aal1");
    await expect(
      db.query(
        "select public.create_organization('Refusée','R','private','GN','Conakry')",
      ),
    ).rejects.toThrow();
  });
  it("rejects stale TOTP", async () => {
    await login("admin", "aal2", 600);
    await expect(
      db.query(
        "select public.create_organization('Refusée','R','private','GN','Conakry')",
      ),
    ).rejects.toThrow();
  });
  it("does not accept editable metadata as authority", async () => {
    await login("outsider");
    await db.query("select set_config('request.jwt.claims',$1,false)", [
      JSON.stringify({
        sub: ids.outsider,
        session_id: sessions.outsider,
        aal: "aal2",
        user_metadata: { role: "super_admin", organization_id: orgA },
      }),
    ]);
    await expect(
      db.query("select public.create_document_type($1,'bad','Intrusion',$2)", [
        orgA,
        schema,
      ]),
    ).rejects.toThrow();
  });
  it("requires a current type-specific delegation to approve", async () => {
    await login("approver");
    const hash = await value(
      "select content_hash from public.document_versions where id=$1",
      [versionA],
    );
    await expect(
      db.query("select public.approve_document($1,$2,$3)", [
        orgA,
        versionA,
        hash,
      ]),
    ).rejects.toThrow(/Délégation/);
  });
  it("approves exactly the reviewed content, with delegation", async () => {
    await login("admin");
    await db.query(
      "select public.grant_delegation($1,$2,$3,now()+interval '1 day',true,false)",
      [orgA, ids.approver, typeA],
    );
    await login("approver");
    const hash = await value(
      "select content_hash from public.document_versions where id=$1",
      [versionA],
    );
    await expect(
      db.query("select public.approve_document($1,$2,$3)", [
        orgA,
        versionA,
        "0".repeat(64),
      ]),
    ).rejects.toThrow(/modifiée/);
    await db.query("select public.approve_document($1,$2,$3)", [
      orgA,
      versionA,
      hash,
    ]);
    expect(
      await value("select state from public.document_versions where id=$1", [
        versionA,
      ]),
    ).toBe("approved");
  });
  it("creates an unapproved new version after editing approved content", async () => {
    await login("alice");
    const next = await value<string>("select public.revise_draft($1,$2,$3)", [
      orgA,
      versionA,
      { subject: "Version corrigée" },
    ]);
    expect(
      await value("select state from public.document_versions where id=$1", [
        next,
      ]),
    ).toBe("draft");
    expect(
      await value(
        "select count(*)::int from public.document_approvals where version_id=$1",
        [next],
      ),
    ).toBe(0);
    expect(
      await value(
        "select count(*)::int from public.document_approvals where version_id=$1",
        [versionA],
      ),
    ).toBe(1);
  });
  it("rejects unknown and missing required document fields at SQL boundary", async () => {
    await login("alice");
    for (const content of [{ unknown: "x" }, {}])
      await expect(
        db.query("select public.create_draft($1,$2,'INVALID',$3)", [
          orgA,
          tvA,
          content,
        ]),
      ).rejects.toThrow();
  });
  it("enforces organization/reference uniqueness", async () => {
    await login("alice");
    await expect(
      db.query("select public.create_draft($1,$2,'A-001',$3)", [
        orgA,
        tvA,
        { subject: "Duplicate" },
      ]),
    ).rejects.toThrow(/duplicate key/i);
  });
  it("expires idle sessions at DB layer; refresh cannot revive same session", async () => {
    await db.exec("reset role");
    await db.query(
      "update private.application_sessions set last_seen_at=now()-interval '31 minutes' where user_id=$1",
      [ids.bob],
    );
    expect(await login("bob")).toBe(false);
    expect(await value("select count(*)::int from public.organizations")).toBe(
      0,
    );
  });
  it("ends a session and denies subsequent queries", async () => {
    await login("outsider");
    await db.exec("select public.end_session()");
    expect(await value("select public.touch_session()")).toBe(false);
  });
  it("denies anonymous private files and business tables", async () => {
    await db.exec("reset role;set role anon");
    await expect(db.query("select * from public.documents")).rejects.toThrow(
      /permission denied/i,
    );
    expect(await value("select count(*)::int from storage.objects")).toBe(0);
  });
  it("enables RLS on every application table", async () => {
    await db.exec("reset role");
    expect(
      await value(
        "select count(*)::int from pg_tables where schemaname in ('public','private') and not rowsecurity",
      ),
    ).toBe(0);
  });
  it("has no public bucket", async () => {
    await db.exec("reset role");
    expect(
      await value("select count(*)::int from storage.buckets where public"),
    ).toBe(0);
  });
  it("denies mutation of audit, approvals and type versions even to table owner", async () => {
    await db.exec("reset role");
    for (const table of [
      "audit_logs",
      "document_approvals",
      "document_type_versions",
    ])
      await expect(db.query(`delete from public.${table}`)).rejects.toThrow(
        /immuable/i,
      );
  });
  it("keeps issuance closed without an independently validated PDF", async () => {
    await db.exec("reset role");
    await expect(
      db.query(
        "update public.document_versions set state='issued' where id=$1",
        [versionA],
      ),
    ).rejects.toThrow(/PAdES/);
  });
  it("isolates services inside the same organization for reads and approval RPCs", async () => {
    await db.exec("reset role");
    const unitA = await value<string>(
      "insert into public.organization_units(organization_id,name) values($1,'Service A') returning id",
      [orgA],
    );
    const unitB = await value<string>(
      "insert into public.organization_units(organization_id,name) values($1,'Service B') returning id",
      [orgA],
    );
    await db.query(
      "update public.memberships set unit_id=$1 where user_id=$2 and organization_id=$3",
      [unitA, ids.alice, orgA],
    );
    await db.query(
      "update public.memberships set unit_id=$1 where user_id=$2 and organization_id=$3",
      [unitB, ids.approver, orgA],
    );
    await login("alice");
    const version = await value<string>(
      "select public.create_draft($1,$2,'SERVICE-A',$3)",
      [orgA, tvA, { subject: "Service A seulement" }],
    );
    const hash = await value<string>(
      "select content_hash from public.document_versions where id=$1",
      [version],
    );
    await login("approver");
    expect(
      await value(
        "select count(*)::int from public.document_versions where id=$1",
        [version],
      ),
    ).toBe(0);
    await expect(
      db.query("select public.approve_document($1,$2,$3)", [
        orgA,
        version,
        hash,
      ]),
    ).rejects.toThrow(/Service non autorisé/i);
  });
});
