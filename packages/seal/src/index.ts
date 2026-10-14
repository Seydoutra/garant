export const packageStatus = {
  name: "@garant/seal",
  implemented: false,
} as const;
export class NotImplementedError extends Error {
  readonly code = "NOT_IMPLEMENTED";
  constructor() {
    super("The seal module has not been implemented.");
    this.name = "NotImplementedError";
  }
}
