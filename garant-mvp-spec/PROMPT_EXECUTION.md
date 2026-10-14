# GARANT — PROMPT MASTER D’EXÉCUTION POUR CODEX

Tu es l’architecte logiciel et le développeur principal de GARANT.

Travaille directement dans le dépôt : crée et modifie les fichiers,
installe les dépendances autorisées, exécute les tests et livre du code.

Ne réponds pas uniquement par une analyse, une liste de conseils ou
une nouvelle proposition de prompt.


## 1. MISSION ET DOCUMENTS DE RÉFÉRENCE

Construire progressivement le MVP GARANT, une plateforme B2B de
certification documentaire pour les établissements émetteurs en Guinée,
puis en Afrique de l’Ouest francophone.

Le produit doit permettre de générer des documents sécurisés,
vérifiables sur papier, sur le web et par SMS, avec une architecture
portable et sans dépendance obligatoire à un cloud étranger dans
son déploiement souverain.

Le dossier garant-mvp-spec/ contient :

- SPECIFICATION.md :
  architecture et spécification des sections 3 à 11,
  suivies des 40 tâches ordonnées.

- migrations/0001_garant.sql :
  migration SQL candidate complète.

- codex/tasks/ :
  prompts individuels avec critères d’acceptation et commandes
  de vérification.

- tests/fixtures/ et scripts/ :
  vecteurs cryptographiques et contrôles de référence.

- .env.example :
  contrat de configuration sans secrets réels.

- docs/VALIDATION.md :
  portée exacte des vérifications déjà effectuées.

Détermine SPEC_ROOT :
- garant-mvp-spec/ si ce dossier existe ;
- sinon, le dossier contenant ces fichiers.

Interprète les chemins des fichiers de référence relativement à
SPEC_ROOT et les chemins applicatifs relativement à la racine du dépôt.

Lis AGENTS.md s’il existe, la spécification, le catalogue des tâches
et le code existant avant de modifier quoi que ce soit.

Respecte les fonctionnalités déjà présentes. Si une landing page
GARANT existe, conserve-la : le MVP ne doit pas être remplacé par
une simple vitrine.

La spécification livrée n’est ni une application déjà développée,
ni un audit de sécurité.

La migration doit être exécutée sur une base isolée avant d’être
considérée comme validée. Les fixtures de test ne prouvent pas le
fonctionnement du futur code de production.


## 2. STACK À RESPECTER

Monorepo pnpm + Turborepo, TypeScript strict :

- apps/web :
  Next.js App Router.
  Routes de cryptographie et PDF en runtime Node.js, jamais Edge.

- apps/verifier :
  PWA publique autonome et légère.
  Vite + TypeScript, sans dépendances serveur dans son bundle.

- apps/worker :
  traitements asynchrones, imports et génération PDF.

- apps/publisher :
  publication contrôlée des listes signées,
  isolée du serveur web.

- packages/seal :
  encodage, signature et vérification du cachet.
  Compatible Node.js et navigateur.

- packages/pdf :
  génération, éléments visuels et signature des PDF.

- packages/shortcode :
  génération, normalisation et validation des codes courts.

- packages/db :
  schéma, migrations, client et repositories.

Ajoute les packages transverses prévus dans la spécification
lorsqu’ils sont nécessaires, sans multiplier les abstractions inutiles.

Base de données :
PostgreSQL + Drizzle.

Authentification et fichiers :
Supabase Auth et Storage derrière des adaptateurs remplaçables.

Tâches :
pg-boss sur PostgreSQL, sans Redis.

Interface établissements :
Tailwind CSS + shadcn/ui.

Validation :
Zod pour les entrées et la configuration.

Cachets :
@noble/ed25519, @noble/hashes, CBOR/COSE, Base45 et zlib.

PDF :
Playwright/Chromium, sharp, @signpdf/signpdf, node-forge et
signataire CMS conforme au profil retenu.

Vérifie les versions et contrats auprès des sources officielles.
Fige les versions compatibles et conserve le lockfile.

Ne remplace pas une bibliothèque imposée par commodité.
Documente d’abord tout blocage démontré.

Interface et documentation utilisateur : français.
Code, noms techniques et commentaires : anglais.


## 3. FONCTIONNALITÉS OBLIGATOIRES

