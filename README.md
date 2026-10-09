# GARANT Launch V1

Landing page statique en français : vitrine et simulation documentaire locale. Aucun document réel n’est signé ni authentifié. Toutes les personnes et organisations de démonstration sont fictives.

## Démarrer

Node.js 22.12+ recommandé. Les versions installées sont figées dans `pnpm-lock.yaml`.

```sh
corepack enable
corepack prepare pnpm@11.25.0 --activate
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm build
pnpm preview
```

Les scripts sont également compatibles npm : `npm install`, `npm run dev`, `npm test`, `npm run build`, `npm run preview`. Le workflow utilise pnpm et son verrou ; après une modification de dépendances avec npm, régénérer aussi le verrou pnpm.

## Architecture et arborescence

```text
garant/
├── .github/workflows/deploy.yml
├── public/favicon.svg
├── src/
│   ├── components/
│   │   ├── Document.tsx
│   │   ├── HeroVisual.tsx
│   │   ├── Scene.tsx
│   │   └── Verification.tsx
│   ├── lib/
│   │   ├── verification.ts
│   │   └── verification.test.ts
│   ├── content.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── tsconfig.json
├── vite.config.ts
└── README.md
```

React + TypeScript strict, Vite, Tailwind CSS 4, Motion, Lucide. `content.ts` regroupe textes métier, paramètres et jeux de données. `verification.ts` ne fait qu’une recherche locale. `Verification.tsx` gère le formulaire, le délai de scan de 1,5 seconde et l’annonce accessible du résultat. `App.tsx` assemble les 13 parties : navigation, hero, problème, fonctionnement, démonstration, fonctionnalités, publics, recruteur, sécurité, tarifs, FAQ, contact et footer.

Le hero charge React Three Fiber / Drei après un délai, uniquement à partir de 1024 px, avec WebGL disponible et sans réduction des animations. Le document 3D utilise une texture Canvas locale, avec un vrai QR qui dirige vers la démo fictive de cette même page. Le repli HTML/CSS est utilisé sur mobile, sans WebGL, avec animations réduites ou en cas d’erreur de chargement. Les polices sont auto-hébergées. Aucun service payant, secret ou backend.

## Personnaliser

Dans `src/content.ts`, modifier :

| Paramètre | Valeur attendue |
| --- | --- |
| `WHATSAPP_NUMBER` | Numéro international en chiffres, sans `+`, espaces ni ponctuation |
| `CONTACT_EMAIL` | E-mail de contact réel |
| `GITHUB_REPOSITORY_NAME` | Nom du dépôt (défaut : `garant`) |
| `VERIFICATION_DOMAIN` | Réservé au futur portail ; volontairement inutilisé pour cette simulation locale |
| `PRODUCTION_SITE_URL` | URL publique absolue, pour le canonical après confirmation du domaine |
| `LEGAL_URL` | Lien vers les mentions légales complètes |
| `PRIVACY_URL` | Lien vers la politique de confidentialité complète |

Les contacts vides ne génèrent aucun lien invalide : les boutons affichent « Configuration nécessaire ». Les liens légaux restent des libellés à compléter tant que les URLs ne sont pas renseignées. Les métadonnées de partage sont centralisées dans `content.ts` et injectées dans `index.html` au build. Ne pas présenter les capacités prévues comme déjà disponibles en production.

## Publier sur GitHub Pages

1. Créer le dépôt GitHub et y placer **le contenu de ce dossier**, avec `.github` à sa racine.
2. Pousser sur la branche `main`.
3. Dans **Settings → Pages → Build and deployment**, sélectionner **GitHub Actions**.
4. Le workflow installe les dépendances verrouillées, exécute les tests et le build, puis publie `dist` avec les actions officielles GitHub Pages.
5. Le nom réel du dépôt est transmis automatiquement à Vite. Pour un site de type `utilisateur.github.io` ou un domaine à la racine, créer la variable de dépôt `VITE_BASE_PATH` avec la valeur `/`.
6. Configurer les coordonnées, liens légaux et `PRODUCTION_SITE_URL`, puis pousser à nouveau.

Build local avec un sous-chemin :

```sh
VITE_BASE_PATH=/mon-depot/ pnpm build
```

Aucune URL de production n’est inventée. Cette livraison ne crée pas de dépôt distant et ne publie pas elle-même sur GitHub.

## Qualité et limites

Les mesures effectivement réalisées sont consignées dans `VALIDATION.md`. Le build émet un avertissement sur la taille du fragment 3D : il est chargé séparément et uniquement sur les appareils éligibles. Aucun score Lighthouse 90+ n’est revendiqué sans mesure. L’authentification documentaire, la signature numérique, l’émission, la révocation et le stockage sécurisé réels sont hors de cette version.
