export const settings = {
  WHATSAPP_NUMBER: "",
  CONTACT_EMAIL: "",
  GITHUB_REPOSITORY_NAME: "garant",
  VERIFICATION_DOMAIN: "",
  PRODUCTION_SITE_URL: "https://seydoutra.github.io/garant/",
  LEGAL_URL: "",
  PRIVACY_URL: "",
};
// Variantes : « La confiance accompagne chacun de vos documents. »
// « Faites de vos attestations une preuve, partout. »
// « Une origine vérifiable. Une confiance qui circule. »
export const content = {
  institutional: {
    masthead: "PROJET GARANT · GUINÉE",
    descriptor: "Pour les établissements, les entreprises et les institutions",
    status: "Vitrine de démonstration · plateforme en développement",
  },
  securityScreens: {
    kicker: "DISPOSITIFS DE CONFIANCE",
    title: "Comprendre ce qui sécurise un document.",
    intro:
      "Six dispositifs complémentaires prévus pour le MVP. Les écrans ci-dessous sont des interfaces illustratives : ils ne réalisent aucune authentification réelle.",
    window: "GARANT · aperçu fonctionnel",
    notice: "ÉCRAN ILLUSTRATIF — FONCTION NON IMPLÉMENTÉE",
    record: "Institut Démo de Conakry",
    holder: "Aminata Exemple",
    reference: "GRT-7K4P-92X7",
    date: "14/10/2026",
    panels: [
      {
        code: "F1",
        tab: "Cachet et QR",
        title: "Un cachet vérifiable sur le document.",
        description:
          "Le QR prévu contient des données signées et conduit au vérificateur. La signature, l’identité de l’émetteur et le statut du document sont présentés séparément.",
        screenTitle: "Vérification du cachet",
        lines: [
          ["Cachet électronique", "Ed25519 · profil COSE_Sign1 prévu"],
          ["Organisation émettrice", "Institut Démo de Conakry"],
          ["Signature cryptographique", "Vérificateur non implémenté"],
          ["Statut du document", "Registre non connecté"],
        ],
        foot: "Sans synchronisation récente, la non-révocation ne pourra pas être confirmée.",
      },
      {
        code: "F2",
        tab: "Signature PDF",
        title: "L’intégrité du fichier, contrôlée séparément.",
        description:
          "Le PDF cible sera signé en dernière étape. Sa signature détectera les modifications des octets couverts ; le statut métier restera consultable dans le registre GARANT.",
        screenTitle: "Panneau de signature PDF",
        lines: [
          ["Document", "Attestation illustrative.pdf"],
          ["Profil cible", "PAdES B-B"],
          ["Certificat", "AC interne GARANT — prévue"],
          ["Validation indépendante", "À réaliser avant toute production"],
        ],
        foot: "Une AC interne ne confère pas une reconnaissance automatique dans les lecteurs PDF.",
      },
      {
        code: "F4",
        tab: "Photo liée",
        title: "Relier la photo au cachet électronique.",
        description:
          "La photo normalisée sera liée au cachet par son empreinte. Son accès public nécessitera une autorisation temporaire après vérification d’un cachet ou d’un code.",
        screenTitle: "Contrôle de la photo du titulaire",
        lines: [
          ["Titulaire fictif", "Aminata Exemple"],
          ["Photo normalisée prévue", "JPEG · 600 × 800"],
          ["Comparaison d’empreinte", "Non implémentée"],
          ["Accès temporaire prévu", "URL autorisée · 5 minutes"],
        ],
        foot: "La photo seule n’atteste pas l’identité ; le résultat d’empreinte devra être vérifié.",
      },
      {
        code: "F5",
        tab: "Code et SMS",
        title: "Une voie de vérification pour les téléphones simples.",
        description:
          "Un code court contrôlé permettra de consulter le statut sur le web ou par SMS. Les réponses réelles dépendront de passerelles configurées et testées.",
        screenTitle: "Aperçu de réponse SMS",
        lines: [
          ["Canal prévu", "Passerelle Android + Nimba"],
          ["Référence illustrative", "GRT-7K4P-92X7"],
          ["État de l’envoi", "Aucun SMS envoyé"],
          ["Données transmises", "Sans photo ni date de naissance"],
        ],
        foot: "Le numéro de service sera communiqué après configuration. Aucun numéro fictif n’est affiché.",
      },
      {
        code: "F6",
        tab: "Sécurité visuelle",
        title: "Des repères visuels propres à chaque document.",
        description:
          "Guilloches et microtexte seront générés de façon déterministe. Ces éléments sont dissuasifs : ils ne remplacent jamais une preuve cryptographique.",
        screenTitle: "Aperçu documentaire de calibration",
        lines: [
          ["Fond de document", "Guilloches vectorielles prévues"],
          ["Microtexte", "Nom fictif · référence illustrative"],
          ["Impression et photocopie", "Calibration terrain nécessaire"],
          ["Valeur probante", "Aucune preuve cryptographique"],
        ],
        foot: "Les tailles de QR et de microtexte devront être validées sur papier.",
      },
      {
        code: "F8",
        tab: "Révocation",
        title: "Un statut suivi après l’émission.",
        description:
          "Une révocation définitive sera confirmée par un administrateur autorisé, puis inscrite dans le registre et les listes signées. Le motif détaillé restera privé.",
        screenTitle: "Aperçu de document révoqué",
        lines: [
          ["Document fictif", "Attestation de travail"],
          ["État illustré", "RÉVOQUÉ — scénario de démonstration"],
          ["Date fictive", "14/10/2026"],
          ["Motif détaillé", "Non exposé au public"],
        ],
        foot: "La révocation métier ne modifie pas un PDF déjà téléchargé.",
      },
    ],
  },

  seo: {
    title: "GARANT — La confiance documentaire, depuis la Guinée",
    description:
      "Découvrez GARANT, projet de plateforme de confiance documentaire pour établissements, entreprises et institutions. Essayez la vérification fictive d’une attestation.",
    shareTitle: "GARANT — La confiance accompagne vos documents.",
    shareDescription:
      "Une preuve de confiance pour chaque document professionnel. Découvrez notre démonstration fictive.",
  },
  kickers: [
    "01 / LE CONSTAT",
    "02 / LE PARCOURS",
    "03 / ESSAYEZ GARANT",
    "04 / LES CAPACITÉS PRÉVUES",
    "05 / POUR QUI ?",
    "06 / CÔTÉ RECRUTEUR",
    "07 / SÉCURITÉ & CONFIANCE",
    "08 / LES OFFRES",
    "09 / VOS QUESTIONS",
    "10 / CONSTRUISONS LA CONFIANCE",
  ],
  brand: "GARANT",
  signature: "La confiance accompagne vos documents.",
  nav: [
    ["Accueil", "accueil"],
    ["Pourquoi GARANT", "pourquoi"],
    ["Fonctionnement", "fonctionnement"],
    ["Démonstration", "demonstration"],
    ["Fonctionnalités", "fonctionnalites"],
    ["Dispositifs", "dispositifs"],
    ["Tarifs", "tarifs"],
    ["FAQ", "faq"],
  ],
  demoCta: "Demander une démo",
  verifyCta: "Vérifier un document",
  eyebrow: "INFRASTRUCTURE DE CONFIANCE DOCUMENTAIRE",
  hero: "Chaque document institutionnel mérite une preuve de confiance.",
  description:
    "GARANT prépare une chaîne de confiance pour les documents des organisations publiques et privées. Une origine vérifiable, un statut consultable et des dispositifs adaptés aux documents imprimés.",
  indicators: [
    "Signature numérique",
    "Vérification par QR code",
    "Révocation contrôlée",
  ],
  launch: "GUINÉE · ÉTABLISSEMENTS · ENTREPRISES · INSTITUTIONS",
  future: "Capacité prévue · future plateforme",
  demoNotice: "DÉMONSTRATION — AUCUNE AUTHENTIFICATION RÉELLE",
  fictitious: "Données fictives · aucune certification réelle",
  problems: {
    title: "La confiance documentaire ne devrait pas être compliquée.",
    items: [
      [
        "Des documents trop faciles à modifier",
        "Une attestation peut circuler sans que son origine ou les données qu’elle contient puissent être confirmées.",
      ],
      [
        "Des vérifications qui prennent du temps",
        "Appels, e-mails et relances mobilisent les équipes RH pour chaque justificatif.",
      ],
      [
        "Une origine difficile à confirmer",
        "Un recruteur a besoin d’un lien clair entre le document, son titulaire et son organisation émettrice.",
      ],
    ],
  },
  steps: {
    title: "De l’émission à la confiance.",
    items: [
      [
        "Émettre",
        "L’entreprise sélectionne un modèle, renseigne les informations du titulaire ou importe une liste.",
      ],
      [
        "Signer",
        "Dans la plateforme cible, les données du document sont associées à une signature numérique vérifiable.",
      ],
      [
        "Vérifier",
        "Le destinataire scanne le QR code et consulte le résultat sur le portail officiel.",
      ],
    ],
  },
  verification: {
    title: "Vérifiez un document. Découvrez l’expérience GARANT.",
    subtitle: "Testez le parcours de vérification avec des documents fictifs.",
    label: "Identifiant du document",
    button: "Vérifier",
    loading: "Analyse du document de démonstration…",
    empty: "Saisissez un identifiant pour lancer la démonstration.",
    missing: "Document introuvable",
    missingBody:
      "Aucun document fictif ne correspond à cet identifiant. Vérifiez votre saisie ou essayez un exemple.",
    labels: [
      "Titulaire",
      "Document",
      "Émetteur",
      "Date d’émission",
      "Date de révocation",
      "Empreinte fictive",
    ],
    examples: ["GAR-DEMO-001", "GAR-DEMO-002", "GAR-DEMO-999"],
    statuses: ["Valide", "Révoqué", "Introuvable"],
  },
  features: {
    title: "Toute la chaîne documentaire. Une seule plateforme.",
    intro:
      "Une vision complète, de l’attestation au suivi de sa validité. Ces capacités sont prévues pour la future plateforme.",
    items: [
      [
        "Signature numérique",
        "Associer les données signées à leur organisation d’origine.",
      ],
      [
        "Vérification QR code",
        "Relier un document imprimé à son parcours de vérification.",
      ],
      [
        "Portail officiel",
        "Consulter les informations autorisées depuis un lien de vérification.",
      ],
      ["Révocation", "Garder le contrôle sur le statut des documents émis."],
      [
        "Émission en masse",
        "Préparer les émissions à partir de listes de titulaires.",
      ],
      [
        "Modèles personnalisés",
        "Préserver l’identité et les exigences de votre organisation.",
      ],
      ["Tableau de bord", "Suivre l’activité documentaire de votre équipe."],
      [
        "Historique des émissions",
        "Retrouver les opérations et les documents émis.",
      ],
    ],
  },
  audiences: {
    title: "Votre métier. Votre exigence de confiance.",
    items: [
      {
        name: "Entreprises",
        heading: "Des documents à la hauteur de votre entreprise.",
        benefits: [
          "Attestations de travail et certificats de stage",
          "Formations et certifications internes",
          "Suivi centralisé des documents émis",
        ],
        example:
          "Exemple fictif : une direction RH prépare les attestations de ses collaborateurs avec un modèle commun.",
      },
      {
        name: "Cabinets RH",
        heading: "Des contrôles documentaires mieux structurés.",
        benefits: [
          "Consultation de l’origine déclarée",
          "Lecture claire du statut documentaire",
          "Moins d’allers-retours lors des contrôles",
        ],
        example:
          "Exemple fictif : un cabinet consulte le lien autorisé d’une attestation avant de poursuivre un recrutement.",
      },
      {
        name: "Établissements de formation",
        heading: "Une reconnaissance qui accompagne les parcours.",
        benefits: [
          "Attestations de formation",
          "Certificats professionnels",
          "Diplômes et documents académiques, à terme",
        ],
        example:
          "Exemple fictif : un centre de formation prépare des certificats pour une promotion.",
      },
    ],
  },
  recruiter: {
    title: "Un scan. Une vérification. Une décision mieux informée.",
    body: "Dans le parcours cible, aucun compte ni application dédiée n’est nécessaire pour consulter un lien de vérification autorisé. Les informations rendues visibles restent sous le contrôle de l’organisation.",
    note: "Interface illustrative · données fictives",
  },
  security: {
    title: "La confiance se construit. Elle ne se décrète pas.",
    body: "Une architecture sécurisée est prévue pour la future plateforme. Cette vitrine ne signe pas de documents et ne valide aucune signature cryptographique.",
    items: [
      "Signatures numériques",
      "Contrôle des établissements émetteurs",
      "Révocation des documents",
      "Historique des opérations",
      "Identifiants de vérification non prédictibles",
      "Protection des données personnelles",
    ],
  },
  pricing: {
    title: "Une offre adaptée à votre organisation.",
    body: "Modèle prévu : abonnement + volume documentaire.",
    items: [
      [
        "Essentiel",
        "Pour petites structures.",
        "Modèles documentaires essentiels",
        "Émissions ponctuelles",
      ],
      [
        "Pro",
        "Pour entreprises et organisations à volume régulier.",
        "Émission en masse prévue",
        "Suivi documentaire centralisé",
      ],
      [
        "Institution",
        "Pour grandes organisations et besoins spécifiques.",
        "Modèles et parcours adaptés",
        "Accompagnement du déploiement",
      ],
    ],
    price: "Tarif sur demande",
    cta: "Parlons de vos besoins",
  },
  faq: {
    title: "Les réponses à vos questions.",
    items: [
      [
        "Comment fonctionne la vérification d’un document ?",
        "Dans le système cible, le lien de vérification permet de consulter l’origine, les données autorisées et le statut du document. La démonstration présente uniquement des résultats fictifs locaux.",
      ],
      [
        "Peut-on vérifier un document imprimé ?",
        "Le QR code prévu sur le document imprimé ouvre le lien de vérification. Une impression seule ne constitue pas une preuve d’authenticité.",
      ],
      [
        "Peut-on révoquer une attestation ?",
        "La révocation est une capacité prévue : une organisation autorisée pourra modifier le statut d’un document émis. La démo révoquée est un exemple fictif.",
      ],
      [
        "Faut-il installer une application ?",
        "Le parcours cible s’ouvre dans un navigateur depuis un lien autorisé, sans application dédiée ni compte pour la consultation.",
      ],
      [
        "Comment les données sont-elles protégées ?",
        "La future plateforme prévoit des droits d’accès, la limitation des données visibles et des mesures de sécurité adaptées. Aucune infrastructure de production ni certification de sécurité n’est revendiquée à ce stade.",
      ],
      [
        "Comment une entreprise peut-elle commencer ?",
        "Prenez contact pour présenter vos documents, vos volumes et vos contraintes. Les coordonnées de contact doivent être configurées avant le lancement public.",
      ],
    ],
  },
  contact: {
    title: "Donnez à vos documents la preuve qu’ils méritent.",
    body: "Entreprises, responsables RH, cabinets de recrutement : préparons une nouvelle façon d’émettre et de vérifier vos documents professionnels.",
    whatsapp: "Demander une démo sur WhatsApp",
    email: "Contacter GARANT par e-mail",
    unconfigured: "Coordonnées à configurer avant le lancement.",
    configure: "Configuration nécessaire",
    legal: "Mentions légales — à compléter",
    privacy: "Politique de confidentialité — à compléter",
    location: "Conakry, Guinée",
    footer:
      "La future infrastructure de confiance pour vos documents professionnels.",
  },
  ui: {
    navLabel: "Navigation principale",
    mobileNavLabel: "Navigation mobile",
    footerNavLabel: "Navigation de pied de page",
    skip: "Aller au contenu",
    menu: "Ouvrir le menu",
    close: "Fermer le menu",
    planned: "PLATEFORME EN DÉVELOPPEMENT",
    proof: "Une preuve qui accompagne le document.",
    documentTitle: "ATTESTATION DE TRAVAIL",
    documentOrg: "Entreprise Démo Conakry",
    documentName: "Aminata Exemple",
    documentBody: "Attestation illustrative d’activité professionnelle.",
    documentId: "GAR-DEMO-001",
    badge: "DOCUMENT VALIDE — DÉMONSTRATION",
    fingerprint: "DEMO · 9F2A 78C1 B4D0 E6A3",
    qr: "QR de démonstration : ouvrir la simulation locale",
    example: "EXEMPLE D’USAGE",
    recruiter: "CÔTÉ RECRUTEUR",
    security: "SÉCURITÉ & CONFIANCE",
    popular: "VOLUME RÉGULIER",
    status: "Statut",
    date: "15/09/2026",
    copyright: "Tous droits réservés.",
  },
};
export type DemoDocument = {
  id: string;
  holder: string;
  type: string;
  issuer: string;
  date: string;
  status: "valid" | "revoked";
  revokedAt?: string;
  fingerprint?: string;
};
export const demoDocuments: DemoDocument[] = [
  {
    id: "GAR-DEMO-001",
    holder: "Aminata Exemple",
    type: "Attestation de travail",
    issuer: "Entreprise Démo Conakry",
    date: "15/09/2026",
    status: "valid",
    fingerprint: "DEMO-9F2A-78C1-B4D0-E6A3",
  },
  {
    id: "GAR-DEMO-002",
    holder: "Mamadou Exemple",
    type: "Certificat de stage",
    issuer: "Cabinet RH Démo",
    date: "10/06/2026",
    revokedAt: "20/09/2026",
    status: "revoked",
  },
];
