import { describe, it, expect } from "vitest";
import { verifyDemo } from "./verification";
describe("simulation locale", () => {
  it("présente le document valide fictif", () => {
    expect(verifyDemo(" GAR-DEMO-001 ")?.status).toBe("valid");
    expect(verifyDemo("gar-demo-001")?.holder).toBe("Aminata Exemple");
  });
  it("présente la révocation fictive", () => {
    expect(verifyDemo("GAR-DEMO-002")?.status).toBe("revoked");
    expect(verifyDemo("GAR-DEMO-002")?.revokedAt).toBe("20/09/2026");
  });
  it("ne retourne aucune donnée pour un identifiant inconnu", () => {
    expect(verifyDemo("GAR-DEMO-999")).toBeNull();
    expect(verifyDemo("")).toBeNull();
  });
});
