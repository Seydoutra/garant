# Références disponibles pour le MVP GARANT

Ce dossier conserve les demandes originales et les références produites au début du travail. Il ne constitue pas encore le dossier de spécification exhaustive décrit dans le prompt d’exécution.

- `REFERENCE_ORIGINALE.md` : brief technique fourni par le propriétaire du projet.
- `PROMPT_EXECUTION.md` : consigne d’implémenter uniquement la tâche 01.
- `codex/tasks/01-initialiser-le-monorepo-et-la-ci.md` : portée, critères et commandes de la tâche 01, consignés à partir des consignes explicites.
- `tests/fixtures/grt1-reference.json` : vecteurs de référence indépendants, avec seed de test publique, jamais utilisable en production.
- `scripts/generate-reference-vectors.mjs` : générateur Node crypto indépendant, contrôlé contre le test 1 RFC 8032 et mesures du QR. Les packages métier GARANT ne sont pas encore implémentés.

`SPECIFICATION.md`, la migration SQL complète et les tâches 02 à 40 restent à finaliser. Aucune migration n’est déclarée valide ni exécutée dans cette tâche.
