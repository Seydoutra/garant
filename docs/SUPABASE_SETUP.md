# Supabase GARANT — 22 octobre 2026

## Projet distant vérifié et migré

Cible autorisée : `knseyxmyfhjqmiroufbm`, organisation technique `psbojazhqdwdnwpapczp` (Smartsell), région `eu-west-1` (Irlande), instance Nano du plan Free. Le nom affiché dans le dashboard est le nom initial du projet ; il n'a pas été modifié. URL API vérifiée dans le dashboard : `https://knseyxmyfhjqmiroufbm.supabase.co`.

Le connecteur MCP de ce chat reste associé à l'ancien compte et refuse cette référence. L'application Codex n'est pas contrôlable par l'outil de prise en main. L'accès a été obtenu par la session Supabase déjà authentifiée de Chrome, sur la référence exacte désignée par le propriétaire, sans changer de mot de passe ni créer d'accès privilégié.

Inspection avant migration : aucune table dans public/private, aucun bucket, zéro utilisateur Auth, aucune table d'historique Supabase. Les deux migrations déjà versionnées et testées ont été appliquées dans l'éditeur SQL, dans une transaction avec précontrôle d'absence de tables/historique, lock_timeout 5 s et statement_timeout 60 s. Le bundle a été exécuté auparavant sur PostgreSQL PGlite isolé. Aucun reset, suppression ou remplacement de donnée existante.

Résultat distant : **22 tables applicatives, toutes sous RLS ; quatre buckets privés ; deux migrations enregistrées**. L'historique `supabase_migrations.schema_migrations` reprend les versions/noms et SQL des fichiers existants, avec droits révoqués à PUBLIC/anon/authenticated et RLS activé via le dashboard. Une future utilisation CLI doit comparer cet historique avant tout db push, sans réappliquer les deux fichiers.

Contrôles indépendants après application : zéro GRANT métier anonyme, zéro GRANT INSERT/UPDATE/DELETE direct à authenticated, zéro bucket public, historique RLS actif, zéro utilisateur Auth inchangé. Les tests multi-organisations restent les tests locaux ; aucun parcours Auth/TOTP réel n'est déduit de ces contrôles SQL.

Voir `REMOTE_MIGRATION_RECEIPT.md`. L'application locale n'a pas encore reçu de clé publishable pour cette cible. La connexion métier de bout en bout, les URL Auth distantes et les tests de session restent à terminer. Aucune clé secrète récupérée, aucune nouvelle dépense engagée, aucun autre projet modifié et aucun déploiement public.

## Configuration locale

Versions exactes : CLI 2.121.0, supabase-js 2.118.0, SSR 0.12.7. Node 24 existant conservé. Documentation et registre officiels consultés avant installation. La CLI actuelle écrit sa configuration sous `SUPABASE_HOME` ; pour l'environnement restreint de cette exécution :

```sh
export SUPABASE_HOME=/tmp/garant-supabase-home
export DO_NOT_TRACK=1
pnpm exec supabase --version
pnpm exec supabase start
```

`supabase init` et deux commandes `supabase migration new` ont réussi. `supabase start` a échoué : `DockerLifecycleInspectError`, Docker et Podman absents. La pile Auth/PostgREST/Storage locale n'a donc pas été exécutée. Installer et démarrer Docker Desktop ou Podman, puis reprendre `supabase start`. Ne jamais substituer les fixtures PostgreSQL à la validation de cette pile.

Les tests `pnpm test:db` utilisent un moteur PostgreSQL PGlite isolé, avec rôles `anon`/`authenticated` sans BYPASSRLS et un schéma Auth/Storage de test minimal. Ils exécutent réellement le SQL et RLS ; ils ne testent ni GoTrue, ni les e-mails, ni une vraie session TOTP, ni le transfert Storage. Ils ne touchent pas une base distante.

## Raccordement bêta

1. Vérifier nom, référence technique, région, organisation et statut du projet GARANT de développement. Inspecter schéma, migrations, Auth et Storage. Si du code distant existe, le réconcilier avant application. Aucun `db reset` distant.
2. Consulter `pnpm exec supabase link --help`, `db push --help` et `migration list --help` pour la version installée. Lier uniquement la référence GARANT validée, comparer l'historique et examiner le dry-run proposé par la CLI avant toute application. Rejouer d'abord les migrations dans la pile locale isolée ; cette validation complète reste à faire.
3. Renseigner `apps/web/.env.local` à partir de `.env.example`. Utiliser la clé **publishable** actuelle, jamais `secret`/`service_role` dans une variable publique. Aucun secret n'est nécessaire aux compilations.
4. Configurer Auth : URL de l'application bêta, callbacks exacts, confirmation e-mail, SMTP autorisé, minimum 12 caractères, TOTP actif, jetons de cinq minutes. L'expiration par inactivité hébergée peut dépendre du plan ; l'application ajoute un verrou SQL de 30 minutes, indépendamment de cette option. Vérifier les limites du plan avant activation d'une option payante.
5. `DATABASE_URL` est réservé au pooler applicatif futur. `DIRECT_DATABASE_URL` est réservé aux migrations et au provisionnement propriétaire. Utiliser les paramètres TLS et ports fournis par le projet ; ne pas inventer de mot de passe, désactiver TLS ou réutiliser une connexion d'un autre projet. La première tranche utilise le Data API Supabase avec le JWT utilisateur et les RPC SQL, sans clé privilégiée.
6. Créer et confirmer un compte de test dans GARANT. Le premier administrateur est provisionné séparément par un opérateur propriétaire :

```sh
APP_ENV=development node scripts/bootstrap-admin.mjs USER_UUID GARANT-DEVELOPMENT
```

Renseigner aussi `GARANT_SUPABASE_PROJECT_REF` : le script vérifie que l’hôte direct correspond exactement à cette référence, ou à la pile locale au port 54322. Charger `DIRECT_DATABASE_URL` par un mécanisme secret ; ne pas l'écrire dans la ligne de commande ou les journaux. Ce script n'est pas une route HTTP et n'est pas déclenché à l'inscription. Il faut ensuite se connecter et vérifier un TOTP réel. Ne jamais enregistrer les QR/secret TOTP dans une capture ou le dépôt.

7. Vérifier inscription, confirmation, connexion, reset PKCE, TOTP valide/invalide, déconnexion et expiration, création d'organisation et habilitation d'un second compte, puis le scénario A/B avec Storage réel.

## Stockage

Quatre buckets privés sont préparés dans la seconde migration. Un objet n'est lisible que s'il est lié à une annexe ou un PDF autorisé par RLS. Les uploads restent refusés : le contrôle MIME réel, la normalisation des photos, les archives et l'adaptateur souverain ne sont pas encore implémentés. Les PDF n'étant pas émis, aucune URL signée de téléchargement n'est produite. Ne pas confondre création des buckets et validation d'un pipeline documentaire complet.

Références : [SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client), [TOTP](https://supabase.com/docs/guides/auth/auth-mfa/totp), [sessions](https://supabase.com/docs/guides/auth/sessions), [CLI](https://supabase.com/docs/reference/cli/introduction), [Storage](https://supabase.com/docs/guides/storage/security/access-control). Le changelog a été consulté, notamment la suppression annoncée de certains anciens chiffrements TLS le 10 novembre 2026 ; Node 24 est conservé.
