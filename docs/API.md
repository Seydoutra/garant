# API V3 — première tranche interne

Contrat OpenAPI : `docs/openapi.json`. Runtime Node.js, JSON, cookies Supabase SSR de l'utilisateur, validation serveur et RPC identiques à celles de l'interface. Pas de secret/service-role dans ce chemin.

| Route                    | Méthode | Effet                                                          |
| ------------------------ | ------- | -------------------------------------------------------------- |
| `/api/health`            | GET     | Configuration présente/absente ; ne prétend pas tester la base |
| `/api/v1/organizations`  | GET     | Organisations autorisées, AAL2                                 |
| `/api/v1/organizations`  | POST    | Création par administrateur GARANT + TOTP récent               |
| `/api/v1/memberships`    | POST    | Habiliter un utilisateur existant dans son organisation        |
| `/api/v1/delegations`    | POST    | Délégation bornée à un type et une date                        |
| `/api/v1/document-types` | POST    | Type et version initiale, schéma validé                        |
| `/api/v1/documents`      | POST    | Document et version brouillon                                  |
| `/api/v1/approvals`      | POST    | Approbation du hash exact par délégataire distinct             |

Les POST exigent `Origin` égal à `APP_URL` et `Content-Type: application/json`. Les retours n'exposent ni requêtes SQL ni messages bruts de PostgreSQL. Erreurs : 400 entrée/opération refusée, 401 session absente/expirée, 403 origine/MFA, 413 corps trop grand, 415 type de contenu, 503 configuration/base indisponible. Une habilitation SQL refusée est volontairement rendue comme une erreur générique sans détail privé. Les RPC restent accessibles par le Data API pour les utilisateurs authentifiés ; elles appliquent elles-mêmes les mêmes autorisations SQL, indépendamment du filtre HTTP.

Les écritures de brouillon utilisent l'unicité de la référence pour éviter le doublon documentaire ; les autres POST ne sont pas encore un contrat d'idempotence externe. Aucun quota externe ni webhook n'est annoncé comme actif. La limite de corps n'est pas un rate limiter ; les protections de trafic applicatives restent à ajouter avant exposition bêta.

`node scripts/demo-api.mjs` est un client de démonstration **de l'API interne à session**, sans accès PostgreSQL direct. Il exige une session autorisée fournie via `GARANT_SESSION_COOKIE`, sans la journaliser. Il n'a pas été exécuté avec une session réelle, faute de projet. Le provisionnement de credentials d'intégration distincts par organisme, la soumission approuvée, le suivi d'émission, les preuves, les webhooks signés et les quotas sont encore à implémenter. Ce client n'est pas présenté comme cette intégration future.

Les routes `/auth/operation`, `/auth/callback`, `/auth/mfa` implémentent les appels Auth/PKCE/TOTP, mais leur réussite réelle avec Supabase n'est pas encore démontrée. Voir `SUPABASE_SETUP.md`.
