// Owner-only procedure, deliberately outside signup and outside every HTTP route.
// Run with a direct GARANT development DB connection, never a public API key.
import pg from "../packages/db/node_modules/pg/lib/index.js";
const [userId, confirmation] = process.argv.slice(2);
if (
  !/^[0-9a-f-]{36}$/i.test(userId ?? "") ||
  confirmation !== "GARANT-DEVELOPMENT" ||
  !process.env.DIRECT_DATABASE_URL ||
  process.env.APP_ENV !== "development"
)
  throw Error(
    "Require APP_ENV=development, DIRECT_DATABASE_URL, user UUID and GARANT-DEVELOPMENT confirmation",
  );
const target = new URL(process.env.DIRECT_DATABASE_URL);
const project = process.env.GARANT_SUPABASE_PROJECT_REF;
if (!(
  (project &&
    /^[a-z]{20}$/.test(project) &&
    target.hostname === `db.${project}.supabase.co`) ||
  (["127.0.0.1", "localhost"].includes(target.hostname) &&
    target.port === "54322")
))
  throw Error("Direct GARANT development host or local port 54322 required");
const client = new pg.Client({
  connectionString: process.env.DIRECT_DATABASE_URL,
});
await client.connect();
try {
  await client.query("begin");
  const check = await client.query(
    "select id from auth.users where id=$1 and email_confirmed_at is not null",
    [userId],
  );
  if (check.rowCount !== 1) throw Error("Confirmed existing user required");
  await client.query(
    "insert into private.platform_admins(user_id) values($1) on conflict do nothing",
    [userId],
  );
  await client.query("commit");
  process.stdout.write(
    "GARANT development administrator provisioned. TOTP remains mandatory.\n",
  );
} catch (error) {
  await client.query("rollback");
  throw error;
} finally {
  await client.end();
}
