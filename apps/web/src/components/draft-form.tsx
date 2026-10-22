"use client";
import { useState } from "react";
const labels: Record<string, string> = {
  subjectName: "Personne concernée",
  statement: "Objet de l’attestation",
  recipient: "Destinataire",
  subject: "Objet",
  body: "Contenu de la lettre",
  project: "Projet ou équipement concerné",
  findings: "Constatations",
  annexReference: "Référence de l’annexe",
};
type TypeOption = {
  id: string;
  name: string;
  fields: Record<string, { type: "string"; required: boolean }>;
};
export function DraftForm({
  organizationId,
  types,
}: {
  organizationId: string;
  types: TypeOption[];
}) {
  const [selected, setSelected] = useState(types[0]?.id ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const type = types.find((t) => t.id === selected);
  if (types.length === 0)
    return <p>Configurez d’abord un type documentaire.</p>;
  return (
    <form
      className="workspace-form"
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        setError("");
        const data = new FormData(event.currentTarget);
        const content = Object.fromEntries(
          Object.keys(type?.fields ?? {}).map((key) => [
            key,
            String(data.get(`field_${key}`) ?? ""),
          ]),
        );
        try {
          const response = await fetch("/api/v1/documents", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              organizationId,
              typeVersionId: selected,
              reference: data.get("reference"),
              content,
            }),
          });
          if (!response.ok) throw Error();
          window.location.reload();
        } catch {
          setError(
            "Enregistrement refusé. Vérifiez les champs, l’unicité de la référence et votre code TOTP récent.",
          );
        } finally {
          setBusy(false);
        }
      }}
    >
      <label>
        Type documentaire
        <select value={selected} onChange={(e) => setSelected(e.target.value)}>
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Référence de votre organisation
        <input name="reference" required maxLength={160} />
      </label>
      <div key={selected} className="field-grid">
        {Object.entries(type?.fields ?? {}).map(([key, spec]) => (
          <label key={key}>
            {labels[key] ?? key}
            {spec.required ? " *" : " (facultatif)"}
            <textarea
              name={`field_${key}`}
              required={spec.required}
              maxLength={5000}
            />
          </label>
        ))}
      </div>
      <p>
        Ce document sera enregistré comme brouillon. Il devra être contrôlé par
        un approbateur habilité.
      </p>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <button className="primary" disabled={busy}>
        {busy ? "Enregistrement…" : "Enregistrer le brouillon"}
      </button>
    </form>
  );
}
