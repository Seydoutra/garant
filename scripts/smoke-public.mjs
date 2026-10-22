// Anonymous smoke checks for the exact published GARANT beta. No account or email is created.
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
const origin = "https://garant-app-one.vercel.app";
async function request(path, init = {}) {
  return fetch(origin + path, {
    ...init,
    redirect: "manual",
    signal: AbortSignal.timeout(20000),
  });
}
function report(name, data) {
  console.log(JSON.stringify({ name, ...data }));
}
let r = await request("/api/health");
assert.equal(r.status, 200);
const health = await r.json();
assert.equal(health.configuration, "configured");
report("health", { status: r.status, configuration: health.configuration });
for (const path of ["/connexion", "/inscription", "/mot-de-passe-oublie"]) {
  r = await request(path);
  assert.equal(r.status, 200);
  report(path, { status: r.status });
}
r = await request("/dashboard");
assert.equal(r.status, 307);
assert.match(r.headers.get("location"), /\/connexion/);
report("anonymous-dashboard", { status: r.status, blocked: true });
const post = {
  method: "POST",
  headers: { origin, "content-type": "application/json" },
  body: JSON.stringify({ operation: "begin" }),
};
r = await request("/auth/mfa", post);
assert.equal(r.status, 401);
assert.equal((await r.json()).error, "AUTHENTICATION_REQUIRED");
report("anonymous-mfa", { status: 401, blocked: true });
r = await request("/auth/mfa", {
  ...post,
  headers: { ...post.headers, origin: "https://invalid.example" },
});
assert.equal(r.status, 403);
report("cross-origin-mfa", { status: 403, blocked: true });
r = await request("/auth/operation", {
  method: "POST",
  headers: { origin, "content-type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    operation: "login",
    email: `garant-invalid-${randomUUID()}@example.com`,
    password: randomBytes(32).toString("base64url"),
  }),
});
assert.equal(r.status, 303);
const location = new URL(r.headers.get("location"), origin);
assert.equal(location.origin, origin);
assert.equal(location.searchParams.get("erreur"), "AUTH_FAILED");
report("remote-invalid-login", {
  status: 303,
  rejected: true,
  canonicalOrigin: true,
});
r = await request("/api/v1/organizations", {
  method: "POST",
  headers: { origin, "content-type": "application/json" },
  body: JSON.stringify({
    name: "GARANT smoke - never created",
    category: "private",
    country: "GN",
    city: "Conakry",
  }),
});
assert.equal(r.status, 401);
report("anonymous-business-write", { status: 401, blocked: true });
report("complete", { ok: true });
