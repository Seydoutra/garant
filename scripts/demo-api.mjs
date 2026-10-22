// Session-based demo client, NOT a provisioned external integration credential.
// Supply an existing beta session through a secret environment, never command-line arguments.
const url = process.env.GARANT_APP_URL ?? "http://127.0.0.1:3000";
if (!process.env.GARANT_SESSION_COOKIE)
  throw Error(
    "GARANT_SESSION_COOKIE is required; obtain an authorized beta session first.",
  );
const response = await fetch(new URL("/api/v1/organizations", url), {
  headers: { Cookie: process.env.GARANT_SESSION_COOKIE },
  redirect: "error",
});
if (!response.ok)
  throw Error(`GARANT API refused request (${response.status}).`);
const result = await response.json();
process.stdout.write(JSON.stringify(result, null, 2) + "\n");
