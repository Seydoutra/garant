import Link from "next/link";
import { redirect } from "next/navigation";
import { pageSession, requireMfa } from "@/lib/auth";
import { WorkspaceForm } from "@/components/workspace-form";
import { IdleSession } from "@/components/auth/idle-session";
import { DraftForm } from "@/components/draft-form";
import { documentSchema } from "@/lib/validation";
import { starterTypes } from "@/lib/validation";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ org?: string; section?: string }>;
}) {
  const { client, user } = await pageSession();
  try {
    await requireMfa(client);
  } catch {
    redirect("/configuration-2fa");
  }
  const params = await searchParams;
  const [orgResult, access] = await Promise.all([
    client
      .from("organizations")
      .select("id,name,acronym,category,country,city,status")
      .order("name"),
    client.rpc("my_access"),
  ]);
  const orgs = orgResult.data ?? [];
  const selected = orgs.find((org) => org.id === params.org) ?? orgs[0];
  const section = params.section ?? "overview";
  const sections = [
    ["overview", "Vue d’ensemble"],
    ["organizations", "Organisations"],
    ["members", "Habilitations"],
    ["types", "Types documentaires"],
    ["documents", "Documents"],
    ["approvals", "Approbations"],
    ["audit", "Audit"],
    ["settings", "Paramètres"],
  ];
  const oid = selected?.id;

  const [types, versions, documents, docVersions, members, logs] =
    await Promise.all([
      oid
        ? client
            .from("document_types")
            .select("id,name,code")
            .eq("organization_id", oid)
        : null,
      oid
        ? client
            .from("document_type_versions")
            .select("id,document_type_id,version,schema,confidentiality")
            .eq("organization_id", oid)
        : null,
      oid
        ? client
            .from("documents")
            .select("id,reference,created_at")
            .eq("organization_id", oid)
            .order("created_at", { ascending: false })
            .limit(100)
        : null,
      oid
        ? client
            .from("document_versions")
            .select("id,document_id,version,state,content_hash,content")
            .eq("organization_id", oid)
            .order("version", { ascending: false })
            .limit(200)
        : null,
      oid && section === "members"
        ? client
            .from("memberships")
            .select("id,user_id,role_id,active")
            .eq("organization_id", oid)
        : null,
      oid && section === "audit"
        ? client
            .from("audit_logs")
            .select("id,action,resource_id,created_at")
            .eq("organization_id", oid)
            .order("created_at", { ascending: false })
            .limit(100)
        : null,
    ]);
  const failed = [
    orgResult,
    access,
    types,
    versions,
    documents,
    docVersions,
    members,
    logs,
  ].some((result) => result?.error);
  const orgInput = (
    <input type="hidden" name="organizationId" value={oid ?? ""} />
  );
  return (
    <main className="admin-shell">
      <IdleSession />
      <aside>
        <Link className="wordmark" href="/dashboard">
          GARANT<span>ESPACE ORGANISATIONS</span>
        </Link>
        <div className="tenant-placeholder">
          {selected?.name ?? "Aucune organisation habilitée"}
        </div>
        <nav aria-label="Navigation">
          {sections.map(([id, label]) => (
            <Link
              key={id}
              aria-current={section === id ? "page" : undefined}
              href={`/dashboard?section=${id}${oid ? `&org=${oid}` : ""}`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <p>Application V3 · Bêta en développement</p>
      </aside>
      <section className="admin-main">
        <header>
          <span>{user.email}</span>
          <div className="header-actions">
            <Link href="/configuration-2fa">Vérifier le TOTP</Link>
            <form action="/auth/operation" method="post">
              <input type="hidden" name="operation" value="logout" />
              <button>Déconnexion</button>
            </form>
          </div>
        </header>
        <div className="admin-content">
          <p className="eyebrow">CONFIANCE DOCUMENTAIRE</p>
          <h1>
            {sections.find(([id]) => id === section)?.[1] ?? "Votre espace"}
          </h1>
          {failed && (
            <div role="alert" className="notice">
              Certaines données n’ont pas pu être chargées. Vérifiez les
              migrations et vos habilitations. Aucun chiffre estimé n’est
              affiché.
            </div>
          )}
          {orgs.length > 0 && (
            <nav className="org-switch" aria-label="Choisir une organisation">
              {orgs.map((org) => (
                <Link
                  key={org.id}
                  aria-current={org.id === oid ? "true" : undefined}
                  href={`/dashboard?section=${section}&org=${org.id}`}
                >
                  {org.acronym || org.name}
                </Link>
              ))}
            </nav>
          )}
          {section === "overview" && (
            <>
              <p className="lead">
                Préparez les documents relevant des compétences de votre
                organisation. Les habilitations et le service de rattachement
                déterminent les données accessibles.
              </p>
              <div className="admin-cards">
                <article>
                  <span>Organisation</span>
                  <h2>{selected?.name ?? "Aucune habilitation"}</h2>
                  <p>
                    {selected
                      ? `${selected.city} · ${selected.country}`
                      : "Demandez à l’administrateur de vous rattacher à une organisation."}
                  </p>
                </article>
                <article>
                  <span>Documents visibles</span>
                  <h2>
                    {failed ? "Indisponible" : (documents?.data?.length ?? 0)}
                  </h2>
                  <p>
                    Au maximum les 100 derniers documents autorisés, sans
                    estimation globale.
                  </p>
                </article>
                <article>
                  <span>Sécurisation</span>
                  <h2>Émission verrouillée</h2>
                  <p>
                    Le pipeline PDF signé et sa validation indépendante ne sont
                    pas encore activés. Aucun brouillon n’est présenté comme
                    émis.
                  </p>
                </article>
              </div>
            </>
          )}
          {section === "organizations" && (
            <>
              <div className="record-list">
                {orgs.map((org) => (
                  <article className="card" key={org.id}>
                    <h2>{org.name}</h2>
                    <p>
                      {org.category} · {org.city} · {org.country} · {org.status}
                    </p>
                  </article>
                ))}
              </div>
              {access.data?.platformAdmin ? (
                <section className="card">
                  <h2>Créer une organisation</h2>
                  <WorkspaceForm endpoint="/api/v1/organizations">
                    <label>
                      Dénomination
                      <input
                        name="name"
                        required
                        minLength={2}
                        maxLength={180}
                      />
                    </label>
                    <label>
                      Sigle
                      <input name="acronym" maxLength={30} />
                    </label>
                    <label>
                      Catégorie
                      <select name="category">
                        <option value="public">Organisme public</option>
                        <option value="private">Organisation privée</option>
                        <option value="association">Association</option>
                        <option value="other">Autre</option>
                      </select>
                    </label>
                    <label>
                      Pays (ISO)
                      <input
                        name="country"
                        defaultValue="GN"
                        pattern="[A-Z]{2}"
                        required
                      />
                    </label>
                    <label>
                      Ville
                      <input name="city" required maxLength={120} />
                    </label>
                  </WorkspaceForm>
                </section>
              ) : (
                <div className="notice">
                  La création d’organisation est réservée à un administrateur
                  GARANT provisionné séparément.
                </div>
              )}
            </>
          )}
          {!oid && section !== "overview" && section !== "organizations" && (
            <div className="notice">
              Aucune organisation accessible. Aucun privilège n’est attribué
              automatiquement à l’inscription.
            </div>
          )}
          {oid && section === "types" && (
            <>
              <div className="record-list">
                {types?.data?.map((type) => (
                  <article className="card" key={type.id}>
                    <h2>{type.name}</h2>
                    <code>{type.code}</code>
                    <p>
                      Version initiale immuable · confidentialité privée par
                      défaut.
                    </p>
                  </article>
                ))}
              </div>
              <div className="admin-cards">
                {starterTypes
                  .filter(
                    (type) => !types?.data?.some((t) => t.code === type.code),
                  )
                  .map((type) => (
                    <article key={type.code}>
                      <h2>{type.name}</h2>
                      <p>Créer ce modèle de départ pour cette organisation.</p>
                      <WorkspaceForm
                        endpoint="/api/v1/document-types"
                        transform="type"
                      >
                        {orgInput}
                        <input type="hidden" name="name" value={type.name} />
                        <input type="hidden" name="code" value={type.code} />
                        <input
                          type="hidden"
                          name="schema"
                          value={JSON.stringify(type.schema)}
                        />
                      </WorkspaceForm>
                    </article>
                  ))}
              </div>
              <details className="card">
                <summary>Configurer un type supplémentaire</summary>
                <WorkspaceForm
                  endpoint="/api/v1/document-types"
                  transform="type"
                >
                  {orgInput}
                  <label>
                    Nom
                    <input name="name" required />
                  </label>
                  <label>
                    Code
                    <input name="code" pattern="[a-z][a-z0-9_-]+" required />
                  </label>
                  <label>
                    Schéma des champs (JSON)
                    <textarea
                      name="schema"
                      required
                      defaultValue={JSON.stringify(
                        starterTypes[0].schema,
                        null,
                        2,
                      )}
                    />
                  </label>
                </WorkspaceForm>
              </details>
            </>
          )}
          {oid && (section === "documents" || section === "approvals") && (
            <>
              <div className="record-list">
                {documents?.data?.length === 0 && (
                  <div className="notice">
                    Aucun document enregistré. Configurez un type puis préparez
                    un brouillon.
                  </div>
                )}
                {documents?.data?.map((doc) => {
                  const version = docVersions?.data?.find(
                    (v) => v.document_id === doc.id,
                  );
                  return (
                    <article className="card" key={doc.id}>
                      <h2>{doc.reference}</h2>
                      <p>
                        Version {version?.version ?? "—"} ·{" "}
                        {version?.state ?? "Indisponible"}
                      </p>
                      {version && (
                        <>
                          <details>
                            <summary>Contenu de cette version</summary>
                            <pre>
                              {JSON.stringify(version.content, null, 2)}
                            </pre>
                            <small>SHA-256 : {version.content_hash}</small>
                          </details>
                          {version.state === "draft" && (
                            <WorkspaceForm endpoint="/api/v1/approvals">
                              {orgInput}
                              <input
                                type="hidden"
                                name="versionId"
                                value={version.id}
                              />
                              <input
                                type="hidden"
                                name="expectedHash"
                                value={version.content_hash}
                              />
                              <p>
                                L’approbation exige une délégation active et une
                                personne distincte du préparateur.
                              </p>
                              <label>
                                <input type="checkbox" required /> J’ai contrôlé
                                cette version exacte.
                              </label>
                            </WorkspaceForm>
                          )}
                        </>
                      )}
                    </article>
                  );
                })}
              </div>
              {section === "documents" && (
                <section className="card">
                  <h2>Préparer un document</h2>
                  <DraftForm
                    organizationId={oid}
                    types={(versions?.data ?? []).flatMap((v) => {
                      const parsed = documentSchema.safeParse(v.schema);
                      return parsed.success
                        ? [
                            {
                              id: v.id,
                              name: `${types?.data?.find((t) => t.id === v.document_type_id)?.name ?? "Document"} · v${v.version}`,
                              fields: parsed.data.fields,
                            },
                          ]
                        : [];
                    })}
                  />
                </section>
              )}
            </>
          )}
          {oid && section === "members" && (
            <>
              <div className="record-list">
                {members?.data?.map((m) => (
                  <article className="card" key={m.id}>
                    <code>{m.user_id}</code>
                    <p>
                      {m.role_id} · {m.active ? "Actif" : "Désactivé"}
                    </p>
                  </article>
                ))}
              </div>
              <section className="card">
                <h2>Habiliter un compte existant</h2>
                <WorkspaceForm endpoint="/api/v1/memberships">
                  {orgInput}
                  <label>
                    Identifiant utilisateur (UUID)
                    <input name="userId" required />
                  </label>
                  <label>
                    Rôle
                    <select name="role">
                      <option value="reader">Lecteur</option>
                      <option value="issuer">Émetteur</option>
                      <option value="approver">Approbateur</option>
                      <option value="organization_admin">
                        Administrateur d’organisation
                      </option>
                    </select>
                  </label>
                </WorkspaceForm>
              </section>
              <section className="card">
                <h2>Délégation par type documentaire</h2>
                <WorkspaceForm
                  endpoint="/api/v1/delegations"
                  transform="delegation"
                >
                  {orgInput}
                  <label>
                    Identifiant utilisateur
                    <input name="userId" required />
                  </label>
                  <label>
                    Type
                    <select name="documentTypeId" required>
                      {types?.data?.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Fin de validité
                    <input name="until" type="datetime-local" required />
                  </label>
                  <label>
                    <input type="checkbox" name="canApprove" /> Approbation
                    autorisée
                  </label>
                  <label>
                    <input type="checkbox" name="canIssue" /> Émission autorisée
                    lorsque le pipeline sera activé
                  </label>
                </WorkspaceForm>
              </section>
            </>
          )}
          {oid && section === "audit" && (
            <div className="record-list">
              {logs?.data?.length === 0 && (
                <div className="notice">Aucun événement accessible.</div>
              )}
              {logs?.data?.map((log) => (
                <article className="card" key={log.id}>
                  <strong>{log.action}</strong>
                  <p>
                    {new Date(log.created_at).toLocaleString("fr-FR", {
                      timeZone: "Africa/Conakry",
                    })}
                  </p>
                  <code>{log.resource_id}</code>
                </article>
              ))}
            </div>
          )}
          {section === "settings" && (
            <div className="card">
              <h2>Sécurité de votre compte</h2>
              <p>
                Sessions limitées à 30 minutes d’inactivité. Les opérations
                internes demandent un TOTP datant de moins de cinq minutes.
              </p>
              <Link href="/configuration-2fa">
                Vérifier la double authentification →
              </Link>
              <p>
                Les intégrations, SMS et certificats PDF seront disponibles
                après validation de leur pipeline.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
