# Vérifications réalisées — 9 octobre 2026

## Résultats

- TypeScript strict : `tsc --noEmit` réussi, aucune erreur.
- Tests Vitest : 1 fichier, **3 tests réussis** (valide, révoqué, introuvable ; normalisation de la saisie et absence de données pour une entrée inconnue).
- Build : script `pnpm run build` réussi (`tsc --noEmit && vite build`).
- Réponse HTTP locale : 200 OK.
- Navigateur intégré : les trois scénarios ont été déclenchés par leurs boutons et les données attendues constatées après le scan.
- Cas introuvable : aucun titulaire, émetteur ou autre renseignement personnel affiché.
- Menu mobile : ouverture à 375 px et fermeture par Escape, avec retour du focus au bouton.
- Onglets : déplacement par flèche droite depuis Entreprises vers Cabinets RH ; contenu du panneau mis à jour.
- FAQ : ouverture de la réponse « Faut-il installer une application ? » confirmée.
- Liens internes : toutes les ancres présentes correspondent à un élément existant.
- Structure : un H1 ; onze sections principales, plus navigation et footer, soit les treize parties demandées.
- Hero : document 3D avec contenu et QR confirmé visuellement après correction ; version HTML statique confirmée au format mobile.
- Contacts non configurés : boutons désactivés et état « Configuration nécessaire » visible.

## Responsive

Mesure DOM dans le navigateur intégré, sur une hauteur de 900 px :

| Largeur | Débordement horizontal du document |
| --- | --- |
| 375 px | Aucun |
| 390 px | Aucun |
| 768 px | Aucun |
| 1024 px | Aucun |
| 1440 px | Aucun |

Le hero a été inspecté en capture au format mobile et bureau. Ces contrôles ne représentent pas un audit de chaque appareil ou navigateur.

## Performance et accessibilité

Polices locales, scène chargée par import dynamique, repli mobile et WebGL, boutons tactiles de 44 px minimum, focus visibles, formulaire avec label, résultat `aria-live`, navigation sémantique, FAQ native et onglets avec touches directionnelles. La réduction des animations est implémentée dans CSS et Motion ; aucune émulation système de ce réglage n’a été effectuée.

Vite avertit de la taille du fragment 3D (environ 883 ko avant compression, 239 ko gzip). Il reste différé et ne charge pas sur mobile ou avec les animations réduites. Aucun score Lighthouse n’a été mesuré. Aucun audit complet avec lecteur d’écran ni WCAG automatisé n’a été exécuté.

## Déploiement et périmètre

Workflow GitHub Pages préparé, non exécuté sur GitHub dans cette session. Aucun dépôt distant fourni. Coordonnées, URL de production et pages légales restent à renseigner. Aucun backend, signature réelle ou certification cryptographique. Le QR ouvre seulement la simulation locale de cette page.
