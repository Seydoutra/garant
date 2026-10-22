import { describe, it, expect } from "vitest";
import { getInitialState } from "../apps/verifier/src/state";
import { NotImplementedError, packageStatus } from "../packages/seal/src/index";
import { parseConfiguration } from "../apps/web/src/lib/config";
import { GET } from "../apps/web/src/app/api/health/route";
describe("non-connected shells", () => {
  it("does not report any document as verified", () =>
    expect(getInitialState()).toEqual({
      kind: "unavailable",
      reason: "NOT_IMPLEMENTED",
    }));
  it("marks cryptographic functionality unavailable", () => {
    expect(packageStatus.implemented).toBe(false);
    expect(new NotImplementedError().code).toBe("NOT_IMPLEMENTED");
  });
  it("does not claim a connected database from configuration alone", async () => {
    const response = GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      service: "garant-web",
      database: "not_probed",
      version: "v3-development",
    });
  });
  it("requires the public Supabase connection before enabling auth", () =>
    expect(parseConfiguration({}).success).toBe(false));
  it("rejects a secret API key in the publishable key slot", () =>
    expect(
      parseConfiguration({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
          "sb_secret_never_expose_this_value",
      }).success,
    ).toBe(false));
});
