"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
export function MfaForm() {
  const router = useRouter();
  const [factor, setFactor] = useState("");
  const [qr, setQr] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function begin() {
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/auth/mfa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operation: "begin" }),
      });
      const d = await r.json();
      if (!r.ok) throw Error();
      setFactor(d.factorId);
      setQr(d.qrCode ?? "");
    } catch {
      setError("Impossible de préparer la double authentification. Réessayez.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="card form-card">
      <h2>Protéger votre accès</h2>
      <p>
        Un code de votre application d’authentification est obligatoire avant
        toute opération sensible. Il doit dater de moins de cinq minutes.
      </p>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      {!factor ? (
        <button className="primary" disabled={busy} onClick={begin}>
          Configurer ou vérifier le TOTP
        </button>
      ) : (
        <>
          {qr && (
            <div className="qr-enrollment">
              <p>
                Scannez ce QR dans votre application d’authentification. Ne le
                partagez pas.
              </p>
              {/* Auth service returns an SVG data URL, never inserted as HTML. */}
              <Image
                unoptimized
                src={
                  qr.startsWith("data:image/")
                    ? qr
                    : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(qr)}`
                }
                width={220}
                height={220}
                alt="QR de configuration TOTP personnel"
              />
            </div>
          )}
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              setBusy(true);
              setError("");
              const code = new FormData(event.currentTarget).get("code");
              try {
                const r = await fetch("/auth/mfa", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    operation: "verify",
                    factorId: factor,
                    code,
                  }),
                });
                if (!r.ok) throw Error();
                router.replace("/dashboard");
                router.refresh();
              } catch {
                setError(
                  "Code incorrect, session expirée ou service indisponible.",
                );
              } finally {
                setBusy(false);
              }
            }}
          >
            <label>
              Code à six chiffres
              <input
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                required
              />
            </label>
            <button className="primary" disabled={busy}>
              Vérifier mon code
            </button>
          </form>
        </>
      )}
    </section>
  );
}
