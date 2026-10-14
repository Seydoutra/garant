export const packageStatus = {
  name: "@garant/db",
  implemented: false,
} as const;
export class NotImplementedError extends Error {
  readonly code = "NOT_IMPLEMENTED";
  constructor() {
    super("The db module has not been implemented.");
    this.name = "NotImplementedError";
  }
}
