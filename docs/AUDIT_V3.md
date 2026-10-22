# Audit V3 — 22 octobre 2026

Référence GitHub inspectée : `main` à `5bfba5196f7eda7efdd5f5af4e09af8d7f0a9b6c`. La branche distante `work/garant-transversal-v2-20261018` pointe sur le même commit et n'ajoute aucun code ou migration. Branche de travail : `develop/garant-v3-beta`.

La vitrine Vite, ses trois scénarios fictifs et ses six illustrations sont existants. Next, le vérificateur et les workers sont des shells. Les packages métier exportent un état non implémenté. Aucun schéma SQL, Supabase, Auth, Storage, API métier, signature de production ou PDF signé n'existe au départ. Les références V1 présentes spécialisent le document dans les diplômes ; le modèle V3 transversal les remplace. Aucune migration historique à écraser.

Connexion Supabase : liste des projets et organisations consultée, aucun projet GARANT. Deux autres projets visibles ne sont pas ouverts ni modifiés. Création suspendue au choix explicite de l'organisation et de la région demandé au propriétaire, puis contrôle du coût. Aucun coût engagé, aucune migration distante.

Node 24, React 19, Next 16, TypeScript strict et Drizzle existants conservés. Documentation SSR Supabase courante consultée : `proxy.ts`, clients par requête, `getUser` pour confirmation serveur, propagation cookies et en-têtes anti-cache, TOTP AAL2. Versions de registre consultées avant ajout : supabase-js 2.118.0, ssr 0.12.7, CLI 2.121.0, PGlite 0.5.11. Pas de mise à niveau globale sans nécessité.

Plan non destructif : migration additive initiale, tests PostgreSQL isolés avec rôles non propriétaires, configuration Supabase locale, Auth/PKCE/TOTP, activité de session serveur, organisations et habilitations, types versionnés, brouillons et approbations exactes. Ne publier aucune application sur cette branche et ne migrer qu'un projet GARANT explicitement vérifié après tests et revue SQL. Les six protections demeurent obligatoires ; aucune émission ne doit devenir possible avant validation du pipeline de signature PDF indépendant.
