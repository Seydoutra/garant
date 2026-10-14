export const packageStatus = {
  name: "@garant/pdf",
  implemented: false,
} as const;
export class NotImplementedError extends Error {
  readonly code = "NOT_IMPLEMENTED";
  constructor() {
    super("The pdf module has not been implemented.");
    this.name = "NotImplementedError";
  }
}