Implémente les six fonctions de sécurité et leur socle.

F1 — Cachet électronique :
Ed25519, COSE_Sign1, transport GRT1, QR contenant une URL avec
fragment et vérificateur partagé entre Node.js et navigateur.

F2 — Signature PDF :
PDF vectoriel, signature PAdES B-B en dernière étape,
empreinte SHA-256 du fichier final signé.

F4 — Photo :
normalisation JPEG 600 × 800, suppression des métadonnées
personnelles, empreinte liée au cachet et accès public temporaire
contrôlé.

F5 — Code court et SMS :
code contrôlé, vérification web, réception Android,
envoi Nimba et repli Android encadré.

F6 — Sécurité visuelle :
guilloches déterministes et microtexte, présentés comme des
éléments dissuasifs, jamais comme une preuve cryptographique.

F8 — Révocation :
révocation définitive, confirmation forte, publication signée,
date publique et historique de remplacement.

Socle obligatoire :
établissements, utilisateurs, rôles, TOTP, modèles versionnés,
émission unitaire, import CSV/XLSX + ZIP, génération par lots,
idempotence, progression, exports, PWA, supervision et audit.

Hors périmètre :
paiement, WhatsApp, application native, vérification par dépôt de PDF,
horodatage certifié RFC 3161, numéro court opérateur et double
validation métier.


## 4. RÈGLES TECHNIQUES NON NÉGOCIABLES

Applique les corrections et décisions d’architecture de la
spécification.

### Vérification et confiance

Sépare :
- validité cryptographique ;
- identité de l’émetteur ;
- statut métier du document.

Ne promets pas qu’une signature prouve à elle seule la véracité
du diplôme ou du contenu déclaré.

Sans synchronisation récente, ne présente jamais un document comme
actuellement non révoqué sans réserve.

Une révocation déjà connue doit rester visible hors ligne.

Vérifie la signature des listes de confiance et de révocation avec
la racine publique embarquée. Ne fais jamais confiance à une nouvelle
racine simplement parce qu’elle provient d’une réponse HTTP.

### Codes courts

Respecte le profil « Crockford mod37 restreint GARANT » défini
dans la spécification :

- sept symboles aléatoires ;
- rejet des tirages dont le checksum nécessite un symbole
  extérieur à l’alphabet retenu ;
- huitième symbole de contrôle ;
- unicité en base et nouvelle tentative en cas de collision.

Vérifie le checksum avant toute recherche documentaire.

Les contrôles indépendants de sécurité, d’idempotence et de quotas
restent autorisés avant cette recherche.

### QR et impression

Réserve une taille adaptée à la densité du QR, une marge blanche
et un contraste suffisants.

Ne suppose pas que 25 mm suffit à tous les payloads.

Prévois les mesures automatiques et le document de calibration.
Les essais de lecture sur papier et photocopie restent des
validations terrain à effectuer.

### PDF

Valide la conformité PAdES avec un validateur indépendant.

Ne considère pas qu’un simple changement de libellé ou de SubFilter
constitue une preuve de conformité.

Les tests de modification doivent préciser les octets couverts
par la signature et les révisions PDF concernées.

Une révocation GARANT ne modifie pas les PDF déjà téléchargés :
leur statut métier doit être consulté dans le registre.

### Photos

Ne donne pas accès à une photo sur la seule connaissance d’un UUID.

Exige une autorisation temporaire liée au document, obtenue après
présentation d’un cachet vérifié ou d’un code accepté.

Recalcule l’empreinte de la photo reçue et compare-la à celle
du cachet.

### SMS

Hache durablement les numéros des vérificateurs.

Pour permettre une réponse asynchrone, ne conserve le numéro
récupérable que chiffré, avec la courte durée de vie définie.

Aucun numéro en clair dans les logs ou les payloads pg-boss.

Vérifie les contrats réels des fournisseurs :
aucun endpoint, en-tête HMAC ou statut de livraison inventé.

Une réponse ambiguë d’un fournisseur ne doit pas provoquer
un double envoi automatique.

### Souveraineté

Ne présente pas un simple conteneur PostgreSQL comme un remplacement
complet de Supabase Auth et Storage.

Le profil souverain doit inclure les services nécessaires et
documenter leurs dépendances.


