# Connexion et double authentification réelles — 22 octobre 2026

Projet exact : `knseyxmyfhjqmiroufbm`. Tests exécutés contre GoTrue et PostgreSQL distants, puis contre le build de production Next.js local (`http://127.0.0.1:3002`) raccordé à cette même cible. Ce document remplace le compte rendu initial bloqué.

## Provisionnement isolé

Deux identités techniques confirmées ont été créées via `auth.admin.createUser({ email_confirm: true })`, sans envoi d’email, sans modification de la confirmation email globale et sans rôle métier. Le premier compte a servi aux tests SDK, le second au parcours HTTP. Tous deux portent `app_metadata.garant_test_account = true` et ont été désactivés par un bannissement réversible après les tests.

- SDK : `7a70e216-3044-423a-a4aa-0a9f53d6f729`.
- HTTP : `adb5dba3-ac6c-44c6-90ec-fd6465cc9894`.

La clé serveur existante a servi uniquement au provisionnement et à la désactivation, dans un processus de test local. Le fichier temporaire privé 0600 a été supprimé immédiatement après lecture. Aucun mot de passe, secret TOTP, jeton ou clé serveur n’est enregistré dans le dépôt ou le compte rendu. L’application et les requêtes utilisateur utilisent toujours la clé publishable et la session utilisateur.

## Résultats SDK distants

| Contrôle | Résultat observé |
| --- | --- |
| Compte confirmé | Créé, confirmation présente |
| Connexion avec mot de passe généré | Succès |
| `touch_session` | Succès, `true` |
| Niveau initial | `aal1` |
| Mauvais mot de passe | `invalid_credentials` |
| Enrôlement TOTP | Succès |
| Code TOTP erroné | `mfa_verification_failed` |
| Code TOTP correct | Succès, `aal2` |
| `my_access` | `active: true`, `recentMfa: true`, `platformAdmin: false` |

La première tentative SDK de déconnexion a retourné une erreur non détaillée par l’outil initial ; elle n’est pas comptée comme un succès. La déconnexion SDK du second essai a réussi, et le parcours HTTP ci-dessous vérifie séparément la fermeture effective de session.

## Résultats HTTP de l’application

| Contrôle | Résultat observé |
| --- | --- |
| `/api/health` | 200, configuration reconnue |
| Dashboard anonyme | 307 vers connexion |
| MFA sans connexion | 401 |
| POST depuis une autre origine | 403 |
| Connexion avec mauvais mot de passe | 303 vers `AUTH_FAILED` |
| Connexion correcte | 303 vers configuration 2FA, cookie émis |
| Dashboard avant MFA | 307 vers configuration 2FA |
| `/auth/mfa`, `begin` | 200, facteur TOTP vérifié attendu |
| Mauvais TOTP via `/auth/mfa` | 400 |
| Bon TOTP via `/auth/mfa` | 200, `verified: true` |
| Dashboard après MFA | 200, espace de travail rendu |
| Déconnexion | 303 vers connexion |
| Dashboard après déconnexion | 307 vers connexion |
| Rejeu de l’ancien cookie après déconnexion | 307 vers connexion, session refusée |
| Déconnexion SDK du second essai | Succès |
| Désactivation des deux comptes de test | Succès |

Le facteur du parcours HTTP est d’abord enrôlé et validé par le SDK public en mémoire ; l’application effectue ensuite une nouvelle connexion et son propre challenge TOTP. Le test ne valide donc pas le scan manuel du QR d’enrôlement dans une application mobile. Aucun privilège d’organisation n’est attribué ; l’espace de travail testé est volontairement sans données métier.

## Reproduction et portée

Outils opt-in hors CI : `scripts/test-auth-live.mjs` et `scripts/test-auth-http-live.mjs`. Ils vérifient la cible et l’environnement de développement avant de fonctionner. Le script HTTP attend un build Next lancé sur le port 3002 avec `APP_URL=http://127.0.0.1:3002`, ainsi qu’un accès administratif temporaire dans `/private/tmp/garant-live-admin-key` (0600). Ne jamais afficher cette clé ni l’ajouter aux variables publiques.

Le contrôle MCP du projet reste refusé ; le dashboard authentifié et l’API serveur ont permis les essais. Aucune migration supplémentaire n’était nécessaire. Les deux migrations distantes existantes sont documentées dans `REMOTE_MIGRATION_RECEIPT.md`.

Vitrine publique existante vérifiée HTTP 200 : https://seydoutra.github.io/garant/ . Elle sert encore la version publiée le 14 octobre, et non la refonte bêta. L’application Next.js authentifiée reste locale ; aucun déploiement public supplémentaire n’a été effectué.
