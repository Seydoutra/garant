# Validation V3 — 22 octobre 2026

Branche de développement : `develop/garant-v3-beta`. Référence initiale `5bfba51`. Aucun déploiement de V3 ni migration distante.

## Commandes réellement exécutées

- `git fetch origin` : réussi après activation du réseau. Branche V2 distante inspectée, même commit que main.
- Connecteur `list_projects`, `list_organizations` : réussi, aucun projet GARANT.
- `pnpm --filter @garant/web add -E @supabase/ssr@0.12.7 @supabase/supabase-js@2.118.0` : réussi.
- `pnpm add -DwE supabase@2.121.0 @electric-sql/pglite@0.5.11` : réussi. Contrôles de lockfile exécutés ; avertissement de support ESLint 9 existant, pas de mise à niveau globale effectuée.
- `supabase init`, `supabase migration new garant_v3_foundation`, `supabase migration new garant_v3_private_storage` : réussis, CLI 2.121.0 avec configuration isolée `SUPABASE_HOME` et `DO_NOT_TRACK=1`.
- `supabase start` : échec explicite `DockerLifecycleInspectError`, Docker/Podman absent. Aucun résultat de pile complète revendiqué.
- `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` : exécutés ; les erreurs de résolution de chemin dans la route health et de typage MFA rencontrées initialement ont été corrigées. Résultat final consigné dans l'état d'implémentation.
- `pnpm dev:web` : serveur Next prêt sur 127.0.0.1:3000.
- HTTP : `/api/health` 200 (`configuration:missing`, `database:not_probed`) ; `/dashboard` 307 vers connexion ; POST organisation sans configuration 503 (`SUPABASE_NOT_CONFIGURED`).
- Navigateur : `/connexion` rendu et bouton désactivé avec message explicite de configuration manquante. Console navigateur sans erreur au contrôle. Largeur DOM 1280/1280 sur ordinateur et 390/390 sur mobile, sans débordement horizontal. Capture hors dépôt : `outputs/garant-v3-connexion.png`.

## Portée des tests

La suite PostgreSQL exécute les deux migrations sur un moteur PGlite réel et des fixtures Auth/Storage minimales, puis les politiques avec un rôle non propriétaire sans BYPASSRLS. Les identités/JWT de cette suite sont des fixtures de test ; aucun test d'inscription, de délivrance JWT, de TOTP ou de réseau Storage réel n'est déduit de ces tests.

Tests de la vitrine fictive conservés. Tests de validation Zod ajoutés. Le reste du parcours d'émission ne possède pas encore ses suites de signature/PDF/SMS/worker/bout en bout ; elles ne sont pas présentées comme réussies.

## Reproduction

```sh
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm dev:web
```

Après installation Docker et configuration Supabase dédiée : suivre `SUPABASE_SETUP.md`, puis exécuter les scénarios Auth/MFA/Storage réels avant de marquer le premier jalon atteint.

Résultat final : lint et TypeScript exit 0 ; **38 tests réussis** (26 PostgreSQL/RLS, 4 validation, 5 garde-fous/configuration, 3 démonstration fictive de la vitrine) ; **9 builds réussis**. La migration a été rejouée depuis une base PGlite vierge à chaque exécution de la suite, sans réinitialisation distante. Les dernières modifications ont été vérifiées après ajout du refus de lecture privée à AAL1.
