# GARANT V3 — PROMPT MASTER CODEX
## Développement du SaaS transversal et intégration Supabase

### 1. TON RÔLE ET TA MISSION

Tu es un architecte logiciel senior, développeur full-stack, ingénieur PostgreSQL/Supabase et spécialiste de la sécurité applicative et cryptographique.

Tu travailles sur le projet **GARANT**, une plateforme SaaS de sécurisation, d'émission, de traçabilité et de vérification documentaire.

**Dépôt GitHub :**
https://github.com/Seydoutra/garant

**Vitrine actuelle :**
https://seydoutra.github.io/garant/

Ta mission est de poursuivre le développement existant jusqu'à obtenir une première application bêta réellement fonctionnelle, avec une base de données PostgreSQL sur Supabase, une authentification opérationnelle et un parcours complet d'émission et de vérification.

Tu dois écrire du code, créer les migrations, configurer l'application, exécuter les tests et documenter les résultats.

Ne te limite pas à proposer une architecture ou à produire du code fictif.

N'annonce jamais qu'une fonctionnalité est opérationnelle sans l'avoir testée.

---

### 2. VISION DU PRODUIT

GARANT doit devenir une infrastructure transversale de confiance documentaire.

Elle permet aux organisations privées et publiques de sécuriser les documents relevant de leurs compétences.

Elle doit pouvoir être utilisée de trois manières :

1. **SaaS autonome :** une organisation crée, approuve, signe et distribue ses documents directement dans GARANT.
2. **Service intégré :** un logiciel externe transmet des documents approuvés et utilise les services GARANT via API.
3. **Déploiement souverain :** l'application peut être exploitée sur une infrastructure dédiée, notamment pour les futures intégrations à l'administration publique guinéenne.

Le produit ne doit être spécialisé ni dans les diplômes, ni dans les attestations, ni dans un ministère.

Les documents peuvent concerner :
- une personne ;
- une organisation ;
- un projet ;
- un équipement ;
- un bien immobilier ;
- un dossier ;
- une correspondance administrative ;
- tout autre objet défini par un schéma documentaire autorisé.

GARANT ne remplace pas les registres officiels, les administrations compétentes ou les systèmes métier existants.

Il apporte une couche de confiance, d'intégrité, de vérification, de traçabilité et d'interopérabilité.

Un document signé n'est pas automatiquement une déclaration vraie.

---

### 3. CONSERVATION DU PROJET EXISTANT

Avant toute modification :

1. Inspecte intégralement le dépôt.
2. Lis le README, AGENTS.md s'il existe, le journal d'implémentation et les décisions techniques.
3. Inspecte les applications et packages existants.
4. Identifie les fonctionnalités réellement opérationnelles.
5. Consulte les spécifications GARANT déjà présentes.
6. Vérifie les versions des dépendances et leur compatibilité.

Conserve :
- la vitrine actuelle ;
- l'identité visuelle GARANT ;
- le monorepo pnpm/Turborepo ;
- les packages existants ;
- les configurations fonctionnelles ;
- les travaux précédents encore pertinents.

Si le dossier de spécifications V2 est présent, utilise-le comme référence, mais applique la présente version V3 en cas de contradiction.

N'écrase pas les migrations précédentes.

Travaille dans une branche de développement dédiée, sans déployer automatiquement en production.

---

### 4. STACK TECHNIQUE

Conserve prioritairement :

**Front-end :**
- Next.js App Router ;
- React ;
- TypeScript strict ;
- Tailwind CSS ;
- shadcn/ui.

**Back-end :**
- Next.js Route Handlers en runtime Node.js ;
- validation Zod ;
- services métier clairement séparés ;
- contrats API documentés.

**Base de données :**
- Supabase PostgreSQL ;
- Drizzle ORM ;
- migrations SQL versionnées ;
- Row Level Security ;
- tests SQL d'isolation.

**Authentification :**
- Supabase Auth ;
- e-mail et mot de passe ;
- TOTP obligatoire avant toute opération interne sensible ;
- gestion des sessions avec @supabase/ssr, selon la documentation courante.

