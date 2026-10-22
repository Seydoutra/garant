// Opt-in real GARANT HTTP/GoTrue integration, never CI. All credentials stay in memory.
import { createRequire } from "node:module";
import { readFile, unlink } from "node:fs/promises";
import { randomBytes, randomUUID, createHmac } from "node:crypto";
import assert from "node:assert/strict";
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
assert.equal(
  env.NEXT_PUBLIC_SUPABASE_URL,
  "https://knseyxmyfhjqmiroufbm.supabase.co",
);
assert.equal(env.APP_ENV, "development");
const origin = process.env.GARANT_TEST_APP_URL ?? "http://127.0.0.1:3002";
assert.ok(
  ["http://127.0.0.1:3002", "https://garant-app-one.vercel.app"].includes(
    origin,
  ),
  "Explicit GARANT test origin required",
);
const results = [];
function report(name, data = {}) {
  results.push({ name, ...data });
  console.log(JSON.stringify({ name, ...data }));
}
const timedFetch = (input, init) =>
  fetch(input, { ...init, signal: AbortSignal.timeout(20000) });
const options = {
  auth: { persistSession: false, autoRefreshToken: false },
  global: { fetch: timedFetch },
};
let key;
try {
  key = (await readFile("/private/tmp/garant-live-admin-key", "utf8")).trim();
} finally {
  await unlink("/private/tmp/garant-live-admin-key").catch(() => {});
}
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, key, options);
key = undefined;
const client = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  options,
);
const creds = {
  email: `garant-http-${randomUUID().slice(0, 8)}@smartsell.pro`,
  password: randomBytes(32).toString("base64url"),
};
const jar = new Map();
let userId, secret;
function totp() {
  let bits = "";
  for (const c of secret.toUpperCase().replace(/=+$/, ""))
    bits += "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
      .indexOf(c)
      .toString(2)
      .padStart(5, "0");
  const key = Buffer.from(bits.match(/.{8}/g).map((b) => parseInt(b, 2)));
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30000)));
  const digest = createHmac("sha1", key).update(counter).digest();
  return String(
    (digest.readUInt32BE(digest.at(-1) & 15) & 0x7fffffff) % 1000000,
  ).padStart(6, "0");
}
const cookieHeader = () => [...jar].map(([k, v]) => `${k}=${v}`).join("; ");
async function req(path, init = {}, cookies = cookieHeader()) {
  const r = await timedFetch(origin + path, {
    ...init,
    redirect: "manual",
    headers: { ...init.headers, ...(cookies ? { cookie: cookies } : {}) },
  });
  for (const c of r.headers.getSetCookie()) {
    const pair = c.split(";")[0];
    const i = pair.indexOf("=");
    const k = pair.slice(0, i),
      v = pair.slice(i + 1);
    if (!v || /max-age=0/i.test(c)) jar.delete(k);
    else jar.set(k, v);
  }
  return r;
}
const postForm = (values) => ({
  method: "POST",
  headers: { origin, "content-type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams(values),
});
const postJson = (values) => ({
  method: "POST",
  headers: { origin, "content-type": "application/json" },
  body: JSON.stringify(values),
});
try {
  let r = await req("/api/health");
  assert.equal(r.status, 200);
  assert.equal((await r.json()).configuration, "configured");
  report("http-health", { status: 200 });
  r = await req("/dashboard");
  assert.equal(r.status, 307);
  assert.match(r.headers.get("location"), /\/connexion/);
  report("http-anonymous-dashboard", {
    status: r.status,
    redirect: "connexion",
  });
  r = await req("/auth/mfa", postJson({ operation: "begin" }));
  assert.equal(r.status, 401);
  report("http-anonymous-mfa", { status: 401 });
  r = await req("/auth/operation", {
    ...postForm({ operation: "login", ...creds }),
    headers: {
      origin: "https://invalid.example",
      "content-type": "application/x-www-form-urlencoded",
    },
  });
  assert.equal(r.status, 403);
  report("http-cross-origin", { status: 403 });
  const created = await admin.auth.admin.createUser({
    ...creds,
    email_confirm: true,
    app_metadata: { garant_test_account: true },
  });
  assert.ifError(created.error);
  userId = created.data.user.id;
  assert.ok(created.data.user.email_confirmed_at);
  report("http-test-user", { userId, confirmed: true });
  // Enroll a known authenticator in memory using the public SDK, then test its challenge via the application.
  assert.ifError((await client.auth.signInWithPassword(creds)).error);
  const enrollment = await client.auth.mfa.enroll({
    factorType: "totp",
    issuer: "GARANT HTTP E2E",
  });
  assert.ifError(enrollment.error);
  secret = enrollment.data.totp.secret;
  assert.ifError(
    (
      await client.auth.mfa.challengeAndVerify({
        factorId: enrollment.data.id,
        code: totp(),
      })
    ).error,
  );
  report("sdk-factor-ready", { verified: true });
  r = await req(
    "/auth/operation",
    postForm({
      operation: "login",
      email: creds.email,
      password: randomBytes(32).toString("hex"),
    }),
  );
  assert.equal(r.status, 303);
  assert.match(r.headers.get("location"), /AUTH_FAILED/);
  report("http-bad-password", { refused: true });
  r = await req("/auth/operation", postForm({ operation: "login", ...creds }));
  assert.equal(r.status, 303);
  assert.match(r.headers.get("location"), /configuration-2fa/);
  assert.ok(jar.size);
  report("http-login", { status: 303, cookieIssued: true });
  r = await req("/dashboard");
  assert.equal(r.status, 307);
  assert.match(r.headers.get("location"), /configuration-2fa/);
  report("http-dashboard-before-mfa", {
    status: 307,
    redirect: "configuration-2fa",
  });
  r = await req("/auth/mfa", postJson({ operation: "begin" }));
  assert.equal(r.status, 200);
  const begin = await r.json();
  assert.equal(begin.factorId, enrollment.data.id);
  assert.equal(begin.qrCode, undefined);
  report("http-mfa-existing-factor", { status: 200, correctFactor: true });
  const bad = String((Number(totp()) + 1) % 1000000).padStart(6, "0");
  r = await req(
    "/auth/mfa",
    postJson({ operation: "verify", factorId: begin.factorId, code: bad }),
  );
  assert.equal(r.status, 400);
  report("http-bad-totp", { status: 400, refused: true });
  // Start on a fresh TOTP interval so the enrollment code is never reused.
  await new Promise((resolve) =>
    setTimeout(resolve, 31000 - (Date.now() % 30000)),
  );
  r = await req(
    "/auth/mfa",
    postJson({ operation: "verify", factorId: begin.factorId, code: totp() }),
  );
  assert.equal(r.status, 200);
  assert.equal((await r.json()).verified, true);
  report("http-good-totp", { status: 200, verified: true });
  const oldCookies = cookieHeader();
  r = await req("/dashboard");
  assert.equal(r.status, 200);
  const page = await r.text();
  assert.match(page, /Vue d’ensemble/);
  report("http-dashboard-after-mfa", { status: 200, workspaceRendered: true });
  r = await req("/auth/operation", postForm({ operation: "logout" }));
  assert.equal(r.status, 303);
  assert.match(r.headers.get("location"), /connexion/);
  report("http-logout", { status: 303 });
  r = await req("/dashboard");
  assert.equal(r.status, 307);
  assert.match(r.headers.get("location"), /connexion/);
  report("http-dashboard-after-logout", { status: 307 });
  r = await req("/dashboard", {}, oldCookies);
  assert.equal(r.status, 307);
  assert.match(r.headers.get("location"), /connexion/);
  report("http-replay-ended-session", { status: 307, rejected: true });
  const sdkSignout = await client.auth.signOut({ scope: "local" });
  report("sdk-signout", {
    ok: !sdkSignout.error,
    code: sdkSignout.error?.code ?? null,
    status: sdkSignout.error?.status ?? null,
  });
  report("complete", { ok: true });
} catch (error) {
  report("failure", {
    name: error.name,
    code: error.code ?? null,
    status: error.status ?? null,
    message: String(error.message)
      .replace(/sb_secret_\S+/g, "[REDACTED]")
      .slice(0, 250),
  });
  process.exitCode = 1;
} finally {
  if (userId) {
    const ban = await admin.auth.admin.updateUserById(userId, {
      ban_duration: "876000h",
    });
    report("test-account-disabled", { ok: !ban.error, userId });
  }
  // Also disable the earlier SDK-only test identity, explicitly marked as test-only.
  const earlier = await admin.auth.admin.getUserById(
    "7a70e216-3044-423a-a4aa-0a9f53d6f729",
  );
  if (earlier.data.user?.app_metadata?.garant_test_account === true) {
    const ban = await admin.auth.admin.updateUserById(earlier.data.user.id, {
      ban_duration: "876000h",
    });
    report("earlier-test-account-disabled", { ok: !ban.error });
  }
  secret = undefined;
  creds.password = "";
  console.log(JSON.stringify({ results }));
}
