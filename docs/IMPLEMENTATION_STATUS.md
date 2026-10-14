# État d’implémentation GARANT

Mis à jour le 14 octobre 2026. Socle validé localement. Mise à jour GitHub et publication de la landing demandées ensuite par l’utilisateur ; aucun SMS réel ou migration.

| Tâche | État | Fichiers concernés | Vérifications exécutées | Résultat | Blocages |
| --- | --- | --- | --- | --- | --- |
| 01 | Socle implémenté et validé localement | `apps/*`, `packages/*`, manifests, TypeScript, ESLint, Turborepo, `tests/shells.test.ts`, `.github/workflows/ci.yml`, `.env.example`, README | Installation verrouillée, lint, typecheck, test, build, HTTP local | Installation exit 0 ; lint exit 0 ; 9 contrôles TypeScript et contrôle racine réussis ; 8 tests réussis ; 9 builds réussis ; administration et `/v` HTTP 200 | Dossier de spécification exhaustive initialement incomplet ; CI distante non exécutée |
| 02–40 | Non démarrées | Aucun fichier d’implémentation métier créé | Aucune migration, suite RLS, crypto de production, PDF, SMS ou bout en bout exécutée | Aucun résultat revendiqué | Spécification complète et base isolée nécessaires avant la migration |

## Applications

- `apps/web` : Next App Router, écran d’administration en français non connecté, route `/api/health` en runtime Node avec Zod. `next typegen` précède le contrôle TypeScript afin de générer les types sur une CI propre.
- `apps/verifier` : shell Vite TypeScript autonome, `/v` et `noindex`. Aucun résultat de vérification, scanner ou service worker actif.
- `apps/worker` et `apps/publisher` : shells compilables. Les commandes de démarrage ont été exécutées ; elles refusent explicitement le service avec un exit 1 attendu.
- `apps/landing` : vitrine existante préservée, refonte institutionnelle et six dispositifs illustratifs. TypeScript et build réussis ; captures F1, F2, F4, F5, F6 et F8 enregistrées.

## Adaptations

Le workflow historique Pages pointe désormais vers `apps/landing/dist`. Après la demande de publication du 14 octobre, il démarre sur push vers `main` ou manuellement. Seule la landing est publiée. Le développement Next utilise Webpack + polling après un échec FSEvent démontré sur cet hôte ; son build de production Turbopack réussit.

## Références incomplètes

Le dossier décrit dans le prompt d’exécution n’était pas présent intégralement. La tâche 01 est consignée dans `garant-mvp-spec/codex/tasks/01-initialiser-le-monorepo-et-la-ci.md` à partir des instructions explicites, avec les deux prompts sources conservés. `SPECIFICATION.md`, la migration candidate complète et le catalogue des tâches 02 à 40 restent à finaliser. Les fixtures indépendantes ne valident pas des packages de production encore non implémentés.

## Étape suivante

Tâche 02 : finaliser la référence SQL, puis construire et exécuter le socle PostgreSQL/Drizzle/RLS sur une base isolée. Elle n’a pas été entreprise automatiquement.
