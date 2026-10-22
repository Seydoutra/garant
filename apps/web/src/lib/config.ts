import { z } from "zod";
const configuration = z.object({
  APP_ENV: z.enum(["development", "beta", "production"]).default("development"),
  APP_URL: z.url().default("http://127.0.0.1:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .min(20)
    .refine(
      (value) => !value.startsWith("sb_secret_") && !value.startsWith("eyJ"),
      "Une clé publiable Supabase est requise",
    ),
});
export function parseConfiguration(
  environment: Record<string, string | undefined>,
) {
  return configuration.safeParse(environment);
}
export function getConfiguration() {
  const result = parseConfiguration(process.env);
  if (!result.success) throw new Error("SUPABASE_NOT_CONFIGURED");
  return result.data;
}
export function isConfigured() {
  return parseConfiguration(process.env).success;
}
