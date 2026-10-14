# PROMPT — Spécification technique du MVP GARANT

## 0. Ton rôle et ce que j'attends de toi

Tu es architecte logiciel senior, spécialisé en cryptographie appliquée, sécurité applicative et SaaS B2B. À partir de ce document, tu dois produire une **spécification technique exhaustive et directement exécutable** pour construire le MVP de GARANT avec Codex.

Ton livrable doit contenir :
1. L'architecture détaillée et justifiée (les décisions ci-dessous sont **fixées** : ne les modifie que si tu identifies un problème bloquant, et explique-le).
2. Le schéma de base de données complet (SQL de migration).
3. La spécification de chaque module : entrées, sorties, algorithmes, cas d'erreur.
4. Les contrats d'API (routes, méthodes, payloads, codes d'erreur).
5. Les écrans et parcours utilisateurs.
6. La stratégie de tests, avec des vecteurs de test cryptographiques.
7. Un **découpage en tâches Codex** : tâches petites, ordonnées, chacune avec ses critères d'acceptation vérifiables, prêtes à être collées une par une dans Codex.

Langue de l'interface : français. Code et commentaires : anglais.

---

## 1. Le produit

GARANT est un SaaS qui permet à des établissements émetteurs (centres de formation, écoles, universités, entreprises, et à terme administrations publiques) de **générer des documents sécurisés et authentifiés** (diplômes, attestations, certificats) et de les rendre **vérifiables** par n'importe quel tiers (employeur, administration, ambassade).

Marché : Guinée, puis Afrique de l'Ouest francophone. Ambition à terme : solution étatique de sécurisation des documents. L'architecture doit donc être **souveraine et portable** (déployable sur un serveur en Guinée, sans dépendance bloquante à un service étranger).

Contraintes terrain :
- Connexions mobiles lentes et instables : les pages de vérification doivent être très légères.
- Beaucoup de vérificateurs n'ont qu'un téléphone basique : la vérification par SMS est indispensable.
- Les documents sont souvent imprimés et photocopiés : la vérification doit fonctionner sur papier.

---

## 2. Périmètre fonctionnel du MVP

Six fonctions de sécurité sont au cœur du MVP :

| N° | Fonction | Résumé |
|---|---|---|
| F1 | QR code signé (cachet électronique visible) | Le QR contient les données du document signées. Vérifiable hors ligne. |
| F2 | Signature du PDF | Le PDF est signé numériquement : toute modification est détectée par les lecteurs PDF. |
| F4 | Photo du titulaire | Photo imprimée sur le document, liée cryptographiquement au cachet, affichée à la vérification. |
| F5 | Code court + vérification par SMS | Code type `GRT-7K4P-92XQ` imprimé, vérifiable par SMS (passerelle Android) et sur le web. |
| F6 | Sécurité visuelle unique | Guilloches et microtexte générés de façon unique pour chaque document. |
| F8 | Révocation | L'établissement peut révoquer un document ; le statut est visible à toute vérification. |

**Socle obligatoire autour de ces fonctions** : gestion des établissements, comptes utilisateurs avec rôles, double authentification, modèles de documents, import en masse, génération par lots, page de vérification publique, journal d'audit.

**Hors périmètre du MVP** (ne pas développer, mais ne pas bloquer leur ajout futur) : horodatage certifié RFC 3161, vérification par dépôt de fichier PDF, alertes anti-fraude avancées, double validation saisie/signature, WhatsApp, numéro court opérateur, application mobile native, paiement en ligne, multilingue.

---

## 3. Stack technique imposée