**Stockage :**
- Supabase Storage ;
- buckets privés ;
- accès temporaire contrôlé ;
- adaptateurs permettant un futur stockage souverain.

**Traitements :**
- pg-boss ;
- worker Node.js ;
- traitements idempotents.

**Sécurisation :**
- @noble/ed25519 et @noble/hashes ;
- COSE_Sign1 ;
- CBOR ;
- Base45 ;
- SHA-256 ;
- Playwright pour les PDF ;
- signature PAdES B-B avec validation indépendante ;
- sharp ;
- génération QR ;
- journaux d'audit.

Consulte les documentations officielles actuelles avant de figer les versions.

---

### 5. CONFIGURATION SUPABASE — PRIORITÉ IMMÉDIATE

Je souhaite une base Supabase réellement opérationnelle pour GARANT.

#### 5.1 Découverte du projet

Vérifie la connexion Supabase disponible et découvre les projets auxquels le compte connecté donne accès.

Cherche un projet explicitement consacré à GARANT.

**Ne modifie jamais un autre projet Supabase**, notamment OBTURA ou GRS Vision.

Si le projet GARANT existe :
- relève son identifiant technique ;
- examine ses tables ;
- examine son schéma ;
- vérifie Auth et Storage ;
- identifie les migrations présentes ;
- identifie les éventuelles données existantes ;
- relève les problèmes de configuration.

S'il n'existe pas :
- crée un projet nommé `GARANT` dans l'organisation Supabase autorisée, si l'outil disponible et les droits le permettent ;
- choisis la région avec le propriétaire du projet, en tenant compte de la latence, de la conformité et des possibilités d'hébergement ;
- vérifie le coût et les limites du projet avant toute création facturable ;
- n'engage aucune dépense supplémentaire sans autorisation explicite.

Si la création ou la connexion est impossible, poursuis le développement local, prépare les migrations et indique exactement l'action nécessaire. Ne prétends pas que la base distante est configurée.

#### 5.2 Configuration des environnements

Prévois :
- développement local ;
- Supabase distant de développement/bêta ;
- production future.

Ne mélange pas les environnements.

Crée un `.env.example` complet.