## 5. SÉCURITÉ DE L’IMPLÉMENTATION

Aucune clé privée, donnée personnelle ou secret dans :
- le bundle navigateur ;
- les logs techniques ;
- Git ;
- les réponses API.

Utilise les enveloppes AES-256-GCM et les interfaces KeyProvider.

Sépare les clés racine, les clés d’établissement et l’AC PDF.

Applique RLS et contrôles applicatifs.

Les requêtes utilisateurs passent par des rôles PostgreSQL
non propriétaires, sans BYPASSRLS.

Le contexte de session est validé côté serveur et reste local
à la transaction.

Les tests interétablissements doivent utiliser ces vrais rôles,
pas une connexion administrateur.

Authentification interne :
TOTP obligatoire, AAL2, expiration après 30 minutes d’inactivité,
contrôle renforcé pour les opérations sensibles.

Ajoute :
validation Zod, erreurs uniformes, protection CSRF, CSP,
HSTS en production HTTPS, quotas et téléversements bornés.

Refuse :
zip bombs, chemins malveillants et accès réseau arbitraires
depuis les modèles ou le moteur PDF.

Le journal d’audit est en ajout seul et chaîné.
Évite les champs libres contenant des données personnelles.

Ne prétends pas qu’un chaînage seul empêche un administrateur
de base compromis de réécrire tout l’historique.

Toute intégration inachevée doit échouer explicitement.

Les mocks restent dans les tests ou dans un mode démo clairement
séparé. Ils ne doivent jamais être présentés comme une sécurité
de production.


## 6. MÉTHODE D’EXÉCUTION

Suis les 40 tâches de codex/tasks/ dans l’ordre.

Pour chaque tâche :
1. Lis ses références.
2. Implémente les fichiers attendus.
3. Ajoute les tests.
4. Exécute les commandes de vérification.
5. Documente les résultats et les blocages.

Ne coche un critère que sur la base d’un résultat réellement obtenu.

Crée docs/IMPLEMENTATION_STATUS.md avec :
- numéro de tâche ;
- état ;
- fichiers concernés ;
- tests exécutés ;
- résultats ;
- blocages.

Conserve les décisions nouvelles dans docs/DECISIONS.md,
sans dupliquer inutilement la spécification.

Ne me demande pas de choisir une architecture déjà fixée.
Ne demande pas de vrais secrets pour développer :
utilise les fixtures et configurations locales.

Ne te connecte pas à la production.
N’exécute pas de migration destructive.
Ne déploie pas.
N’envoie pas de SMS réel sans autorisation explicite.

Lorsqu’un outil ou identifiant manque, termine ce qui peut être
réalisé localement et documente précisément le contrôle restant.

N’annonce jamais un test réussi s’il n’a pas été exécuté.


## 7. TRAVAIL À EXÉCUTER MAINTENANT

Exécute la tâche 01 :

codex/tasks/01-initialiser-le-monorepo-et-la-ci.md

Inspecte d’abord le dépôt.

Crée ensuite :
- le socle monorepo ;
- les shells des applications ;
- les packages ;
- la configuration TypeScript strict ;
- le lint ;
- les premiers tests ;
- les builds ;
- la CI.

Préserve les fichiers existants utiles et documente les adaptations.

Fournis un premier écran d’administration en français, clairement
non connecté tant que l’authentification et les données ne sont
pas implémentées.

Fournis également un shell public /v, sans faux résultat de
vérification.

N’affiche pas de statistiques inventées ou de bouton laissant croire
qu’un document a été réellement signé.

Les scripts doivent être explicites.

Ne crée pas de commande de test retournant artificiellement
un succès. Une suite future non disponible doit être signalée
comme telle.

La CI de cette première tâche doit exécuter les contrôles
réellement implémentés.

Exécute notamment, lorsque le socle est en place :

pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm build

Termine par :
- les fichiers créés ou modifiés ;
- les commandes exécutées et leurs résultats ;
- la procédure exacte pour démarrer localement ;
- les blocages restants ;
- la prochaine tâche.

Ne passe pas automatiquement à la tâche 02.

Commence maintenant par inspecter le dépôt, puis écris le code
de la tâche 01. Ne livre pas seulement un plan.