- **Monorepo** pnpm + Turborepo :
  - `apps/web` : Next.js (App Router), TypeScript strict, runtime **Node.js** pour toutes les routes qui touchent à la cryptographie ou au PDF (pas d'Edge runtime).
  - `apps/verifier` : PWA de vérification (peut être une section de `apps/web` avec service worker dédié ; justifie ton choix).
  - `packages/seal` : encodage, signature et vérification du cachet (F1). Isomorphe : doit tourner dans Node **et** dans le navigateur.
  - `packages/pdf` : génération et signature des PDF (F2, F4, F6).
  - `packages/shortcode` : génération et validation des codes courts (F5).
  - `packages/db` : schéma, migrations, client.
- **Base de données** : PostgreSQL. Supabase est utilisé pour Postgres, Auth et Storage, mais l'accès aux données passe par un ORM (Drizzle de préférence) pour rester portable vers un PostgreSQL auto-hébergé.
- **Stockage fichiers** : buckets privés (photos, PDF). Accès uniquement par URL signée à courte durée de vie.
- **File de tâches** pour la génération par lots (pg-boss sur PostgreSQL, pour éviter une dépendance supplémentaire).
- **UI** : Tailwind CSS + shadcn/ui.
- **Validation** : zod sur toutes les entrées.
- **Crypto** : `@noble/ed25519` et `@noble/hashes` (audités, isomorphes), `cbor-x`, encodage Base45. Pour la signature PDF : `@signpdf/signpdf` avec `node-forge` pour la gestion des certificats X.509.
- **Rendu PDF** : modèles HTML/CSS rendus par Playwright (Chromium headless) en PDF vectoriel, puis signature en dernière étape.
- **Déploiement** : Dockerfile + docker-compose fournis (app, worker, PostgreSQL) pour pouvoir héberger en Guinée. Fichier `.env.example` complet.

---

## 4. Modèle de confiance et gestion des clés

### 4.1 Hiérarchie des clés
- **Clé racine GARANT** (Ed25519) : signe uniquement la liste de confiance et la liste de révocation. Stockée hors de la base, chargée depuis une variable d'environnement chiffrée ; prévoir une interface `KeyProvider` pour brancher plus tard un HSM ou un KMS.
- **Clé de cachet par établissement** (Ed25519) : signe les cachets (F1) des documents de cet établissement. Identifiée par un `kid` court (8 caractères).
- **Certificat PDF par établissement** (X.509, ECDSA P-256 ou RSA 3072) émis par une **AC interne GARANT** (Root CA GARANT → certificat de l'établissement) : sert à la signature PDF (F2). Ed25519 n'est pas utilisé pour le PDF, car mal supporté par les lecteurs.

### 4.2 Stockage des clés privées
- Chiffrement par enveloppe : chaque clé privée d'établissement est chiffrée en AES-256-GCM avec une clé de données, elle-même chiffrée par une clé maîtresse (variable d'environnement en MVP, KMS/HSM plus tard).
- Les clés privées ne quittent jamais le serveur, ne sont jamais journalisées et ne sont jamais renvoyées par une API.
- Rotation : un établissement peut avoir plusieurs clés ; une seule active pour signer, les anciennes restent valides en vérification jusqu'à leur date de fin.

### 4.3 Liste de confiance (trust list)
- Document JSON public : établissements actifs, `kid`, clés publiques, dates de validité, statut. Signé par la clé racine.
- Endpoint : `GET /api/public/trust-list` (cache HTTP, ETag).
- La clé publique racine est **embarquée en dur** dans la PWA de vérification.

### 4.4 Limite à documenter
En MVP, les certificats PDF émis par l'AC interne afficheront dans Adobe « signature valide, identité non vérifiée » tant que la racine GARANT n'est pas dans une liste de confiance reconnue (AATL ou autorité nationale). Prévois une page d'aide expliquant comment installer la racine GARANT, et documente le chemin vers une AC reconnue pour la version étatique.

---

## 5. Spécifications détaillées des fonctions

### F1 — QR code signé (cachet électronique visible)

**Contenu signé (payload)**, encodé en CBOR avec des clés entières courtes pour minimiser la taille :
- `v` : version du format (1)
- `kid` : identifiant de la clé de l'établissement
- `id` : identifiant du document (UUID en 16 octets binaires)
- `sc` : code court
- `n` : nom complet du titulaire
- `dt` : type de document (énumération : diplôme, attestation, certificat, attestation de travail, attestation de stage…)
- `t` : intitulé (ex. « Formation en montage vidéo »)
- `iss` : date d'émission (jours depuis l'epoch)
- `exp` : date d'expiration (optionnelle)
- `ph` : empreinte SHA-256 de la photo, tronquée à 16 octets (lie F4 au cachet)

