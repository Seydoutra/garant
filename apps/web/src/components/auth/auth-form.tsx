import Link from "next/link";
import { isConfigured } from "@/lib/config";
const errors: Record<string, string> = {
  SUPABASE_NOT_CONFIGURED:
    "La connexion à Supabase GARANT n’est pas encore configurée.",
  AUTH_FAILED:
    "Connexion impossible. Vérifiez vos identifiants et la confirmation de votre adresse.",
  INVALID_INPUT:
    "Vérifiez les champs. Le mot de passe doit contenir au moins 12 caractères.",
  SESSION_EXPIRED:
    "Votre session a expiré après 30 minutes d’inactivité. Reconnectez-vous.",
  DATABASE_UNAVAILABLE:
    "La base GARANT est indisponible ou ses migrations ne sont pas appliquées.",
  CALLBACK_FAILED: "Ce lien est expiré ou invalide. Demandez un nouveau lien.",
};
export function AuthForm({
  mode,
  error,
  message,
}: {
  mode: "login" | "signup" | "reset" | "update-password";
  error?: string | undefined;
  message?: string | undefined;
}) {
  const titles = {
    login: "Connexion à votre espace",
    signup: "Créer votre compte",
    reset: "Retrouver votre accès",
    "update-password": "Nouveau mot de passe",
  };
  const ready = isConfigured();
  return (
    <main className="auth-page">
      <section className="auth-story">
        <Link href="/" className="wordmark">
          GARANT<span>CONFIANCE DOCUMENTAIRE</span>
        </Link>
        <p className="eyebrow">ESPACE ORGANISATIONS</p>
        <h1>
          La confiance se construit.
          <br />
          La preuve se vérifie.
        </h1>
        <p>
          Préparez et suivez les documents de votre organisation dans un espace
          à accès contrôlé.
        </p>
        <small>Accès nominatif · Double authentification · Traçabilité</small>
      </section>
      <section className="auth-panel">
        <div>
          <span className="eyebrow">GARANT · APPLICATION BÊTA</span>
          <h2>{titles[mode]}</h2>
          <p>
            {mode === "signup"
              ? "L’inscription ne donne aucun droit sur une organisation. Un administrateur doit vous habiliter."
              : "Utilisez votre adresse professionnelle et votre mot de passe."}
          </p>
          {!ready && (
            <div className="notice" role="status">
              Connexion Supabase GARANT en attente de configuration. Aucun
              compte ni donnée n’est simulé.
            </div>
          )}
          {error && (
            <p role="alert" className="form-error">
              {errors[error] ??
                "Accès indisponible. Réessayez ou contactez votre administrateur."}
            </p>
          )}
          {message && (
            <p role="status" className="notice">
              {message === "PASSWORD_UPDATED"
                ? "Mot de passe modifié. Connectez-vous à nouveau."
                : "Si la demande est autorisée, vous recevrez un e-mail. Vérifiez votre messagerie."}
            </p>
          )}
          <form action="/auth/operation" method="post">
            <input type="hidden" name="operation" value={mode} />
            {mode !== "update-password" && (
              <label>
                Adresse e-mail
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                />
              </label>
            )}
            {mode !== "reset" && (
              <label>
                Mot de passe
                <input
                  type="password"
                  name="password"
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                  minLength={12}
                  maxLength={128}
                  required
                />
              </label>
            )}
            <button className="primary" disabled={!ready}>
              {mode === "login"
                ? "Se connecter"
                : mode === "signup"
                  ? "Créer mon compte"
                  : mode === "reset"
                    ? "Recevoir le lien"
                    : "Enregistrer le mot de passe"}
            </button>
          </form>
          <nav className="auth-links">
            <Link href="/connexion">Connexion</Link>
            <Link href="/inscription">Créer un compte</Link>
            <Link href="/mot-de-passe-oublie">Mot de passe oublié</Link>
          </nav>
        </div>
        <small>
          Un document signé n’est pas automatiquement une déclaration vraie.
        </small>
      </section>
    </main>
  );
}
