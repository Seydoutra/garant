# Contrôles V3

## Démontrés localement

- RLS actif sur toutes les tables applicatives ; rôle de test non propriétaire sans BYPASSRLS.
- Isolation organisations A/B, services A/B, lectures privées refusées à AAL1.
- Écritures directes interdites ; RPC testées pour permissions et TOTP récent.
- Pas d'autorisation fondée sur `user_metadata` ; refus de l'élévation d'un compte non habilité.
- Délégation approbateur par type, expiration et approbateur distinct ; approbation du hash exact.
- Révision en nouvelle version non approuvée, unicité des références, validation SQL des champs.
- Refus d'émission sans pipeline PAdES ; interdiction de révocation par mise à jour directe non autorisée.
- Historique et versions de type immuables face aux écritures ordinaires.
- Sessions SQL expirées/terminées non réactivables par rafraîchissement.
- Quatre buckets privés ; accès aux métadonnées de fichiers liés filtré par RLS, refus B et anonyme.
- Configuration absente explicite, absence de données inventées, compilation sans secrets.

## À vérifier avant bêta

- [ ] Projet Supabase GARANT créé dans l'organisation/région confirmée et coût autorisé.
- [ ] Migrations réconciliées et rejouées dans la pile Supabase complète isolée, puis projet bêta validé.
- [ ] Advisors Supabase sécurité/performance sur le projet GARANT uniquement.
- [ ] SMTP, confirmation e-mail, inscription, connexion, déconnexion et reset PKCE réellement testés.
- [ ] Enrôlement/challenge TOTP réel, erreurs, perte d'appareil et récupération administrative contrôlée.
- [ ] Inactivité vérifiée bout en bout avec les véritables sessions Supabase et navigateur.
- [ ] RLS et politiques Storage rejouées avec JWT réellement émis par Supabase.
- [ ] Types MIME réels, taille, photo normalisée, empreintes, contrôle d'archives et téléchargement temporaire.
- [ ] Provisionnement et révocation des habilitations/delegations, gestion du dernier administrateur.
- [ ] API externes : credentials distincts, scopes, quotas, idempotence et webhooks signés.
- [ ] F1 GRT1 transversal/COSE_Sign1/Ed25519 testé Node et navigateur, racine de confiance et clés protégées.
- [ ] F2 PDF signé PAdES B-B et validé indépendamment, modification détectée.
- [ ] F4 liaison photo conditionnelle ; F5 checksum/SMS confidentiel ; F6 guilloche/microtexte ; F8 révocation et listes actualisées.
- [ ] Worker pg-boss, imports, anti-rejeu, sauvegardes, rotation et restauration.
- [ ] Protections trafic, CSP adaptée, contrôle de taille en flux, métriques sans secrets, sécurité de déploiement.
- [ ] Parcours complet A émet → vérification → révocation → vérification à jour, B isolée.

Aucune case restante n'est une réussite revendiquée. Aucun secret réel fourni, aucune migration distante ou publication de V3 exécutée.
