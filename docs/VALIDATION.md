# Validation locale du socle GARANT

Date : 14 octobre 2026. Node 24.19.0 ; pnpm 11.25.0. Les versions effectives des dépendances sont verrouillées dans `pnpm-lock.yaml`.

## Commandes réellement exécutées

| Commande | Résultat final |
| --- | --- |
| `pnpm install --frozen-lockfile` | Exit 0 ; verrou vérifié ; scripts natifs esbuild, sharp et unrs-resolver autorisés explicitement |
| `pnpm lint` | Exit 0, après configuration du chemin Next dans le monorepo |
| `pnpm typecheck` | Exit 0 ; neuf applications/packages, puis tests et configuration racine ; génération des types Next incluse |
| `pnpm test` | Exit 0 ; deux fichiers, huit tests réussis |
| `pnpm build` | Exit 0 ; neuf builds réussis, dont Next App Router, deux applications Vite et les shells/packages TypeScript |
| `pnpm dev:web` | Fonctionne en Webpack avec polling ; échec initial du mode Turbopack FSEvent documenté et corrigé |
| `pnpm dev:verifier` | Serveur local disponible sur le port 3001 |
| `pnpm --filter @garant/worker start` | Exit 1 attendu ; message explicite de service non implémenté |
| `pnpm --filter @garant/publisher start` | Exit 1 attendu ; message explicite de service non implémenté |

## Contenu des huit tests

Cinq tests du socle : état public sans vérification, indisponibilité cryptographique explicite, réponse de santé non connectée, rejet du mode non implémenté `production`, acceptation du shell sans secret. Trois tests de la simulation fictive conservée : valide, révoqué, introuvable. Aucune suite future n’a été remplacée par un succès artificiel.

## Contrôles locaux HTTP et UI

- `http://127.0.0.1:3000/` : HTTP 200, écran d’administration non connecté.
- `/api/health` : `mode=shell`, `authentication=not_implemented`, `database=not_connected`.
- `http://127.0.0.1:3001/v` : HTTP 200, shell public sans résultat de vérification.
- Landing institutionnelle observée dans le navigateur intégré ; six aperçus ont été ouverts, leur code F1/F2/F4/F5/F6/F8 et le message « FONCTION NON IMPLÉMENTÉE » confirmés avant capture.
- Aucun débordement horizontal observé en DOM à 375, 390, 768, 1024 et 1440 px sur la nouvelle landing. Ce contrôle initial a utilisé une copie exacte des sources de landing et les dépendances de la version précédente ; les six captures finales viennent du serveur du monorepo.
- Les captures de dispositifs montrent des interfaces illustratives, pas une authentification réelle ni un moteur cryptographique en production.

## Résolution des problèmes rencontrés

Les premières installations ont échoué sur des métadonnées npm incohérentes et des délais de téléchargement. La famille `typescript-eslint` est fixée à 8.70.1 ; TypeScript 5.9.3 et ESLint 9.39.1 sont compatibles avec cette famille. ESLint 9.39.1 est signalé déprécié par npm : la migration à une famille ESLint plus récente devra être testée avant mise en production. La dernière installation verrouillée a réussi. Le script natif unrs-resolver a été déclaré explicitement, sans commande interactive simulée.

Un premier aperçu temporaire après déplacement des anciens node_modules a rencontré des erreurs de résolution React et de types R3F. Les contrôles finaux utilisent les dépendances fraîchement installées du monorepo ; les contrôles TypeScript et le build de la landing y réussissent.

Le mode de développement Turbopack a échoué avec `unable to start FSEvent stream` ; Webpack avec polling fonctionne. Le build de production Turbopack réussit. Le générateur `next typegen` prépare les types de routes avant typecheck ; le fichier Next généré `next-env.d.ts` n’est pas suivi dans Git.

## Limites précises

La CI GitHub est écrite mais n’a pas été exécutée à distance. Aucun push ou déploiement n’a été lancé. Aucun PostgreSQL, RLS, Supabase Auth/Storage, TOTP, chiffrement d’enveloppe, signataire PDF, registre métier, QR signé de production, service worker, passerelle SMS, audit chaîné ni profil Docker souverain n’est implémenté ou validé par cette tâche.

Le fragment 3D de la landing reste volumineux (environ 883 ko avant compression, 239 ko gzip), chargé à la demande sur les appareils éligibles. Aucun score Lighthouse, audit WCAG complet ni test terrain papier/photocopie n’est revendiqué. Les mesures cryptographiques de référence ne prouvent pas le fonctionnement des futurs packages de production.
