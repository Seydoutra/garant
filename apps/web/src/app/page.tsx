import Link from "next/link";
import { Button } from "@/components/ui/button";
export const runtime = "nodejs";
export default function Page() {
  return (
    <main className="admin-shell">
      <aside>
        <Link href="/" className="wordmark">
          GARANT<span>ESPACE ÉTABLISSEMENTS</span>
        </Link>
        <div className="tenant-placeholder">Établissement non connecté</div>
        <nav aria-label="Navigation de l’administration">
          <span aria-current="page">Vue d’ensemble</span>
          <span>Documents</span>
          <span>Modèles</span>
          <span>Lots d’émission</span>
          <span>Utilisateurs</span>
          <span>Journal d’audit</span>
        </nav>
        <p>Socle local · tâche 01</p>
      </aside>
      <section className="admin-main">
        <header>
          <span>Plateforme de confiance documentaire</span>
          <span className="offline">Non connecté</span>
        </header>
        <div className="admin-content">
          <p className="eyebrow">MISE EN PLACE DU MVP</p>
          <h1>Espace de votre établissement</h1>
          <p className="lead">
            Préparer, émettre et suivre vos documents depuis un espace unique.
            Ce premier écran n’est relié à aucun compte ni aucune donnée.
          </p>
          <div className="notice">
            <strong>Authentification non implémentée</strong>
            <p>
              Les rôles, la double authentification et les accès aux données
              seront ajoutés dans les tâches suivantes. Aucune émission ni
              signature réelle n’est disponible.
            </p>
          </div>
          <div className="admin-cards">
            {[
              [
                "Documents",
                "L’émission et le registre documentaire ne sont pas encore implémentés.",
              ],
              [
                "Modèles",
                "Les modèles versionnés seront disponibles après le socle de sécurité.",
              ],
              [
                "Audit et supervision",
                "Aucun journal ni état de passerelle n’est simulé ici.",
              ],
            ].map(([title, body]) => (
              <article key={title}>
                <span>À implémenter</span>
                <h2>{title}</h2>
                <p>{body}</p>
                <Button disabled>Fonction indisponible</Button>
              </article>
            ))}
          </div>
          <Link className="public-link" href="/v">
            Accéder au shell de vérification publique →
          </Link>
        </div>
      </section>
    </main>
  );
}
