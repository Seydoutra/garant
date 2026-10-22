# Reçu d'application distante — GARANT

Projet autorisé : `knseyxmyfhjqmiroufbm`. Organisation Smartsell (`psbojazhqdwdnwpapczp`), région Irlande/eu-west-1, Nano/Free. Aucun autre projet modifié.

## Méthode et précontrôle

Le connecteur MCP refuse toujours l'accès à cette référence. La session Chrome existante est authentifiée et accède au dashboard du projet exact donné par le propriétaire. L'éditeur SQL a servi à inspecter puis appliquer les fichiers versionnés, sans extraction d'une session, d'un token de gestion ou d'un mot de passe.

Avant application : `pg_tables` public/private vide, `storage.buckets` vide, `auth.users` compte 0 et `to_regclass('supabase_migrations.schema_migrations')` NULL. Aucune réconciliation de données existantes nécessaire.

Bundle en transaction : précondition arrêtant l'exécution si des tables applicatives ou un historique existent entre-temps, deux fichiers originaux, historique compatible CLI (version/name/statements), révocation des accès anonymes/authenticated sur cet historique, commit, contrôle. Bundle testé sur PGlite avant application : 22/0/4/2. L'avertissement du dashboard sur l'historique a été résolu par « Run and enable RLS » ; vérification ultérieure `history_rls=true`.

## Fichiers appliqués

- `20261022124419_garant_v3_foundation.sql` — `garant_v3_foundation`
- `20261022124427_garant_v3_private_storage.sql` — `garant_v3_private_storage`

Ces versions et leurs SQL complets sont enregistrés dans `supabase_migrations.schema_migrations`. Ne pas réexécuter le bundle : son précontrôle le refuse à présent. Utiliser de nouvelles migrations additives pour les évolutions suivantes.

## Résultats observés dans le dashboard

| Contrôle SQL | Résultat |
| --- | ---: |
| Tables applicatives public/private | 22 |
| Tables applicatives sans RLS | 0 |
| Buckets privés GARANT | 4 |
| Migrations enregistrées | 2 |
| GRANT métier à anon | 0 |
| GRANT INSERT/UPDATE/DELETE métier direct à authenticated | 0 |
| Buckets publics | 0 |
| RLS sur l'historique | true |
| Utilisateurs Auth, inchangés | 0 |

Requête d'application : `https://supabase.com/dashboard/project/knseyxmyfhjqmiroufbm/sql/86c4cac2-702b-43f7-8f37-916a9c30f6fe`.
Contrôle indépendant : `https://supabase.com/dashboard/project/knseyxmyfhjqmiroufbm/sql/368e1f8d-fe63-4e0c-971c-ff19689aecad`.
Les snippets peuvent nécessiter la session propriétaire ; ils ne constituent pas des endpoints publics. Capture locale hors dépôt : `outputs/garant-supabase-migrations.png`.

## Limites

Aucun utilisateur Auth créé, aucune connexion/TOTP réelle testée, aucun PDF émis, aucune signature PAdES, aucun SMS et aucun parcours documentaire complet démontré. Clé publishable de ce projet non encore renseignée dans l'application locale. Aucun secret réel enregistré. Le bandeau de statut Supabase signalait plusieurs incidents techniques ; les deux exécutions SQL ont néanmoins retourné les résultats ci-dessus. Aucun déploiement public ni dépense supplémentaire.