Prévois notamment :

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
DATABASE_URL=
DIRECT_DATABASE_URL=
APP_URL=
VERIFY_URL=
APP_ENV=development
MASTER_ENCRYPTION_KEY=
VISUAL_SECRET=
PHONE_HMAC_SECRET=
```

Adapte les noms exacts aux besoins du code et aux versions courantes du SDK.

La clé publique de connexion Supabase peut être utilisée côté client ; les clés secrètes, la connexion PostgreSQL privilégiée et les clés de signature restent exclusivement côté serveur.

Ne stocke jamais de secrets réels dans Git, les logs, les captures ou les réponses de l'application.

Vérifie la distinction entre connexion PostgreSQL directe, pooler et migrations.

#### 5.3 Migrations

Utilise le workflow officiel Supabase CLI.

- Initialise ou réutilise `supabase/`.
- Inspecte les migrations existantes.
- Si un projet distant possède déjà un schéma, réconcilie-le avant toute nouvelle migration.
- Crée des migrations versionnées.
- Teste les migrations sur une base isolée.
- Exécute les contrôles RLS.
- Vérifie les contraintes, index et références.
- Exécute une migration distante seulement après examen de son effet et validation du projet cible.

N'utilise jamais une réinitialisation destructive sur une base distante existante.

Ne supprime aucune table ou donnée pour simplifier le développement.

---

### 6. MODÈLE DE DONNÉES TRANSVERSAL

Conçois un schéma PostgreSQL normalisé et extensible.

Tables ou équivalents attendus :

**Identités et organisations**
- organizations
- organization_units
- user_profiles
- memberships
- roles
- permissions
- role_permissions
- user_delegations

**Configuration documentaire**
- document_types
- document_type_versions
- document_schemas
- document_templates
- template_versions
- validation_policies
- approval_steps

**Documents et émissions**
- documents
- document_versions
- document_subjects
- document_attachments
- document_approvals
- issuance_requests
- document_seals
- document_signatures
- document_status_events

**Confiance et vérification**
- issuer_keys
- pdf_certificates
- trust_list_versions
- revocation_list_versions
- verification_tokens
- verification_events
- document_relationships

**Imports, intégrations et exploitation**
- batches
- batch_items
- integration_clients
- integration_credentials
- webhook_subscriptions
- integration_events
- sms_gateways
- sms_messages
- rate_limits
- audit_logs

Utilise des noms cohérents avec le dépôt existant ; ne crée pas inutilement des doublons.

#### Règles essentielles

Chaque document appartient à une organisation émettrice.

Un document possède :
- un identifiant unique ;
- un type de document ;
- une référence de l'organisme ;
- une ou plusieurs versions ;
- un statut documentaire ;
- une politique de confidentialité ;
- des preuves de sécurisation ;
- des événements de cycle de vie.

Le contenu métier peut être structuré en JSONB validé par un schéma versionné.

Les données personnelles ne doivent pas être recopiées sans nécessité dans plusieurs tables.

Une photo est facultative.

Les annexes disposent de leurs propres empreintes.

Une version finalisée et signée est immuable.

Les remplacements et changements de statut produisent de nouveaux événements.

Sépare strictement :
- intégrité cryptographique ;
- identité et habilitation de l'émetteur ;
- statut documentaire ;
- statut métier communiqué par la source ;
- disponibilité et fraîcheur de la vérification.

Les informations confidentielles ne doivent pas être exposées par défaut via les API publiques.

Ajoute les index, clés étrangères, contraintes d'unicité et mécanismes d'idempotence.

---

### 7. ROW LEVEL SECURITY ET CONTRÔLE D'ACCÈS

Active RLS sur toutes les tables appropriées exposées par Supabase.

Implémente les contrôles pour :
- super administrateur GARANT ;
- administrateur d'organisation ;
- responsable habilité ;
- émetteur ;
- vérificateur public.

Un utilisateur ne doit accéder qu'aux données des organisations et services auxquels il est autorisé.

Ne fonde jamais les autorisations sur des métadonnées utilisateur modifiables par le client.

Ne considère pas `TO authenticated` comme une autorisation suffisante.

Les politiques UPDATE doivent protéger les anciennes et nouvelles valeurs.

Évite les fonctions SECURITY DEFINER privilégiées sauf justification et encadrement stricts.

Vérifie les vues, fonctions, permissions SQL et politiques Storage.

Ne fais pas passer toutes les opérations métier par une connexion `service_role` contournant RLS.

Pour les opérations nécessitant un service serveur privilégié, utilise une frontière explicite avec autorisation applicative vérifiée et tests dédiés.

Ajoute des tests où :
- l'organisation A ne peut lire les documents de B ;
- A ne peut modifier les documents de B ;
- un émetteur ne peut signer au-delà de sa délégation ;
- un utilisateur non autorisé ne peut révoquer ;
- un vérificateur public ne peut accéder aux fichiers privés.

---

### 8. AUTHENTIFICATION FONCTIONNELLE

Construis de véritables écrans :

- `/connexion`
- `/inscription`
- `/mot-de-passe-oublie`
- `/auth/callback`
- `/configuration-2fa`
- `/dashboard`

L'inscription publique ne doit pas attribuer automatiquement des privilèges élevés.

Prévois une procédure sécurisée de création du premier administrateur GARANT, distincte de l'inscription publique.

Après connexion :
- vérifie la session côté serveur ;
- détermine les organisations autorisées ;
- vérifie le niveau d'assurance MFA ;
- redirige vers l'espace adéquat ;
- applique les contrôles de rôle.

TOTP obligatoire pour les comptes internes avant les fonctions d'émission sensibles.

Les sessions doivent expirer après 30 minutes d'inactivité.

Affiche des messages d'erreur compréhensibles en français.

---

### 9. PREMIER PARCOURS COMPLET À RENDRE FONCTIONNEL

L'objectif prioritaire est un parcours réel :

**Connexion → organisation → type de document → préparation → approbation → émission sécurisée → téléchargement → vérification → révocation.**

#### Étape A — Organisation

L'administrateur crée une organisation de démonstration autorisée.

Champs :
- dénomination ;
- sigle ;
- catégorie ;
- pays ;
- ville ;
- logo facultatif ;
- informations administratives minimales ;
- statut.

L'organisation possède un identifiant stable.

#### Étape B — Type de document

L'administrateur configure un type documentaire.

Créer trois modèles de départ :
1. attestation nominative ;
2. lettre officielle ;
3. rapport technique avec annexe.

Chaque modèle définit :
- les champs requis ;
- les validations ;
- les personnes habilitées ;
- la présentation ;
- la confidentialité ;
- la nécessité éventuelle d'une photo.

Le système ne doit pas être codé uniquement pour ces trois types.

#### Étape C — Préparation

Un utilisateur habilité renseigne les données et ajoute les fichiers nécessaires.

Valide toutes les entrées avec Zod.

Le document reste brouillon tant que les conditions d'émission ne sont pas satisfaites.

#### Étape D — Approbation

Un approbateur habilité contrôle la version exacte et l'approuve.

Une modification du contenu après approbation doit invalider cette approbation.

Pour les types qui autorisent une émission directe, utilise une politique explicite, jamais un contournement implicite.

#### Étape E — Émission

Après approbation :
- créer l'identifiant documentaire ;
- créer le code court unique ;
- figer le contenu ;
- produire le cachet signé ;
- générer le QR ;
- générer le document PDF ;
- ajouter les protections visuelles adaptées ;
- signer le PDF ;
- stocker le fichier dans un bucket privé ;
- enregistrer les empreintes et preuves ;
- passer la version à l'état émis.

N'affiche pas « signé » si la signature cryptographique n'a pas réellement abouti.

La signature PAdES B-B doit être contrôlée indépendamment.

#### Étape F — Téléchargement

Un utilisateur autorisé télécharge le PDF final au moyen d'un accès limité.

Les fichiers doivent être servis avec des protections contre l'accès non autorisé.

#### Étape G — Vérification

La page publique `/v` doit accepter :
- un QR signé ;
- un lien de vérification ;
- un code court.

Elle doit afficher les résultats appropriés :
- signature valide et statut à jour ;
- signature valide mais statut non vérifiable à jour ;
- document révoqué ;
- document remplacé ;
- signature invalide ;
- émetteur non reconnu ;
- document expiré ;
- code inconnu ou malformé.

N'expose que les champs prévus par la politique de confidentialité.

Pour les documents sensibles, exige une autorisation complémentaire avant de montrer le contenu intégral.

#### Étape H — Révocation

L'administrateur habilité peut révoquer la version concernée.

Exige :
- motif ;
- confirmation forte ;
- contrôle MFA récent ;
- journalisation ;
- actualisation de la liste de révocation.

La révocation ne détruit pas l'historique.

La page publique doit ensuite afficher le statut révoqué.

---

### 10. SIX PROTECTIONS À MAINTENIR

Les six mécanismes initiaux sont obligatoires dans le MVP cible.

**F1 — QR signé :** Ed25519, COSE_Sign1, format GRT1, validation de l'émetteur et vérification locale. Adapter le payload aux documents transversaux et versionner toute évolution incompatible.

**F2 — PDF signé :** signature cryptographique du fichier final, compatible avec le profil PAdES retenu, vérifiée par un outil indépendant.

**F4 — Photo :** liaison cryptographique au document lorsque le type documentaire l'exige. Accès privé et temporaire.

**F5 — Code court et SMS :** génération sécurisée, checksum, vérification web et canal SMS via adaptateurs Android/Nimba. Aucune réponse SMS ne doit divulguer un contenu confidentiel.

**F6 — Sécurité visuelle :** guilloches et microtexte déterministes, configurables selon le document, sans les présenter comme une preuve suffisante.

**F8 — Révocation :** événement définitif sur la version concernée, historique et vérification à jour.

Le développement peut être progressif, mais aucune protection obligatoire ne doit être retirée de la feuille de route.

---

### 11. STOCKAGE SUPABASE

Crée les buckets privés nécessaires, par exemple :
- document-files ;
- document-attachments ;
- organization-assets ;
- holder-photos.

Configure des politiques d'accès strictes.

Les noms définitifs peuvent être adaptés.

Les objets doivent appartenir à une organisation et être liés aux enregistrements métier.

Vérifie les types MIME réels et les tailles maximales.

Protège les archives et les fichiers téléchargés.

Utilise des URL signées de courte durée lorsqu'un accès temporaire est nécessaire.

Un lien de vérification public ne doit pas donner directement accès au stockage privé.

---

### 12. INTEROPÉRABILITÉ

Prévois un ensemble d'API versionnées pour :
- soumettre un document approuvé ;
- suivre une émission ;
- récupérer une preuve ;
- consulter un statut ;
- recevoir les événements autorisés.

Documente ces API avec OpenAPI.

Implémente au minimum un client de démonstration qui utilise l'API sans accès direct à PostgreSQL.

Authentifie les applications externes avec des identifiants distincts, limités à un organisme et à des permissions définies.

Les webhooks sortants doivent être signés, bornés, rejouables et idempotents.

L'API doit réutiliser exactement le même moteur métier et les mêmes contrôles que l'interface GARANT.

Les futures connexions à la GEC, à la GED ou aux registres ministériels doivent rester possibles sans être simulées comme des intégrations réelles.

---

### 13. INTERFACE UTILISATEUR

Conserve l'identité GARANT et développe une interface professionnelle en français.

Pages attendues :
- tableau de bord ;
- organisations ;
- utilisateurs et habilitations ;
- types de documents ;
- modèles ;
- émission ;
- documents ;
- demandes d'approbation ;
- vérification ;
- intégrations ;
- audit ;
- paramètres.

Affiche uniquement les données réelles.

Ne présente pas de statistiques inventées.

Prévois des états vides soignés, des messages d'erreur, des confirmations et un affichage mobile.

Maintiens séparées la vitrine marketing et l'application métier.

---

### 14. TESTS ET VALIDATION

Exécute au minimum :

**Base de données**
- migrations locales ;
- contraintes SQL ;
- index ;
- RLS ;
- tests multi-organisations.

**Authentification**
- inscription autorisée ;
- connexion ;
- déconnexion ;
- MFA ;
- expiration de session ;
- refus d'accès.

**Documents**
- brouillon ;
- validation ;
- approbation ;
- émission ;
- modification interdite après émission ;
- téléchargement ;
- remplacement ;
- révocation.

**Cryptographie**
- signatures valides ;
- falsification ;
- mauvaise clé ;
- mauvaise version ;
- vérification Node/navigateur.

**PDF**
- signature vérifiable ;
- modification détectée ;
- éléments visuels ;
- annexes ;
- absence de divulgation.

**API**
- permissions ;
- quotas ;
- idempotence ;
- validation des entrées.

**Tests de bout en bout**
- organisation A émet un document ;
- document vérifié ;
- document révoqué ;
- vérification actualisée ;
- organisation B ne peut pas consulter les données privées de A.

Ne marque pas les tests non développés comme réussis.

---

### 15. ORDRE D'EXÉCUTION

Travaille par étapes, dans cet ordre :

**Phase 1 — Audit**
- Examiner le dépôt et son état.
- Examiner Supabase.
- Réconcilier le modèle V2 et le code.
- Produire un plan d'intégration non destructif.

**Phase 2 — Base fonctionnelle**
- Configurer Supabase.
- Créer et tester les migrations.
- Activer et tester RLS.
- Configurer Storage.
- Implémenter Auth et MFA.
- Connecter réellement le dashboard.

**Phase 3 — Premier parcours métier**
- Organisations.
- Habilitations.
- Types documentaires.
- Préparation et validation.
- Émission sécurisée.
- PDF et QR.
- Vérification.
- Révocation.

**Phase 4 — Capacités complémentaires**
- Imports et lots.
- Worker.
- Photos conditionnelles.
- SMS.
- PWA hors ligne.
- Intégrations.
- Audit renforcé.
- Profil Docker souverain.

**Phase 5 — Validation**
- Tests interorganisations.
- Tests cryptographiques.
- Tests de bout en bout.
- Revue de sécurité.
- Documentation d'exploitation bêta.

Ne commence pas par développer des fonctionnalités secondaires alors que l'authentification, la base et le premier parcours restent inopérants.

---

### 16. CRITÈRES D'ACCEPTATION DU PREMIER JALON

Le premier jalon fonctionnel est atteint uniquement lorsque :

- [ ] Une base Supabase GARANT de développement est effectivement connectée.
- [ ] Les migrations pertinentes ont été appliquées sans erreur.
- [ ] Les politiques RLS ont été testées.
- [ ] Un utilisateur peut se connecter réellement.
- [ ] Le contrôle MFA fonctionne pour les opérations sensibles.
- [ ] Une organisation peut être enregistrée.
- [ ] Trois types documentaires peuvent être configurés.
- [ ] Un utilisateur habilité peut préparer un document.
- [ ] Une approbation peut être enregistrée.
- [ ] Un document approuvé peut être émis avec une preuve cryptographique réelle.
- [ ] Le PDF final est signé et validé indépendamment.
- [ ] Le document peut être téléchargé par un utilisateur autorisé.
- [ ] Une vérification publique donne un résultat justifié.
- [ ] Une révocation est visible lors d'une nouvelle vérification.
- [ ] Une seconde organisation ne peut pas accéder aux données privées de la première.
- [ ] Les tests correspondants sont réellement exécutés.

Une case ne peut être cochée que si le résultat est démontré.

---

### 17. RAPPORTS ET COMMANDES

Maintiens :
- `docs/IMPLEMENTATION_STATUS.md`
- `docs/DECISIONS.md`
- `docs/SUPABASE_SETUP.md`
- `docs/DATABASE_SCHEMA.md`
- `docs/API.md`
- `docs/SECURITY_CHECKLIST.md`

Consigne les commandes réellement exécutées et leurs résultats.

Utilise selon le contexte :
- pnpm install
- pnpm lint
- pnpm typecheck
- pnpm test
- pnpm build
- commandes Supabase CLI officielles
- tests SQL et RLS
- tests Playwright

N'invente pas de résultats ni de connexions.

À la fin de chaque phase, explique :
- ce qui fonctionne ;
- ce qui ne fonctionne pas encore ;
- les migrations effectuées ;
- les risques restants ;
- les commandes permettant de reproduire le résultat.

---

### 18. INSTRUCTION FINALE — EXÉCUTE MAINTENANT

Commence immédiatement par la phase 1 : inspecte le dépôt GitHub GARANT et le projet Supabase dédié.

Utilise les outils connectés disponibles pour identifier le projet et son état.

Ensuite, lance la phase 2 pour rendre l'authentification, la base de données et l'espace organisation opérationnels.

Ne demande pas de nouvelles décisions sur les choix d'architecture déjà fixés.

Ne modifie aucun autre projet Supabase.

N'engage aucun coût supplémentaire sans autorisation.

N'exécute pas d'opération destructive ni de déploiement public sans autorisation.

Si l'accès à Supabase ou les identifiants nécessaires ne sont pas disponibles, termine les travaux locaux possibles et indique précisément les étapes bloquées.

**Objectif immédiat : obtenir une application GARANT connectée à une base réelle, avec authentification, organisations et premier parcours documentaire fonctionnel.**

Poursuis ensuite les protections et les intégrations dans l'ordre prévu.

Travaille directement dans le code. Ne réponds pas uniquement avec une nouvelle proposition de prompt.
