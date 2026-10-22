# État d’implémentation GARANT

Mis à jour le 14 octobre 2026. Socle validé localement. Mise à jour GitHub et publication de la landing demandées ensuite par l’utilisateur ; aucun SMS réel ou migration.

| Tâche | État                                  | Fichiers concernés                                                                                                                           | Vérifications exécutées                                                              | Résultat                                                                                                                                                     | Blocages                                                                              |
| ----- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| 01    | Socle implémenté et validé localement | `apps/*`, `packages/*`, manifests, TypeScript, ESLint, Turborepo, `tests/shells.test.ts`, `.github/workflows/ci.yml`, `.env.example`, README | Installation verrouillée, lint, typecheck, test, build, HTTP local                   | Installation exit 0 ; lint exit 0 ; 9 contrôles TypeScript et contrôle racine réussis ; 8 tests réussis ; 9 builds réussis ; administration et `/v` HTTP 200 | Dossier de spécification exhaustive initialement incomplet ; CI distante non exécutée |
| 02–40 | Non démarrées                         | Aucun fichier d’implémentation métier créé                                                                                                   | Aucune migration, suite RLS, crypto de production, PDF, SMS ou bout en bout exécutée | Aucun résultat revendiqué                                                                                                                                    | Spécification complète et base isolée nécessaires avant la migration                  |

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

# Reprise V3 — 22 octobre 2026

La section du 14 octobre ci-dessus est historique. Le prompt V3 autorise maintenant le développement des phases suivantes sur une branche dédiée ; le premier jalon fonctionnel complet n'est **pas atteint**.

| Phase         | Résultat                                                                                                                                                                                               | Limite démontrée                                                                                               |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| 1 Audit       | Dépôt/main et branche V2 inspectés ; références lues ; organisation/projets Supabase découverts ; plan non destructif écrit                                                                            | Aucun projet GARANT présent ; choix organisation/région et coût à valider                                      |
| 2 Base/Auth   | Deux migrations additives, RLS et Storage privés, clients SSR, connexion/inscription/reset/PKCE, TOTP, session serveur, dashboard relié aux requêtes réelles ; premier administrateur hors inscription | Auth/Storage réels et base bêta non connectés ; Docker/Podman absent ; validations distantes non exécutées     |
| 3 Métier      | Types configurables, trois modèles de départ, brouillons, délégations, approbation de version exacte et journalisation codés et SQL testés                                                             | Émission/PDF/QR/téléchargement/vérification/révocation de bout en bout non fonctionnels ; état émis verrouillé |
| 4 Compléments | Contrats initiaux conservés et feuille de route maintenue                                                                                                                                              | Imports, worker pg-boss, photos, SMS, hors ligne, intégrations externes et Docker souverain non implémentés    |
| 5 Validation  | Contrôles locaux et tests SQL/Zod, rendu navigateur déconnecté vérifié                                                                                                                                 | Aucun test GoTrue/TOTP réel, PAdES, SMS ou parcours complet revendiqué                                         |

Les six protections F1/F2/F4/F5/F6/F8 restent obligatoires. Les packages de cryptographie/PDF/code court et workers non opérationnels ne sont pas marqués comme implémentés. Le vérificateur public reste le shell précédent.

Voir `AUDIT_V3.md`, `VALIDATION_V3.md`, `SUPABASE_SETUP.md`, `DATABASE_SCHEMA.md`, `API.md`, `openapi.json`, `SECURITY_CHECKLIST.md`. Aucune donnée de démonstration n'a été injectée dans une base distante. Les fixtures des tests sont isolées et ne sont pas affichées dans le dashboard.

Validation finale locale V3 : `pnpm lint` exit 0, `pnpm typecheck` exit 0 (9 packages et contrôle racine), `pnpm test` **38 tests réussis dans 4 fichiers, dont 26 tests PostgreSQL/RLS**, `pnpm build` exit 0 (9 builds). `git diff --check` réussi. Aucun succès distant Auth, Storage ou PAdES n'est déduit de ces résultats.

## Cible Supabase précisée par le propriétaire

Projet existant désigné : `knseyxmyfhjqmiroufbm`. L'accès via le connecteur actuel est refusé ; la connexion au compte propriétaire doit être rétablie. La demande initiale de création est remplacée par l'inspection de cette cible existante. Schéma et environnement de ce projet non encore vérifiés ; aucune migration distante.

## Migrations distantes appliquées sur la cible autorisée

L'accès navigateur au projet `knseyxmyfhjqmiroufbm` a permis l'inspection puis l'application des deux migrations existantes, sans reset. Résultats SQL distants : 22 tables public/private, zéro sans RLS, quatre buckets privés, deux migrations enregistrées. Vérification indépendante : aucun GRANT métier anonyme, aucune écriture directe authenticated, aucun bucket public ; utilisateurs Auth inchangés (0).

Le refus du connecteur MCP demeure, mais ne décrit plus l'état de la base : les migrations sont réellement appliquées via le dashboard autorisé. Auth/MFA réels, raccordement de la clé publishable et premier parcours d'émission restent non validés. Voir `REMOTE_MIGRATION_RECEIPT.md`.


## Raccordement local et nouvelle vitrine

La clé publishable de la cible est maintenant configurée localement, hors Git. Auth distant répond et refuse des identifiants invalides ; aucune connexion positive ni TOTP réel validé. Voir `AUTH_LIVE_VALIDATION.md` pour les résultats et blocages exacts.

La vitrine a été reconstruite selon la structure Lamosa demandée, avec visuels propres et six dispositifs illustratifs. Contrôles desktop/mobile et premières interactions exécutés ; voir `LANDING_REDESIGN.md`. La refonte reste sur la branche bêta, sans publication publique.
