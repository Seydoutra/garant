// Opt-in GARANT integration harness. Credentials and TOTP material remain in memory.
// Never run in CI or against another project. Confirmation is scoped to a test account.
import { createRequire } from "node:module";
import { readFile, unlink } from "node:fs/promises";
import { randomBytes, randomUUID, createHmac } from "node:crypto";
import { createInterface } from "node:readline";
const require = createRequire(
  new URL("../apps/web/package.json", import.meta.url),
);
const { createClient } = require("@supabase/supabase-js");
const env = Object.fromEntries(
  (await readFile(new URL("../apps/web/.env.local", import.meta.url), "utf8"))
    .trim()
    .split("\n")
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);
if (
  env.NEXT_PUBLIC_SUPABASE_URL !== "https://knseyxmyfhjqmiroufbm.supabase.co" ||
  env.APP_ENV !== "development"
)
  throw Error("GARANT development target required");
const timedFetch = (input, init) =>
  fetch(input, {
    ...init,
    signal: AbortSignal.timeout(20000),
  });
const client = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: timedFetch },
  },
);
const credentials = {
  email:
    process.env.GARANT_LIVE_TEST_EMAIL ??
    `garant-e2e-${randomUUID().slice(0, 8)}@example.com`,
  password: randomBytes(32).toString("base64url"),
};
let factor, secret;
const results = [];
const report = (name, data) => {
  results.push({ name, ...data });
  process.stdout.write(JSON.stringify({ name, ...data }) + "\n");
};
function totp(base32) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const c of base32.toUpperCase().replace(/=+$/, ""))
    bits += alphabet.indexOf(c).toString(2).padStart(5, "0");
  const key = Buffer.from(
    (bits.match(/.{8}/g) ?? []).map((b) => parseInt(b, 2)),
  );
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30000)));
  const digest = createHmac("sha1", key).update(counter).digest();
  const offset = digest.at(-1) & 15;
  return String((digest.readUInt32BE(offset) & 0x7fffffff) % 1000000).padStart(
    6,
    "0",
  );
}
async function command(action) {
  if (action === "status") {
    const response = await fetch(
      env.NEXT_PUBLIC_SUPABASE_URL + "/auth/v1/settings",
      { headers: { apikey: env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY } },
    );
    const data = await response.json();
    report("auth-settings", {
      http: response.status,
      emailEnabled: data.external?.email,
      signupDisabled: data.disable_signup,
      autoConfirm: data.mailer_autoconfirm,
    });
  } else if (action === "provision") {
    const keyPath = "/private/tmp/garant-live-admin-key";
    let key;
    try {
      key = (await readFile(keyPath, "utf8")).trim();
    } finally {
      await unlink(keyPath).catch(() => {});
    }
    const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: timedFetch },
    });
    credentials.email = `garant-e2e-${randomUUID().slice(0, 8)}@smartsell.pro`;
    const { data, error } = await admin.auth.admin.createUser({
      ...credentials,
      email_confirm: true,
      app_metadata: { garant_test_account: true },
    });
    key = undefined;
    report("provision", {
      ok: !error,
      code: error?.code ?? null,
      userId: data.user?.id ?? null,
      errorName: error?.name ?? null,
      status: error?.status ?? null,
      confirmed: !!data.user?.email_confirmed_at,
    });
  } else if (action === "signup") {
    const { data, error } = await client.auth.signUp(credentials);
    report("signup", {
      ok: !error,
      code: error?.code ?? null,
      userId: data.user?.id ?? null,
      email: credentials.email,
      sessionIssued: !!data.session,
    });
  } else if (action === "login") {
    const { data, error } = await client.auth.signInWithPassword(credentials);
    report("login", {
      ok: !error,
      code: error?.code ?? null,
      userId: data.user?.id ?? null,
    });
    if (!error) {
      const touch = await client.rpc("touch_session");
      report("session-touch", {
        ok: !touch.error,
        active: touch.data,
        code: touch.error?.code ?? null,
      });
      const level = await client.auth.mfa.getAuthenticatorAssuranceLevel();
      report("aal-before", { level: level.data?.currentLevel ?? null });
    }
  } else if (action === "bad-password") {
    const isolated = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { fetch: timedFetch },
      },
    );
    const { error } = await isolated.auth.signInWithPassword({
      email: credentials.email,
      password: randomBytes(32).toString("hex"),
    });
    report("bad-password", { refused: !!error, code: error?.code ?? null });
  } else if (action === "enroll") {
    const { data, error } = await client.auth.mfa.enroll({
      factorType: "totp",
      issuer: "GARANT E2E",
    });
    factor = data?.id;
    secret = data?.totp?.secret;
    report("totp-enroll", {
      ok: !error,
      code: error?.code ?? null,
      factorId: factor ?? null,
    });
  } else if (action === "bad-totp") {
    const actual = totp(secret);
    const bad = String((Number(actual) + 1) % 1000000).padStart(6, "0");
    const { error } = await client.auth.mfa.challengeAndVerify({
      factorId: factor,
      code: bad,
    });
    report("bad-totp", { refused: !!error, code: error?.code ?? null });
  } else if (action === "verify") {
    const { error } = await client.auth.mfa.challengeAndVerify({
      factorId: factor,
      code: totp(secret),
    });
    const level = await client.auth.mfa.getAuthenticatorAssuranceLevel();
    report("totp-verify", {
      ok: !error,
      code: error?.code ?? null,
      level: level.data?.currentLevel ?? null,
    });
    const access = await client.rpc("my_access");
    report("real-access-context", {
      ok: !access.error,
      active: access.data?.active,
      recentMfa: access.data?.recentMfa,
      platformAdmin: access.data?.platformAdmin,
    });
  } else if (action === "logout") {
    await client.rpc("end_session");
    const { error } = await client.auth.signOut({ scope: "local" });
    const check = await client.auth.getUser();
    report("logout", { ok: !error, userAbsent: !check.data.user });
  } else if (action === "results")
    process.stdout.write(JSON.stringify({ results }) + "\n");
  else if (action === "exit") {
    await client.auth.signOut({ scope: "local" });
    process.exit(0);
  } else throw Error("Unknown command");
}
process.stdout.write(
  "Ready. Commands: status provision signup login bad-password enroll bad-totp verify logout results exit\n",
);
const input = createInterface({ input: process.stdin });
for await (const line of input) {
  try {
    await command(line.trim());
  } catch {
    report("command-error", { operation: line.trim(), ok: false });
  }
}
