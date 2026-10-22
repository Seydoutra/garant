# Modèle GARANT V3

Deux migrations additives initiales, créées par la CLI officielle. Aucune migration antérieure présente au départ, aucune application distante. PostgreSQL SQL est la référence pour contraintes, fonctions, RLS et grants. `packages/db/src/schema.ts` contient la projection Drizzle du cœur organisations/types/documents/versions ; ce n'est pas un générateur complet de la migration. Ne pas utiliser un `drizzle push` qui effacerait les politiques ou fonctions SQL.

## Modèle implémenté

Identités : `organizations`, `organization_units`, `user_profiles`, `memberships`, `roles`, `permissions`, `role_permissions`, `user_delegations`. Les profils ne dupliquent pas les e-mails Auth. Les administrateurs de plateforme et l'activité des sessions sont dans le schéma `private`, non exposé.

Configuration : `document_types`, `document_type_versions`. Le schéma initial volontairement limité accepte 1 à 30 champs nommés, chaînes requises ou facultatives (5 000 caractères maximum par valeur), validés par Zod et SQL. Ces trois modèles ne sont pas codés dans le moteur : attestation nominative, lettre, rapport avec référence d'annexe. Les types supplémentaires utilisent le même moteur. Les types/version sont immuables ; la création d'une version ultérieure de type reste à implémenter. Photo conditionnelle et politique directe sont représentées mais aucune émission directe n'est activée.

Documents : `documents`, `document_versions`, `document_attachments`, `document_approvals`, `issuance_requests`. Chaque document appartient à une organisation et à un type ; références uniques par organisation, versions uniques par document. Les clés étrangères composites empêchent les références inter-organisations. Le service du document est affecté selon l'habilitation du préparateur. Les membres rattachés à un service n'accèdent qu'à ce service ; une habilitation sans service a une portée organisationnelle.

Preuves et événements : `issuer_keys` (clés publiques seulement), `document_seals`, `document_signatures`, `document_status_events`, `audit_logs`. Ces contrats n'impliquent aucune signature réalisée. Le passage à `issued` est refusé tant que le pipeline PAdES indépendant n'est pas activé. Les versions finalisées sont protégées contre les changements de contenu ; les tables d'historique interdisent UPDATE/DELETE. Un administrateur de base propriétaire peut encore modifier le schéma lui-même : ce n'est pas un journal inviolable face à un serveur compromis.

## Autorisations

RLS actif sur toutes les tables applicatives public/private. Aucun droit anonyme aux tables métier. Le rôle `authenticated` n'a que SELECT filtré ; les écritures passent par les RPC nommées. Les fonctions SECURITY DEFINER sont une frontière explicite et réduite : identité issue d'Auth, session présente dans `auth.sessions`, autorisations stockées en base, MFA récent pour les mutations, schéma de recherche vide et droits EXECUTE révoqués à PUBLIC/anon. Les helpers de politiques sont privés, en lecture et bornés à `auth.uid()` ; aucune valeur `user_metadata` n'autorise une action.

Les lectures privées exigent AAL2. Une opération sensible exige un AMR `totp` datant de moins de cinq minutes. Les sessions sont verrouillées après trente minutes sans requête authentifiée, marquées terminées à la déconnexion et non réactivables avec le même identifiant. La base de données ne valide pas une signature JWT elle-même : PostgREST est la frontière d'authentification pour ces RPC et le test fournit des claims contrôlés pour tester les politiques.

L'approbation exige une délégation active pour le type, le même service et une personne distincte du préparateur. La validation porte sur le hash SHA-256 exact de la représentation JSONB PostgreSQL. Ce hash n'est pas prétendu égal à un JSON canonique RFC 8785 ; le futur cachet doit versionner son format et incorporer ce hash explicitement. Une correction crée une nouvelle version brouillon sans déplacer l'approbation. Les fonctions de révision et d'approbation verrouillent la version pour contrôler les conflits.

## Travaux restant au modèle V3

Schémas métier plus riches, sujets multiples structurés, modèles de présentation et versions, politiques/étapes multiples, certificats PDF, listes de confiance/révocation, jetons et événements publics, relations entre documents, lots/imports, clients externes/credentials, webhooks signés, SMS et quotas restent à ajouter par migrations successives. Aucun doublon générique JSONB n'a été créé pour les simuler. La table `issuance_requests` réserve l'idempotence `(organization_id,idempotency_key)` et l'unicité d'une émission par version ; le moteur worker et les transactions d'émission ne sont pas encore disponibles.
