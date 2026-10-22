import { z } from "zod";
import { authenticatedClient } from "@/lib/auth";
import { jsonInput, apiError } from "@/lib/http";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const input = z
      .discriminatedUnion("operation", [
        z.object({ operation: z.literal("begin") }),
        z.object({
          operation: z.literal("verify"),
          factorId: z.uuid(),
          code: z.string().regex(/^\d{6}$/),
        }),
      ])
      .parse(await jsonInput(request));
    const { client } = await authenticatedClient();
    if (input.operation === "begin") {
      const { data, error } = await client.auth.mfa.listFactors();
      if (error) throw error;
      const verified = data.totp.find((f) => f.status === "verified");
      if (verified) return Response.json({ factorId: verified.id });
      // Reuse no secrets from storage. Explicitly clean only this user's unverified attempts.
      for (const factor of data.all.filter(
        (f) => f.factor_type === "totp" && f.status === "unverified",
      ))
        await client.auth.mfa.unenroll({ factorId: factor.id });
      const enrollment = await client.auth.mfa.enroll({
        factorType: "totp",
        issuer: "GARANT",
      });
      if (enrollment.error) throw enrollment.error;
      return Response.json(
        { factorId: enrollment.data.id, qrCode: enrollment.data.totp.qr_code },
        { headers: { "Cache-Control": "private, no-store" } },
      );
    }
    const { error } = await client.auth.mfa.challengeAndVerify({
      factorId: input.factorId,
      code: input.code,
    });
    if (error)
      return Response.json(
        { error: "Code incorrect ou expiré." },
        { status: 400 },
      );
    return Response.json({ verified: true });
  } catch (error) {
    return apiError(error);
  }
}
