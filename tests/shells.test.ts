import { describe, it, expect } from "vitest";
import { getInitialState } from "../apps/verifier/src/state";
import { NotImplementedError, packageStatus } from "../packages/seal/src/index";
import { parseShellConfiguration } from "../apps/web/src/lib/config";
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
  it("returns an explicit non-connected health state", async () => {
    const response = GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      service: "garant-web",
      mode: "shell",
      authentication: "not_implemented",
      database: "not_connected",
    });
  });
  it("rejects a production mode not implemented by this shell", () =>
    expect(() =>
      parseShellConfiguration({ APP_MODE: "production" }),
    ).toThrow());
  it("accepts the local shell without secrets", () =>
    expect(parseShellConfiguration({})).toEqual({ APP_MODE: "shell" }));
});
