"use client";
import { useState, type ReactNode } from "react";
export function WorkspaceForm({
  endpoint,
  children,
  transform,
}: {
  endpoint: string;
  children: ReactNode;
  transform?: "type" | "draft" | "delegation";
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <form
      className="workspace-form"
      onSubmit={async (event) => {
        event.preventDefault();
        setError("");
        setBusy(true);
        try {
          const data: Record<string, unknown> = Object.fromEntries(
            new FormData(event.currentTarget),
          );
          if (transform === "type")
            data.schema = JSON.parse(String(data.schema));
          if (transform === "draft")
            data.content = JSON.parse(String(data.content));
          if (transform === "delegation") {
            data.canApprove = data.canApprove === "on";
            data.canIssue = data.canIssue === "on";
            data.until = new Date(String(data.until)).toISOString();
          }
          const r = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          const result = await r.json();
          if (!r.ok)
            throw Error(
              result.error === "MFA_REQUIRED"
                ? "Vérifiez votre code TOTP avant de continuer."
                : result.error === "AUTHENTICATION_REQUIRED" ||
                    result.error === "SESSION_EXPIRED"
                  ? "Session expirée. Reconnectez-vous."
                  : "Opération refusée. Vérifiez les champs, vos habilitations et la fraîcheur du TOTP.",
            );
          window.location.reload();
        } catch (error) {
          setError(
            error instanceof SyntaxError
              ? "Le contenu JSON n’est pas valide."
              : error instanceof Error
                ? error.message
                : "Opération impossible.",
          );
        } finally {
          setBusy(false);
        }
      }}
    >
      {children}
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <button className="primary" disabled={busy}>
        {busy ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}
