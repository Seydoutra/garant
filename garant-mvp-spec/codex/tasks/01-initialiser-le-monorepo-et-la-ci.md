# Tâche 01 Initialiser le monorepo et la CI

## Références et portée

Le prompt d’exécution fourni le 14 octobre 2026 est la référence de cette tâche. Le dossier de spécification exhaustive annoncé par ce prompt n’était pas présent intégralement au début de l’exécution : ni `SPECIFICATION.md`, ni migration complète, ni catalogue de 40 prompts. Les fixtures indépendantes produites avant cette tâche ne constituent pas l’implémentation du MVP. Ne pas présenter les références manquantes comme lues ou validées.

## Instructions

1. Inspecter le dépôt ; préserver la landing existante dans `apps/landing`.
2. Créer pnpm workspace + Turborepo et les applications `web`, `verifier`, `worker`, `publisher`.
3. Créer les packages `seal`, `pdf`, `shortcode`, `db`, sans implémenter la tâche 02 ni les fonctions cryptographiques.
4. Activer TypeScript strict ; réserver le runtime Node aux routes serveur.
5. Administration française non connectée, sans faux chiffres ; shell public `/v` sans résultat de vérification.
6. Lint ESLint, contrôles TypeScript, véritables tests du socle et tests de démonstration conservés, builds reproductibles.
7. Versionner le lockfile, fournir la configuration d’exemple, la CI et les documents d’avancement.
8. Adapter le workflow historique de la landing au nouveau chemin ; aucun déploiement automatique ni réel durant cette tâche.

## Critères d’acceptation

- Les quatre applications et les quatre packages demandés existent ; la landing demeure une application distincte.
- `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` réussissent réellement.
- `/` sur le port 3000 affiche un état non connecté ; `/v` sur le port 3001 ne vérifie aucun document.
- Les services futurs refusent explicitement de démarrer une fausse génération ou publication.
- CI : mêmes commandes de contrôle, sans secret ni connexion à la production.
- Aucun démarrage de tâche 02, migration ou SMS réel.

## Vérification

```sh
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm dev:web
pnpm dev:verifier
pnpm dev:landing
```
