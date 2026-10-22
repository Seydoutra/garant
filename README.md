# GARANT V3 — application documentaire en développement

Monorepo pnpm/Turborepo conservé. La vitrine institutionnelle publiée se trouve dans `apps/landing` ; l'application Next dans `apps/web` est développée séparément sur `develop/garant-v3-beta`, **sans déploiement public de V3**.

## État démontré

Socle SQL transversal avec RLS, versions et approbations testées sur PostgreSQL isolé. Interfaces Auth/SSR/TOTP, dashboard et formulaires métier reliés au SDK Supabase et aux RPC. **Les deux migrations sont maintenant appliquées au projet autorisé `knseyxmyfhjqmiroufbm`** : 22 tables sous RLS et quatre buckets privés contrôlés dans le dashboard. Le raccordement de l’application par clé publishable et les tests Auth/TOTP réels restent à terminer. Docker/Podman est absent pour exécuter la pile locale complète.

Aucune émission sécurisée complète, signature PDF PAdES indépendante, photo, SMS ou révocation vérifiable n'est annoncée comme opérationnelle. Le passage à l'état émis reste bloqué. Le premier jalon V3 n'est pas atteint. Les six protections restent dans la feuille de route.

## Démarrage

Node 24, pnpm 11.25.0.

```sh
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm dev:web
```

L'application écoute sur http://127.0.0.1:3000. Sans configuration elle présente un écran explicite et ne simule aucun compte. Copier `.env.example` vers `apps/web/.env.local` après préparation du projet GARANT, sans committer les valeurs. Suivre [la configuration Supabase](docs/SUPABASE_SETUP.md).

`pnpm test:db` exécute les migrations et tests SQL sur PGlite isolé. Ce moteur teste RLS, pas GoTrue ni le transport Storage. La pile complète utilise la CLI officielle (`pnpm exec supabase start`) avec Docker/Podman.

## Organisation

- `apps/web` : Next App Router, Auth SSR, MFA et première tranche documentaire.
- `apps/landing` : vitrine Vite préservée, démonstration fictive et six aperçus explicitement illustratifs.
- `apps/verifier` : shell autonome Vite `/v`, sans vérification cryptographique active.
- `apps/worker`, `apps/publisher` : shells qui refusent le démarrage opérationnel.
- `packages/db` : projection Drizzle du cœur ; migrations SQL officielles dans `supabase/migrations`.
- `packages/seal`, `packages/pdf`, `packages/shortcode` : contrats non opérationnels conservés.
- `docs` : audit, décisions, résultats et limites ; `garant-mvp-spec` : prompts sources V1/V3.

La CI exécute lint, types, tests et builds. Le workflow Pages ne publie la landing que sur `main` ou déclenchement manuel. Aucun déploiement V3 n'est lancé sur la branche de développement.

[Avancement exact](docs/IMPLEMENTATION_STATUS.md) · [Validation](docs/VALIDATION_V3.md) · [Modèle](docs/DATABASE_SCHEMA.md) · [API](docs/API.md) · [Sécurité](docs/SECURITY_CHECKLIST.md)


## Liens publics — bêta publiée

- Vitrine : https://seydoutra.github.io/garant/
- Application : https://garant-app-one.vercel.app/connexion

L’inscription ne donne aucun rôle métier. La confirmation email et la double authentification sont requises ; le rattachement à une organisation relève d’une habilitation. L’émission signée de bout en bout reste en développement. Détails de publication et limites : `docs/PUBLIC_DEPLOYMENT.md`.
