import { z } from "zod";
const shellSchema = z.object({ APP_MODE: z.literal("shell").default("shell") });
export function parseShellConfiguration(
  environment: Record<string, string | undefined>,
) {
  return shellSchema.parse(environment);
}
