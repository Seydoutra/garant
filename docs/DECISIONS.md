# Décisions d’implémentation

## 14 octobre 2026 Tâche 01

- Le dépôt `Seydoutra/garant` existant est conservé. Sa vitrine Vite est déplacée dans `apps/landing` ; aucune application métier n’est remplacée par la vitrine.
- Les shells métier sont séparés de la landing et de sa simulation locale fictive. Aucun résultat de sécurité réel n’est affiché par `apps/web` ou `apps/verifier`.
- Node 24 est fixé pour le socle et la CI. Les versions publiées ont été vérifiées via les métadonnées officielles npm.
- TypeScript 5.9.3 est conservé : la version stable 7.0.2 publiée dépasse la plage de compatibilité déclarée par `typescript-eslint` (`<6.1.0`). Ce choix maintient un compilateur stable et compatible.
- La PWA autonome utilise Vite + TypeScript sans React ni package serveur. Son shell n’enregistre pas encore de service worker : aucun faux fonctionnement hors ligne ni nouvelle racine non vérifiée n’est accepté.
- `packages/db` déclare Drizzle et pg ; aucune connexion ni migration n’est exécutée dans cette tâche.
- Le worker et le publisher compilent mais quittent avec un code 1 quand on les démarre, car leurs fonctions sont indisponibles. Leurs futures suites ne sont pas simulées par des commandes retournant 0.
- Le composant de bouton et le contrat `components.json` préparent l’intégration shadcn/ui. Le CLI shadcn et son catalogue complet ne sont pas installés.
- Le workflow GitHub Pages historique est conservé et adapté, mais devient manuel. La CI nouvelle effectue des contrôles uniquement. Aucun push ni déploiement n’est effectué pendant cette exécution.
- La refonte institutionnelle de la landing est traitée comme la demande d’interface parallèle : palette claire, bleu institutionnel, accents or, six aperçus de sécurité signalés comme illustratifs. Aucun statut gouvernemental, agrément, partenaire ou certification n’est revendiqué.

## Références officielles

- [Next.js installation](https://nextjs.org/docs/app/getting-started/installation)
- [Turborepo task configuration](https://turborepo.dev/docs/crafting-your-repository/configuring-tasks)
- [pnpm workspaces](https://pnpm.io/workspaces)
- Métadonnées de registre : `https://registry.npmjs.org/<package>/latest` ; versions figées dans les manifests et `pnpm-lock.yaml`.

## Contrats de sécurité réservés aux tâches suivantes

- F5 utilisera le profil Crockford mod37 restreint GARANT demandé : sept caractères aléatoires, checksum calculé, rejet du tirage si le checksum est hors alphabet. Le vecteur de référence donne `GRT-7K4P-92X7` ; `GRT-7K4P-92XQ` n’est pas ce checksum. Aucun générateur de production n’est encore implémenté.
- Le transport GRT1 exige de signer la `Sig_structure` COSE, pas le CBOR métier seul. Les listes publiques devront être vérifiées par une racine embarquée et le publisher sera isolé du serveur web.
- Le générateur de référence indépendant mesure 685 octets d’URL et un QR M version 17 pour son exemple long : 85 modules plus la marge. Le seuil de 0,35 mm par module est une hypothèse de calibration conduisant à 33 mm, pas une lisibilité papier déjà prouvée.
- La signature PDF par défaut de `@signpdf/signer-p12` ne suffit pas à affirmer PAdES B-B. Le code officiel examiné construit les attributs CMS contentType, signingTime et messageDigest ; un signataire conforme et une validation indépendante devront être réalisés. RSA 3072 est retenu pour le profil node-forge ; aucun résultat Adobe ou audit PAdES n’est revendiqué.
- SMS Gateway Android documente `X-Signature`, `X-Timestamp` et un HMAC-SHA256 sur `raw_body || timestamp`. Ce contrat réel sera testé, sans inventer un en-tête. Les contrats Nimba n’ont pas été suffisamment extraits pour programmer un envoi ; l’adaptateur reste absent.
- Les numéros de vérificateurs seront hachés durablement ; une réponse asynchrone ne pourra utiliser que leur forme chiffrée à durée de vie courte, jamais un numéro clair dans pg-boss ou les logs. Un délai réseau ambigu ne doit pas déclencher un second SMS automatique.
- Les politiques RLS doivent être testées avec des connexions non propriétaires, sans BYPASSRLS. Aucun test d’isolation n’a encore été exécuté.
- Le chaînage du journal détectera certaines altérations ; il ne protège pas seul contre un administrateur compromis qui réécrit l’historique. Des points de contrôle externes seront nécessaires.

Sources : [COSE RFC 9052](https://www.rfc-editor.org/rfc/rfc9052.html), [Crockford](https://www.crockford.com/base32), [signataire P12 officiel](https://github.com/vbuch/node-signpdf/blob/develop/packages/signer-p12/src/P12Signer.js), [SMS Gateway Android](https://docs.sms-gate.app/features/webhooks/), [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).

- Le build Next Turbopack a réussi, mais le serveur de développement a rencontré `unable to start FSEvent stream` sur cet hôte. Le script de développement utilise donc le mode Webpack officiel et le polling Watchpack, sans modifier le runtime de production. Les types des routes sont générés par `next typegen` avant le contrôle TypeScript pour une CI propre sans dossier `.next` préexistant.