**Format** : structure COSE_Sign1 (algorithme EdDSA, `kid` dans l'en-tête protégé), compressée en zlib, encodée en **Base45**, préfixée par `GRT1:`. S'inspirer du format du certificat COVID numérique européen (HC1), qui a fait ses preuves.

**Contenu du QR** : une URL `https://VERIFY_DOMAIN/v#GRT1:...`.
- Le cachet est placé **dans le fragment** (`#`), qui n'est jamais envoyé au serveur : n'importe quel appareil photo ouvre la page de vérification, et la vérification de signature se fait dans le navigateur.
- Correction d'erreur QR niveau M minimum ; taille imprimée minimale de 25 mm. Calcule et documente la taille du payload pour un cas réaliste (nom long + intitulé long) et vérifie qu'elle reste lisible.

**Vérification** (fonction pure dans `packages/seal`, testée en Node et navigateur) :
1. Décoder Base45 → décompresser → parser COSE.
2. Trouver la clé publique via `kid` dans la liste de confiance en cache, vérifier la signature de la liste avec la racine embarquée.
3. Vérifier la signature Ed25519 du cachet.
4. Vérifier les dates de validité de la clé et l'expiration du document.
5. Consulter la liste de révocation (en ligne si possible, sinon cache local).
6. Résultats possibles : `VALID`, `VALID_OFFLINE_UNCHECKED_REVOCATION` (avec date de dernière synchronisation), `REVOKED`, `INVALID_SIGNATURE`, `UNKNOWN_ISSUER`, `EXPIRED`, `MALFORMED`.

**PWA hors ligne** : service worker qui met en cache l'application, la liste de confiance et la liste de révocation ; scanner QR intégré (bibliothèque légère, type `qr-scanner` ou ZXing) ; synchronisation au retour du réseau. Poids total de la PWA inférieur à 300 Ko compressés.

### F2 — Signature du PDF

- Signature PAdES (niveau B-B) apposée **en toute dernière étape**, après génération complète du PDF.
- Champ de signature invisible, plus une mention visible sur le document : « Document signé électroniquement par [établissement] — vérifiable sur VERIFY_DOMAIN ».
- Stocker le SHA-256 du PDF final signé dans la base.
- Test obligatoire : modifier un octet du PDF signé doit invalider la signature (test automatisé avec une bibliothèque de vérification de signature PDF).

### F4 — Photo du titulaire

- Import : photo individuelle via formulaire, ou archive ZIP en import de masse avec des fichiers nommés par matricule (ex. `MAT-0042.jpg`).
- Traitement serveur avec `sharp` : rotation EXIF, suppression de **toutes** les métadonnées, recadrage 3:4, redimensionnement à 600×800, export JPEG qualité 85.
- Calcul du SHA-256 sur l'image **normalisée**, intégré au cachet (champ `ph`).
- Affichage à la vérification : la page récupère la photo via une URL signée valable 5 minutes, recalcule son empreinte côté client et la compare au champ `ph` du cachet. En cas de différence, afficher une alerte.
- Hors ligne : la photo n'est pas disponible ; la PWA l'indique clairement et invite à comparer avec la photo imprimée.
- Le consentement du titulaire à l'usage de sa photo est attesté par l'établissement (case obligatoire à l'import).

### F5 — Code court et vérification par SMS

**Format du code** : `GRT-XXXX-XXXX`, alphabet Crockford Base32 (sans I, L, O, U). Les 7 premiers caractères sont aléatoires (CSPRNG), le 8e est un caractère de contrôle (mod 37 Crockford). Unicité garantie par contrainte en base, avec nouvelle tentative en cas de collision.

**Normalisation à la saisie** : majuscules, suppression des espaces et tirets, `O→0`, `I/L→1`, préfixe GRT optionnel. Vérifier le caractère de contrôle **avant** toute requête en base pour rejeter les fautes de frappe sans charge serveur.

**Vérification web** : champ de saisie sur la page de vérification → même résultat que le QR (en ligne uniquement).

**Canal SMS — architecture** :
- Réception : un smartphone Android avec puce locale, sur lequel tourne l'application open source **SMS Gateway for Android**. Chaque SMS reçu est transmis par webhook à `POST /api/sms/inbound`. Prévoir au moins deux passerelles (une par opérateur), identifiées en base.
- Sécurité du webhook : vérification de la signature HMAC fournie par la passerelle, contrôle de l'horodatage (fenêtre de 5 minutes, anti-rejeu), liste blanche des identifiants de passerelles, idempotence sur l'identifiant du message.
- Réponse : envoi via l'API **Nimba SMS** avec le nom d'expéditeur `GARANT`. Repli automatique via la passerelle Android si Nimba échoue. Abstraire derrière une interface `SmsSender` pour pouvoir changer de fournisseur.
- Modèles de réponse en **GSM-7 sans accents** (160 caractères maximum, pour éviter le passage en UCS-2 limité à 70 caractères) :
  - Valide : `GARANT: VALIDE. <NOM> - <TYPE> - <ETABLISSEMENT> - emis le <JJ/MM/AAAA>. Ref <CODE>`
  - Révoqué : `GARANT: REVOQUE le <JJ/MM/AAAA>. Ce document n'est plus valable. Ref <CODE>`
  - Introuvable : `GARANT: code inconnu. Verifiez la saisie. Format: GRT-XXXX-XXXX`
  - Format invalide : `GARANT: format invalide. Envoyez le code au format GRT-XXXX-XXXX`
  - Limite atteinte : `GARANT: trop de demandes. Reessayez plus tard.`
  - Tronquer intelligemment les noms et intitulés trop longs.
- Minimisation des données : jamais de photo, de date de naissance ou d'autre donnée personnelle par SMS.
- Limitation de débit : par numéro expéditeur (10 par heure, 30 par jour), plus une limite globale ; blocage temporaire après 5 codes inconnus consécutifs (protection contre l'énumération).
- Supervision : la passerelle envoie un signal de vie ; si aucune activité ni signal pendant 15 minutes, alerte par e-mail et SMS à l'administrateur. Tableau de bord affichant l'état de chaque passerelle.
- Le numéro de téléphone du vérificateur est stocké **haché** (HMAC avec sel serveur), jamais en clair.

### F6 — Sécurité visuelle unique

- **Graine** : `seed = HMAC-SHA256(VISUAL_SECRET, document_id)`. Le rendu est déterministe : GARANT peut le régénérer pour comparaison.
- **Guilloches** : fond vectoriel SVG composé de 3 à 5 courbes hypotrochoïdes et rosaces dont les paramètres (rayons, nombre de pétales, phase, épaisseur, teinte dans la palette du modèle) sont dérivés de la graine. Opacité faible (8 à 15 %) pour ne pas gêner la lecture. Un motif en bordure, un motif de fond sous la zone de texte.
- **Microtexte** : une ligne continue répétant `<NOM DU TITULAIRE> • <CODE COURT> •`, en police sans empattement, taille par défaut 4,5 pt (paramétrable par modèle de 4 à 6 pt), placée sous le titre ou en filet de bordure.
- **Contrainte d'impression** : prévoir un « document de calibration » imprimable pour tester le rendu des guilloches et du microtexte sur les imprimantes courantes, et choisir la taille minimale lisible.
- La sécurité visuelle est **dissuasive et non probante** : ne jamais la présenter comme une preuve dans l'interface. La preuve reste F1, F2 et la vérification en ligne.

### F8 — Révocation

- Action réservée aux rôles administrateur établissement et super-administrateur.
- Motif obligatoire (énumération : erreur de saisie, fraude constatée, retrait du titre, remplacement par un nouveau document, autre + commentaire).
- Confirmation forte : ressaisie du code court du document et code 2FA.
- La révocation est **définitive** en MVP. En cas d'erreur, on émet un nouveau document (champ `replaced_by` pour relier les deux).
- **Liste de révocation** : `GET /api/public/revocations?since=<version>` renvoie la liste complète ou le delta des identifiants révoqués, signée par la clé racine, versionnée. Mise à jour en temps réel à chaque révocation.
- Toute vérification (QR en ligne, web, SMS) affiche le statut révoqué, avec la date et un message neutre, sans exposer le motif détaillé au public.

---

## 6. Socle applicatif

### 6.1 Rôles
- `super_admin` (équipe GARANT) : gestion des établissements, des clés, des passerelles SMS, supervision.
- `institution_admin` : gestion des utilisateurs de son établissement, des modèles, révocation.
- `issuer` : import, génération, consultation des documents de son établissement.
- Vérificateur : public, sans compte.

### 6.2 Authentification
- E-mail + mot de passe (règles robustes, hachage géré par Supabase Auth ou Argon2id) + **TOTP obligatoire** pour tous les comptes internes.
- Sessions courtes, déconnexion automatique après 30 minutes d'inactivité.
- Isolation stricte entre établissements : Row Level Security sur toutes les tables, en plus des contrôles applicatifs. Tests automatisés prouvant qu'un utilisateur ne peut jamais lire les données d'un autre établissement.

### 6.3 Modèles de documents
- Éditeur simple : logo de l'établissement, couleurs, titre, champs dynamiques (`{{nom}}`, `{{intitule}}`, `{{date}}`…), position de la photo, du QR, du code court, du microtexte, signature manuscrite scannée du responsable (image), formats A4 portrait et paysage.
- Aperçu en direct avec données fictives.
- Versionnement : un document conserve la version du modèle utilisée à sa génération.

### 6.4 Émission
- Émission unitaire par formulaire.
- **Import en masse** : fichier CSV ou XLSX + ZIP de photos. Étape de correspondance des colonnes, validation ligne par ligne, rapport d'erreurs téléchargeable, aperçu de 3 documents avant lancement.
- Génération par lot dans le worker : pour chaque ligne, normalisation de la photo → génération du code court → construction et signature du cachet → rendu HTML avec guilloches et microtexte → PDF → signature PDF → stockage → mise à jour du statut. Progression visible en temps réel. Reprise sur erreur sans doublon (idempotence par ligne).
- Téléchargement : ZIP de tous les PDF du lot et fichier récapitulatif CSV (nom, code court, lien de vérification).
- Objectif de performance : 500 documents en moins de 10 minutes sur un serveur à 4 vCPU.

### 6.5 Page publique de vérification
- URL : `https://VERIFY_DOMAIN/v`. Domaine unique, HTTPS, HSTS.
- Trois entrées : scan QR (caméra), saisie du code court, ouverture directe depuis un lien `#GRT1:`.
- Résultat très lisible : grand bandeau de statut (vert valide, rouge révoqué, orange non vérifiable), photo, nom, type et intitulé du document, établissement émetteur avec son logo, date d'émission, code court.
- **Aucune recherche par nom**, pas d'annuaire, pas d'indexation (`noindex`, `robots.txt`).
- Poids de la page inférieur à 150 Ko hors photo ; fonctionne sur un téléphone d'entrée de gamme en 3G.
- Mention claire pour éviter le phishing : « La seule adresse officielle de vérification est VERIFY_DOMAIN ».

### 6.6 Journal d'audit
- Table en ajout seul (aucune mise à jour ni suppression permise, appliqué par trigger et droits PostgreSQL).
- Événements : connexion, échec de connexion, création de modèle, import, génération, téléchargement, révocation, gestion des utilisateurs et des clés.
- Chaînage par empreinte (chaque entrée contient le hash de la précédente) pour détecter toute altération.
- Journal des vérifications séparé : canal (QR en ligne, PWA, web, SMS), résultat, horodatage, document concerné, empreintes hachées de l'IP ou du numéro.

---

## 7. Modèle de données (à détailler en SQL)

Tables minimales :
- `institutions` (id, nom, sigle, logo, pays, ville, statut, date de création)
- `institution_seal_keys` (id, institution_id, kid, public_key, encrypted_private_key, valid_from, valid_until, is_active)
- `institution_pdf_certificates` (id, institution_id, certificate_pem, encrypted_private_key, valid_from, valid_until, is_active)
- `users` / `memberships` (utilisateur, établissement, rôle)
- `templates` et `template_versions`
- `batches` (id, institution_id, statut, total, réussis, échecs, créé par, dates)
- `documents` (id UUID, institution_id, batch_id, template_version_id, short_code unique, holder_full_name, holder_reference, document_type, title, issued_at, expires_at, photo_path, photo_sha256, seal_payload, pdf_path, pdf_sha256, status `VALID|REVOKED`, revoked_at, revoked_by, revocation_reason, replaced_by, created_by, created_at)
- `revocation_list_versions` (version, généré le, signature)
- `sms_gateways` (id, nom, opérateur, numéro, secret webhook chiffré, dernier signal de vie, statut)
- `sms_messages` (id, gateway_id, sens entrant/sortant, sender_hash, contenu normalisé, résultat, fournisseur, statut de livraison, dates)
- `rate_limits`
- `verification_events`
- `audit_logs`

Index, contraintes d'unicité et politiques RLS à définir pour chaque table.

---

## 8. API (à détailler)

Publiques (sans authentification, avec limitation de débit) :
- `GET /api/public/trust-list`
- `GET /api/public/revocations?since=`
- `POST /api/public/verify/code` — vérification par code court
- `GET /api/public/verify/:documentId/status` — statut en ligne après vérification locale du cachet
- `GET /api/public/verify/:documentId/photo` — renvoie une URL signée courte
- `POST /api/sms/inbound` — webhook des passerelles (authentifié par HMAC)
- `POST /api/sms/heartbeat`

Privées (authentifiées, contrôlées par rôle) : CRUD établissements, utilisateurs, modèles ; émission unitaire ; imports et lots ; documents (liste, détail, téléchargement) ; révocation ; supervision des passerelles ; journal d'audit.

Format d'erreur uniforme ; toutes les entrées validées par zod.

---

## 9. Sécurité transverse (exigences non négociables)

- Aucune clé privée, aucun secret, aucune donnée personnelle dans les logs.
- En-têtes de sécurité : CSP stricte, HSTS, X-Frame-Options, Referrer-Policy.
- Protection OWASP Top 10 : injections, XSS, CSRF, contrôle d'accès, téléversements (vérification du type réel, taille maximale, analyse des archives ZIP contre les « zip bombs » et les chemins malveillants).
- Limitation de débit sur toutes les routes publiques et de connexion.
- Sauvegardes chiffrées quotidiennes de la base et du stockage, avec procédure de restauration testée.
- Les sauvegardes ne contiennent jamais la clé maîtresse.
- Conformité à la législation guinéenne sur la protection des données personnelles : minimisation, finalité, durée de conservation configurable, droit d'accès.
- Liste des points à faire auditer par un pentest externe avant toute mise en production.

---

## 10. Tests

- **Cryptographie** : vecteurs de test fixes (clé, payload, cachet attendu) ; tests de falsification (un caractère modifié dans le nom, la date, la signature, le `kid`) qui doivent tous échouer ; tests de compatibilité Node ↔ navigateur.
- **Code court** : génération, contrôle, normalisation des erreurs de saisie courantes.
- **PDF** : signature valide, invalidation après modification d'un octet, présence des guilloches et du microtexte.
- **SMS** : webhook signé et non signé, rejeu, doublon, limitation de débit, chaque modèle de réponse, repli si Nimba échoue.
- **Isolation multi-établissements** via RLS.
- **Tests de bout en bout** (Playwright) : import d'un lot → génération → scan du QR → vérification valide → révocation → vérification révoquée, par QR, code web et SMS simulé.
- Couverture minimale de 90 % sur `packages/seal` et `packages/shortcode`.

---

## 11. Livrables attendus du dépôt

- Monorepo fonctionnel avec `README` complet (installation, variables d'environnement, lancement local, déploiement Docker).
- Script de génération de la clé racine, de l'AC interne et des clés d'un établissement de démonstration.
- Données de démonstration : établissement fictif « Institut Démo de Conakry », un modèle, 20 documents dont 2 révoqués.
- Guide de configuration de la passerelle SMS Android (installation de l'application, paramétrage du webhook, test).
- Documentation du format `GRT1` (spécification du cachet) pour permettre à des tiers, y compris une administration, de développer leur propre vérificateur.

---

## 12. Variables à remplacer

- `VERIFY_DOMAIN` : domaine officiel de vérification
- `APP_DOMAIN` : domaine de l'espace établissements
- Identifiants Nimba SMS (Service ID, Secret Token) et nom d'expéditeur `GARANT`
- Numéros des passerelles SMS
- Clé maîtresse, secret visuel, sel de hachage

---

## 13. Format de ta réponse

Structure ta spécification exactement selon les sections 3 à 11, puis termine par le **découpage en tâches Codex** :
- environ 25 à 40 tâches ;
- ordre recommandé : socle du monorepo et base de données → `packages/shortcode` → `packages/seal` → authentification et rôles → modèles → génération PDF avec F4 et F6 → signature PDF → émission unitaire → import en masse et worker → page de vérification → PWA hors ligne → révocation → canal SMS → audit → tests de bout en bout → Docker et documentation ;
- pour chaque tâche : titre, contexte, fichiers concernés, instructions précises, critères d'acceptation testables, commandes de vérification.

Si une exigence te paraît irréaliste, contradictoire ou dangereuse pour la sécurité, signale-le explicitement avant de proposer une alternative.