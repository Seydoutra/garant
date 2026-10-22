import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  setSession: vi.fn(),
  getUser: vi.fn(),
  replace: vi.fn(),
  scrub: vi.fn(),
}));
vi.mock("../apps/web/node_modules/react", () => ({ useEffect: (effect: () => void) => effect() }));
vi.mock("../apps/web/node_modules/@supabase/ssr", () => ({
  createBrowserClient: () => ({ auth: mocks }),
}));
import { EmailLinkSession } from "../apps/web/src/components/auth/email-link-session";
function open(hash: string) {
  vi.stubGlobal("window", {
    location: {
      hash,
      pathname: "/connexion",
      search: "",
      replace: mocks.replace,
    },
    history: { replaceState: mocks.scrub },
  });
  EmailLinkSession();
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.setSession.mockResolvedValue({ error: null });
  mocks.getUser.mockResolvedValue({
    data: { user: { id: "verified-user" } },
    error: null,
  });
});
afterEach(() => vi.unstubAllGlobals());
describe("dashboard email activation links", () => {
  it.each(["invite", "recovery"])(
    "validates %s with Supabase and offers password setup",
    async (type) => {
      open(`#access_token=fake-access&refresh_token=fake-refresh&type=${type}`);
      expect(mocks.scrub).toHaveBeenCalledWith(null, "", "/connexion");
      await vi.waitFor(() =>
        expect(mocks.replace).toHaveBeenCalledWith(
          "/reinitialiser-mot-de-passe",
        ),
      );
      expect(mocks.getUser).toHaveBeenCalledOnce();
    },
  );
  it("rejects invalid bearer tokens without reaching password setup", async () => {
    mocks.setSession.mockResolvedValue({ error: new Error("invalid") });
    open("#access_token=invalid&refresh_token=invalid&type=invite");
    await vi.waitFor(() =>
      expect(mocks.replace).toHaveBeenCalledWith(
        "/connexion?erreur=CALLBACK_FAILED",
      ),
    );
    expect(mocks.getUser).not.toHaveBeenCalled();
  });
  it("requires a server-validated user", async () => {
    mocks.getUser.mockResolvedValue({
      data: { user: null },
      error: new Error("expired"),
    });
    open("#access_token=invalid&refresh_token=invalid&type=invite");
    await vi.waitFor(() =>
      expect(mocks.replace).toHaveBeenCalledWith(
        "/connexion?erreur=CALLBACK_FAILED",
      ),
    );
  });
  it("ignores ordinary anchors", () => {
    open("#documents");
    expect(mocks.scrub).not.toHaveBeenCalled();
    expect(mocks.setSession).not.toHaveBeenCalled();
  });
  it("rejects incomplete links and never honors arbitrary next destinations", () => {
    open("#access_token=invalid&type=invite&next=https://evil.invalid");
    expect(mocks.replace).toHaveBeenCalledWith(
      "/connexion?erreur=CALLBACK_FAILED",
    );
    expect(mocks.setSession).not.toHaveBeenCalled();
  });
});
