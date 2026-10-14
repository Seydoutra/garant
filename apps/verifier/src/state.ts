export type VerifierState = { kind: "unavailable"; reason: "NOT_IMPLEMENTED" };
export function getInitialState(): VerifierState {
  return { kind: "unavailable", reason: "NOT_IMPLEMENTED" };
}
