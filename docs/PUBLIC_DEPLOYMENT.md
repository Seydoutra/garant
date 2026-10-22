# GARANT — publication du 22 octobre 2026

## Adresses vérifiées

- Nouvelle vitrine : https://seydoutra.github.io/garant/
- Application bêta : https://garant-app-one.vercel.app/connexion
- Santé de l’application : https://garant-app-one.vercel.app/api/health

La nouvelle vitrine remplace effectivement l’ancienne. Workflow Pages `39795552372` réussi ; les fichiers JS `index-B3aMTWhL.js` et CSS `index-B4W2SDrH.css` du nouveau build répondent HTTP 200. Le rendu public et le titre « La confiance. À chaque document. » ont été observés au navigateur.

## Application Vercel

- Espace explicitement autorisé : `contactsmartsell-3371’s projects` (`team_f73bK4t4lCgjxbIw2ufu7fPn`).
- Projet créé : `garant-app` (`prj_KU0o814HJvxTW9GuTBA6RLOdXYjd`).
- Déploiement prêt : `dpl_7r9SskbpT9hw9Xi2j5rDZHsXSP8o`.
- Source applicative : commit `44b594729de32a2912da98d52adc4bdc068cafea`, `apps/web`.
- Runtime Node 24 ; région `dub1` ; framework Next.js ; paquet autonome contenant les sources de l’application, le tsconfig commun et les dépendances verrouillées.

Le projet a été créé via l’import de sources Vercel authentifié. Il n’est pas relié automatiquement à GitHub. Le script `scripts/package-vercel-app.mjs <nouveau-dossier-hors-depot>` prépare un paquet reproductible à partir des seuls fichiers suivis de `apps/web`. La politique pnpm du monorepo doit être conservée dans `pnpm-workspace.yaml` : son omission a fait échouer les deux premiers builds. Le paquet corrigé a passé `pnpm install --lockfile-only --frozen-lockfile --ignore-scripts`, puis le build Vercel a réussi.

Variables de production configurées : `APP_ENV=beta`, `APP_URL=https://garant-app-one.vercel.app`, URL Supabase et clé publishable de `knseyxmyfhjqmiroufbm`. Aucune clé administrative Supabase ni chaîne de connexion privilégiée n’est installée dans l’application.

La protection Vercel n’a pas été réduite. L’alias technique contenant le nom d’équipe reste protégé par SSO ; le domaine de production public attribué par Vercel, `garant-app-one.vercel.app`, fonctionne dans la configuration existante. Les formulaires doivent être utilisés sur ce domaine canonique afin que l’origine et les redirections concordent.

## Supabase Auth

Le Site URL a été enregistré à `https://garant-app-one.vercel.app`. Deux URL exactes autorisées, sans wildcard :

- `https://garant-app-one.vercel.app/auth/callback`
- `https://garant-app-one.vercel.app/auth/callback?next=/reinitialiser-mot-de-passe`

La sauvegarde et la liste de deux URL ont été vérifiées dans le dashboard. Confirmation email et MFA restent requises ; aucun rôle métier n’est attribué à l’inscription. Les comptes techniques des tests antérieurs restent désactivés.

## Vérification de production

`scripts/smoke-public.mjs` a réussi sur le domaine public : santé configurée HTTP 200 ; connexion, inscription et mot de passe oublié HTTP 200 ; dashboard anonyme redirigé vers connexion ; MFA anonyme HTTP 401 ; mauvaise origine HTTP 403 ; identifiants invalides rejetés avec retour canonique `AUTH_FAILED` ; écriture métier anonyme HTTP 401. Aucun email, compte ou document métier n’a été créé par ces contrôles.

La connexion positive et le TOTP contre GoTrue réel restent décrits dans `AUTH_LIVE_VALIDATION.md` : ils ont été validés avant publication avec le build local relié au même projet Supabase. Ils n’ont pas été rejoués avec un compte connecté sur le domaine de production. Le scan manuel du QR, la livraison effective des emails et un parcours documentaire complet restent à valider. Le service d’émission signée reste incomplet.
