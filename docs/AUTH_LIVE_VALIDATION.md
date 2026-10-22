# Raccordement et validation Auth — 22 octobre 2026

Cible exclusive : `knseyxmyfhjqmiroufbm`. Les deux migrations appliquées sont décrites dans `REMOTE_MIGRATION_RECEIPT.md`.

## Résultats observés

- URL et clé publishable du projet configurées dans `apps/web/.env.local`, ignoré par Git, permissions 0600. Aucune clé secrète ou service_role récupérée.
- `/api/health` a répondu avec `configuration: configured`, `database: not_probed`. Ce contrôle ne valide pas une session utilisateur.
- Auth distant `/auth/v1/settings` : HTTP 200, email activé, inscription autorisée, confirmation email requise.
- Inscription avec une adresse de test réservée `example.com` : rejet `email_address_invalid`, sans utilisateur ni session créés.
- Connexion avec des identifiants invalides : rejet distant `invalid_credentials`.
- Une répétition des contrôles HTTP locaux a expiré ; aucun succès de contrôle d’accès HTTP n’est déduit de cette répétition.

## Validation restant à effectuer

Connexion positive, création/validation du facteur TOTP, rejet d’un code erroné, assurance `aal2`, RPC `touch_session` et `my_access`, navigation SSR authentifiée et révocation de session : **non validés sur GoTrue réel**. Les tests SQL locaux ne remplacent pas ces essais.

Le connecteur Supabase ne donne toujours pas accès à cette cible. Le dashboard Chrome est authentifié, mais le contrôle natif s’interrompt et l’utilisateur utilise simultanément Chrome. Aucun compte n’a été provisionné et la confirmation email n’a pas été désactivée.

`scripts/test-auth-live.mjs` est un outil opt-in interactif pour la cible exacte, hors CI. Il génère le mot de passe et le secret TOTP en mémoire et ne les affiche pas. Par défaut il utilise une adresse réservée rejetée par Supabase. Pour poursuivre, fournir une adresse de test contrôlée via `GARANT_LIVE_TEST_EMAIL`, lancer avec un terminal interactif et exécuter `signup` ; confirmer l’adresse par le mécanisme normal avant `login`, `bad-password`, `enroll`, `bad-totp`, `verify`, `logout`. L’inscription envoie un email : ne fournir qu’une adresse autorisée pour ce test. Ne pas utiliser un compte métier existant avec ce mot de passe aléatoire. Aucun privilège organisationnel ou administrateur n’est attribué.
