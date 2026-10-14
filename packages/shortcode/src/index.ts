export const packageStatus = {
  name: "@garant/shortcode",
  implemented: false,
} as const;
export class NotImplementedError extends Error {
  readonly code = "NOT_IMPLEMENTED";
  constructor() {
    super("The shortcode module has not been implemented.");
    this.name = "NotImplementedError";
  }
}
