# GARANT Socle MVP

Monorepo local du MVP GARANT, tâche 01. Les interfaces d’administration et de vérification sont des shells **non connectés**. Aucune authentification, connexion métier à la base, signature, génération PDF, révocation ou émission SMS n’est implémentée à cette étape.

La vitrine existante est conservée dans `apps/landing`, avec sa démonstration fictive et une nouvelle présentation institutionnelle. Ses aperçus de dispositifs de sécurité représentent des capacités prévues, pas une application de certification en production.

## Prérequis

Node 24, pnpm 11.25.0. PostgreSQL, Docker et les identifiants Supabase ou Nimba ne sont pas nécessaires à la tâche 01. Le profil souverain complet, Auth, Storage et Docker restent à implémenter dans leurs tâches dédiées ; un PostgreSQL seul ne les remplace pas.

## Installation et vérification

```sh
corepack enable
corepack prepare pnpm@11.25.0 --activate
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

`pnpm test` exécute les tests du socle et les trois scénarios fictifs de la landing. Les suites futures crypto, RLS, PDF, SMS et bout en bout ne sont pas disponibles. Elles ne sont ni simulées ni annoncées comme réussies.

## Démarrer localement

```sh
pnpm dev:web       # Administration : http://127.0.0.1:3000
pnpm dev:verifier  # Shell public : http://127.0.0.1:3001/v
pnpm dev:landing   # Landing : URL affichée par Vite
```

`pnpm dev` lance les trois applications UI ensemble. Le worker et le publisher ne sont pas lancés. Leurs scripts `start` échouent explicitement avec un code 1 tant que les tâches correspondantes ne sont pas implémentées.

La route `/v` de Next indique le lien vers le shell autonome local. La configuration de reverse proxy entre domaines fait partie du déploiement futur.

## Arborescence

```text
apps/
  landing/       Vitrine Vite préservée et démonstration fictive
  web/           Next.js App Router, administration non connectée
  verifier/      Shell public Vite TypeScript, route /v
  worker/        Shell Node TypeScript non opérationnel
  publisher/     Shell Node TypeScript non opérationnel
packages/
  seal/          Contrat non implémenté
  pdf/           Contrat non implémenté
  shortcode/     Contrat non implémenté
  db/            Dépendances Drizzle/pg, aucune connexion
 tests/          Tests réels du socle
 docs/           Décisions et avancement
 garant-mvp-spec/ Références disponibles et tâche 01
```

## Configuration

`.env.example` décrit les variables attendues à terme, sans valeurs secrètes. Seul `APP_MODE=shell` est utilisé dans cette tâche. Une autre valeur est rejetée par Zod. Aucune clé privée n’est requise pour développer ce socle.

Les contenus de la landing et ses paramètres sont dans `apps/landing/src/content.ts`. WhatsApp, e-mail et liens légaux restent non configurés. Les paramètres de la future plateforme ne sont pas connectés à cette vitrine.

## CI et publication

`.github/workflows/ci.yml` installe avec verrou, puis exécute lint, typecheck, tests et builds. Aucune production n’est contactée. Le workflow Pages publie uniquement `apps/landing/dist` à chaque push sur `main`, ou sur déclenchement manuel. La mise à jour GitHub et la publication de la landing institutionnelle ont été demandées le 14 octobre 2026, après la validation locale de la tâche 01. Site : https://seydoutra.github.io/garant/. Les autres applications restent des shells non déployés.

## État exact

Voir `docs/IMPLEMENTATION_STATUS.md` et `docs/VALIDATION.md`. Le dossier de spécification complète évoqué dans le prompt n’était pas présent intégralement au début de cette tâche. Les sources techniques originales et les références disponibles sont conservées ; elles ne sont pas présentées comme une migration validée ou un audit.

La tâche 02 ne doit être entreprise que sur instruction. Elle nécessitera une migration candidate et une base isolée pour ses contrôles.
