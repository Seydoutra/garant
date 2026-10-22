import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type FormEvent,
} from "react";
import { MotionConfig, motion } from "motion/react";
import {
  ArrowUpRight,
  ArrowRight,
  ShieldCheck,
  ScanLine,
  LockKeyhole,
  Building2,
  Layers3,
  QrCode,
  FileCheck2,
  Check,
  Menu,
  X,
  Plus,
  Minus,
  Download,
  Globe2,
  Fingerprint,
  Workflow,
} from "lucide-react";
import { content as c, settings } from "./content";
import { Document } from "./components/Document";
import { Verification } from "./components/Verification";
import { SecurityShowcase } from "./components/SecurityShowcase";
const nav = [
  ["La plateforme", "plateforme"],
  ["Les protections", "dispositifs"],
  ["Le parcours", "fonctionnement"],
  ["Démonstration", "demonstration"],
];
const uses = [
  {
    name: "Personnes & compétences",
    category: "RESSOURCES HUMAINES",
    title: "Le parcours d’une personne.\nUne origine à vérifier.",
    body: "Attestations, qualifications ou habilitations : rattacher chaque document à une organisation compétente et aux données qu’elle autorise à consulter.",
    icon: Fingerprint,
    ref: "ATTESTATION NOMINATIVE",
    fields: [
      "Sujet du document",
      "Organisation émettrice",
      "Version et statut",
    ],
  },
  {
    name: "Organisations & correspondances",
    category: "ADMINISTRATION & ENTREPRISES",
    title: "Une correspondance officielle.\nUn circuit maîtrisé.",
    body: "Lettres, décisions et correspondances suivent une préparation et une approbation liées à une version précise du contenu.",
    icon: Building2,
    ref: "LETTRE OFFICIELLE",
    fields: [
      "Référence de l’organisme",
      "Destinataire autorisé",
      "Approbateur habilité",
    ],
  },
  {
    name: "Projets & actifs",
    category: "OPÉRATIONS & INGÉNIERIE",
    title: "Le bon document.\nPour le bon objet.",
    body: "Rapports techniques et dossiers peuvent concerner un projet, un équipement ou un bien. Les annexes et leurs empreintes font partie du périmètre cible.",
    icon: Layers3,
    ref: "RAPPORT TECHNIQUE",
    fields: [
      "Projet ou équipement",
      "Constatations documentées",
      "Référence des annexes",
    ],
  },
];
const steps = [
  {
    no: "01",
    title: "Définir les règles",
    text: "L’organisation configure ses types de documents, les champs requis, les habilitations et la confidentialité.",
    icon: Building2,
    label: "Organisation → type documentaire",
  },
  {
    no: "02",
    title: "Préparer & approuver",
    text: "Un préparateur renseigne le document. Une personne habilitée contrôle la version exacte avant l’émission.",
    icon: Workflow,
    label: "Brouillon → approbation",
  },
  {
    no: "03",
    title: "Émettre une preuve",
    text: "Le pipeline cible fige le contenu, produit le cachet et le PDF signé, puis conserve les preuves et empreintes.",
    icon: FileCheck2,
    label: "Signature → document final",
  },
  {
    no: "04",
    title: "Vérifier dans le temps",
    text: "Le vérificateur doit distinguer signature, émetteur et statut à jour, y compris après une révocation.",
    icon: ScanLine,
    label: "Vérification → suivi du statut",
  },
];
function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
function Logo() {
  return (
    <a className="logo" href="#accueil" aria-label="GARANT, accueil">
      <span className="brand-symbol">
        <ShieldCheck size={23} />
      </span>
      GARANT<span className="brand-period">.</span>
    </a>
  );
}
function Brief() {
  const [done, setDone] = useState(false);
  function download(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const text = `BRIEF DE DÉMONSTRATION GARANT\n\nOrganisation : ${values.organization}\nType de structure : ${values.kind}\nDocuments concernés : ${values.documents}\nVolume mensuel estimé : ${values.volume}\nContraintes / besoins : ${values.needs}\n\nBrief préparé localement, aucun envoi automatique.\nPlateforme en développement : périmètre pilote à convenir.\n`;
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "garant-brief-demonstration.txt";
    link.click();
    URL.revokeObjectURL(url);
    setDone(true);
  }
  return (
    <form className="brief-form" onSubmit={download}>
      <div className="form-pair">
        <label>
          Votre organisation
          <input
            name="organization"
            required
            maxLength={160}
            placeholder="Nom de l’organisation"
          />
        </label>
        <label>
          Votre structure
          <select name="kind">
            <option>Entreprise</option>
            <option>Organisme public</option>
            <option>Association</option>
            <option>Autre organisation</option>
          </select>
        </label>
      </div>
      <label>
        Quels documents souhaitez-vous sécuriser ?
        <input
          name="documents"
          required
          maxLength={300}
          placeholder="Lettres, attestations, rapports techniques…"
        />
      </label>
      <div className="form-pair">
        <label>
          Volume mensuel estimé
          <select name="volume">
            <option>À préciser</option>
            <option>Moins de 100</option>
            <option>100 à 1 000</option>
            <option>Plus de 1 000</option>
          </select>
        </label>
        <label>
          Vos priorités
          <input
            name="needs"
            maxLength={500}
            placeholder="Confidentialité, validation, intégration…"
          />
        </label>
      </div>
      <button className="button ink" type="submit">
        Télécharger mon brief <Download size={17} />
      </button>
      <p className="form-note" role="status">
        {done
          ? "Votre brief a été préparé. Aucun message n’a été envoyé."
          : "Un document pour cadrer votre projet. Téléchargement local, sans envoi automatique."}
      </p>
    </form>
  );
}
export default function App() {
  const [menu, setMenu] = useState(false);
  const [activeUse, setActiveUse] = useState(0);
  const [faq, setFaq] = useState<number | null>(0);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu(false);
        menuButton.current?.focus();
      }
    };
    if (menu) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [menu]);
  const preview = new URLSearchParams(location.search).get("apercu");
  const previewIndex = c.securityScreens.panels.findIndex(
    (p) => p.code === preview,
  );
  if (previewIndex >= 0)
    return (
      <main className="screenshot-page">
        <SecurityShowcase initialIndex={previewIndex} />
      </main>
    );
  const use = uses[activeUse]!;
  const UseIcon = use.icon;
  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#contenu">
        Aller au contenu
      </a>
      <div className="site-shell">
        <header className="site-header">
          <Logo />
          <nav
            className={menu ? "main-nav is-open" : "main-nav"}
            id="main-navigation"
            aria-label="Navigation principale"
          >
            {nav.map(([label, id]) => (
              <a key={id} href={`#${id}`} onClick={() => setMenu(false)}>
                {label}
              </a>
            ))}
          </nav>
          <a className="button small ink header-cta" href="#contact">
            Préparer une démo <ArrowUpRight size={15} />
          </a>
          <button
            ref={menuButton}
            className="menu-button"
            aria-expanded={menu}
            aria-controls="main-navigation"
            aria-label={menu ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </header>
        <main id="contenu">
          <section className="hero" id="accueil">
            <div className="hero-grid" aria-hidden="true" />
            <Reveal className="hero-content">
              <a className="availability" href="#avancement">
                <span />
                Une infrastructure de confiance, en construction{" "}
                <ArrowUpRight size={13} />
              </a>
              <h1>
                La confiance.
                <br />
                <span>À chaque</span> document.
              </h1>
              <p className="hero-description">
                Préparer, approuver et vérifier les documents qui engagent votre
                organisation. Une même chaîne de confiance, du premier brouillon
                à la preuve.
              </p>
              <div className="hero-actions">
                <a className="button ink" href="#demonstration">
                  Explorer la démonstration <ArrowUpRight size={17} />
                </a>
                <a className="text-link" href="#plateforme">
                  Découvrir GARANT <ArrowRight size={16} />
                </a>
              </div>
              <div className="hero-note">
                <span className="tiny-shield">
                  <ShieldCheck size={15} />
                </span>
                <p>
                  Conçu en Guinée. Pensé pour les organisations.
                  <br />
                  <strong>Plateforme bêta en développement.</strong>
                </p>
              </div>
            </Reveal>
            <div className="hero-object">
              <div className="orbital-ring ring-one" />
              <div className="orbital-ring ring-two" />
              <div className="floating-label">
                <span className="dot" />
                UNE ORIGINE. UNE VERSION. UN STATUT.
              </div>
              <div className="hero-document">
                <Document />
              </div>
              <div className="floating-card flow-card">
                <span className="icon-tile">
                  <Workflow size={20} />
                </span>
                <div>
                  <small>UN CIRCUIT CONTRÔLÉ</small>
                  <strong>Préparer → Approuver</strong>
                  <span>Habilitations par organisation</span>
                </div>
              </div>
              <div className="floating-card qr-card">
                <QrCode size={38} />
                <div>
                  <small>VÉRIFICATION CIBLE</small>
                  <strong>Une preuve à consulter</strong>
                </div>
                <ArrowUpRight size={17} />
              </div>
              <span className="hero-object-note">
                Illustration · données fictives · aucune émission réelle
              </span>
            </div>
          </section>
          <section className="sector-strip" aria-label="Publics concernés">
            <span>
              UNE MÊME EXIGENCE
              <br />
              <strong>POUR CHAQUE ORGANISATION</strong>
            </span>
            <div>
              <Building2 size={22} /> Organismes publics
            </div>
            <div>
              <Layers3 size={22} /> Entreprises
            </div>
            <div>
              <Globe2 size={22} /> Associations
            </div>
            <a href="#usages">
              Et vos métiers <ArrowUpRight size={17} />
            </a>
          </section>
          <section className="section introduction" id="plateforme">
            <Reveal className="section-heading">
              <p className="eyebrow">01 — UNE COUCHE DE CONFIANCE</p>
              <h2>
                Vos documents circulent.
                <br />
                <span>La confiance doit suivre.</span>
              </h2>
              <p className="section-intro">
                Un document a une origine, un contenu et une histoire. GARANT
                relie ces dimensions pour aider une organisation à émettre dans
                son périmètre et un tiers à vérifier ce qu’il peut réellement
                confirmer.
              </p>
            </Reveal>
            <div className="benefit-grid">
              <Reveal className="benefit-card primary-benefit">
                <span className="card-index">01 / ORIGINE</span>
                <div className="trust-seal">
                  <ShieldCheck size={51} />
                  <svg viewBox="0 0 200 200" aria-hidden="true">
                    {Array.from({ length: 12 }, (_, i) => (
                      <ellipse
                        key={i}
                        cx="100"
                        cy="100"
                        rx="70"
                        ry="29"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth=".6"
                        transform={`rotate(${i * 15} 100 100)`}
                      />
                    ))}
                  </svg>
                </div>
                <h3>
                  Relier le document
                  <br />à son émetteur.
                </h3>
                <p>
                  L’identité d’une organisation et ses habilitations doivent
                  être distinguées de la seule présence d’un logo ou d’une
                  signature visible.
                </p>
                <span className="mini-chip">
                  <LockKeyhole size={12} /> Contrôle d’accès organisationnel
                </span>
              </Reveal>
              <Reveal className="benefit-card">
                <span className="card-index">02 / INTÉGRITÉ</span>
                <div className="version-art" aria-hidden="true">
                  <span>
                    Version 01 <i>Brouillon</i>
                  </span>
                  <ArrowRight />
                  <span>
                    Version 02 <i>À approuver</i>
                  </span>
                  <div className="hash-line">
                    SHA-256 · CONTENU DE LA VERSION
                  </div>
                </div>
                <h3>
                  Approuver le bon contenu.
                  <br />
                  Conserver la bonne version.
                </h3>
                <p>
                  Une modification crée une nouvelle version. Une approbation
                  ancienne ne devient pas une autorisation de signer un contenu
                  différent.
                </p>
              </Reveal>
              <Reveal className="benefit-card">
                <span className="card-index">03 / CYCLE DE VIE</span>
                <div className="lifecycle-art" aria-hidden="true">
                  <div>
                    <span />
                    Préparation <small>01</small>
                  </div>
                  <div>
                    <span />
                    Approbation <small>02</small>
                  </div>
                  <div>
                    <span />
                    Émission & suivi <small>CIBLE</small>
                  </div>
                </div>
                <h3>
                  Suivre le statut.
                  <br />
                  Garder l’historique.
                </h3>
                <p>
                  Le modèle cible conserve les événements d’émission, de
                  remplacement et de révocation, sans effacer le parcours du
                  document.
                </p>
              </Reveal>
            </div>
            <div className="truth-note">
              <ShieldCheck size={18} />
              <p>
                Une signature peut prouver une intégrité et une origine.{" "}
                <strong>
                  Elle ne rend pas automatiquement une déclaration vraie.
                </strong>
              </p>
            </div>
          </section>
          <section className="section use-section" id="usages">
            <Reveal className="split-heading">
              <div>
                <p className="eyebrow">02 — UN SOCLE TRANSVERSAL</p>
                <h2>
                  Un même moteur.
                  <br />
                  <span>Vos documents, vos règles.</span>
                </h2>
              </div>
              <p>
                La confiance documentaire dépasse un format ou un secteur.
                GARANT est conçu pour s’adapter à l’objet et aux compétences de
                chaque organisation.
              </p>
            </Reveal>
            <div
              className="use-tabs"
              role="tablist"
              aria-label="Exemples de contextes documentaires"
            >
              {uses.map((item, i) => (
                <button
                  key={item.name}
                  role="tab"
                  id={`use-tab-${i}`}
                  aria-controls={`use-panel-${i}`}
                  aria-selected={i === activeUse}
                  tabIndex={i === activeUse ? 0 : -1}
                  onKeyDown={(event) => {
                    const next =
                      event.key === "ArrowRight"
                        ? (i + 1) % uses.length
                        : event.key === "ArrowLeft"
                          ? (i - 1 + uses.length) % uses.length
                          : event.key === "Home"
                            ? 0
                            : event.key === "End"
                              ? uses.length - 1
                              : null;
                    if (next === null) return;
                    event.preventDefault();
                    setActiveUse(next);
                    document.getElementById(`use-tab-${next}`)?.focus();
                  }}
                  onClick={() => setActiveUse(i)}
                >
                  {item.name}
                  <ArrowUpRight size={16} />
                </button>
              ))}
            </div>
            <div
              className="use-panel"
              role="tabpanel"
              id={`use-panel-${activeUse}`}
              aria-labelledby={`use-tab-${activeUse}`}
            >
              <div className="use-copy">
                <span className="eyebrow">{use.category}</span>
                <h3>{use.title}</h3>
                <p>{use.body}</p>
                <a className="text-link" href="#contact">
                  Cadrer ce cas d’usage <ArrowUpRight size={17} />
                </a>
              </div>
              <div className="use-art">
                <div className="use-art-orbit" />
                <div className="use-document">
                  <UseIcon size={30} />
                  <small>GARANT · MODÈLE DE DÉPART</small>
                  <h4>{use.ref}</h4>
                  {use.fields.map((field) => (
                    <div key={field}>
                      <span>{field}</span>
                      <span className="field-placeholder" />
                    </div>
                  ))}
                  <span className="illustration-label">
                    EXEMPLE ILLUSTRATIF · AUCUN DOCUMENT ÉMIS
                  </span>
                </div>
                <div className="use-floating">
                  <Layers3 size={19} />
                  <span>
                    Un schéma versionné
                    <br />
                    <strong>pour chaque type documentaire</strong>
                  </span>
                </div>
              </div>
            </div>
          </section>
          <div className="security-wrap">
            <SecurityShowcase />
          </div>
          <section className="section process-section" id="fonctionnement">
            <Reveal className="split-heading">
              <div>
                <p className="eyebrow">04 — UN PARCOURS MAÎTRISÉ</p>
                <h2>
                  De la préparation
                  <br />
                  <span>à la vérification.</span>
                </h2>
              </div>
              <div>
                <p>
                  Un circuit qui sépare les responsabilités et rattache chaque
                  décision à une version du document.
                </p>
                <a className="button outline" href="#demonstration">
                  Voir la démonstration <ArrowUpRight size={16} />
                </a>
              </div>
            </Reveal>
            <div className="process-grid">
              {steps.map((step) => (
                <Reveal key={step.no} className="process-card">
                  <div className="process-top">
                    <span>{step.no}</span>
                    <step.icon size={25} />
                  </div>
                  <div className="process-visual">
                    <i />
                    <small>{step.label}</small>
                    <ArrowRight size={16} />
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </Reveal>
              ))}
            </div>
            <p className="section-footnote">
              Parcours cible. Le socle de données et les interfaces se
              développent par étapes ; l’émission signée reste à valider.
            </p>
          </section>
          <section className="demo-section section" id="demonstration">
            <Reveal className="split-heading">
              <div>
                <p className="eyebrow">05 — EXPLORER L’EXPÉRIENCE</p>
                <h2>
                  Une vérification claire.
                  <br />
                  <span>Essayez le principe.</span>
                </h2>
              </div>
              <p>
                Trois scénarios locaux pour comprendre les réponses : document
                fictif valide, révoqué ou inconnu. Cette simulation ne consulte
                pas le registre Supabase.
              </p>
            </Reveal>
            <Verification />
          </section>
          <section className="section deployment-section" id="offres">
            <Reveal className="section-heading">
              <p className="eyebrow">06 — CHOISIR SON CADRE</p>
              <h2>
                Votre organisation.
                <br />
                <span>Votre façon de déployer.</span>
              </h2>
              <p className="section-intro">
                Trois modes prévus, selon vos volumes, vos systèmes existants et
                vos exigences d’hébergement. Périmètre et tarifs à définir lors
                du cadrage.
              </p>
            </Reveal>
            <div className="deployment-grid">
              {[
                {
                  name: "SaaS autonome",
                  label: "UN ESPACE ORGANISATION",
                  text: "Préparer et suivre les documents dans une application commune.",
                  items: [
                    "Types et modèles documentaires",
                    "Utilisateurs et habilitations",
                    "Parcours d’approbation",
                  ],
                  icon: Building2,
                },
                {
                  name: "Service intégré",
                  label: "PROLONGER VOS OUTILS",
                  text: "Ajouter une couche de preuve à un système métier existant.",
                  items: [
                    "API versionnée — à implémenter",
                    "Permissions par organisation",
                    "Événements et webhooks — prévus",
                  ],
                  icon: Workflow,
                },
                {
                  name: "Déploiement souverain",
                  label: "VOTRE INFRASTRUCTURE",
                  text: "Préparer une exploitation dédiée, avec des adaptateurs portables.",
                  items: [
                    "Hébergement dédié — cible",
                    "Adaptateurs Auth et Storage",
                    "Exigences d’exploitation à cadrer",
                  ],
                  icon: Globe2,
                },
              ].map((plan, i) => (
                <Reveal
                  key={plan.name}
                  className={`deployment-card ${i === 1 ? "featured" : ""}`}
                >
                  <span className="card-index">{plan.label}</span>
                  <plan.icon className="deployment-icon" size={27} />
                  <h3>{plan.name}</h3>
                  <p>{plan.text}</p>
                  <div className="price-label">
                    Sur étude <small>Offre en préparation</small>
                  </div>
                  <a
                    className={`button ${i === 1 ? "light" : "outline"}`}
                    href="#contact"
                  >
                    Préparer le cadrage <ArrowUpRight size={17} />
                  </a>
                  <ul>
                    {plan.items.map((item) => (
                      <li key={item}>
                        <Check size={15} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ))}
            </div>
          </section>
          <section className="section progress-section" id="avancement">
            <div className="progress-intro">
              <p className="eyebrow">LE PROJET, EN TOUTE CLARTÉ</p>
              <h2>
                Construire la confiance
                <br />
                commence par la transparence.
              </h2>
              <p>
                GARANT est une plateforme en développement. La vitrine présente
                la vision du produit et ses dispositifs cibles, sans revendiquer
                de certification ni d’affiliation officielle.
              </p>
            </div>
            <div className="progress-list">
              <div>
                <span className="progress-marker ready" />
                <h3>Socle de données</h3>
                <p>
                  Schéma transversal, contrôles d’accès et buckets privés
                  préparés sur le projet Supabase autorisé.
                </p>
              </div>
              <div>
                <span className="progress-marker current" />
                <h3>Application bêta</h3>
                <p>
                  Raccordement de l’authentification et de la double
                  authentification, puis validation des parcours réels.
                </p>
              </div>
              <div>
                <span className="progress-marker" />
                <h3>Émission sécurisée</h3>
                <p>
                  Signature du cachet et du PDF, validation indépendante,
                  vérification et révocation restent à compléter.
                </p>
              </div>
            </div>
          </section>
          <section className="section faq-section" id="faq">
            <Reveal className="faq-heading">
              <p className="eyebrow">07 — VOS QUESTIONS</p>
              <h2>
                Quelques réponses.
                <br />
                <span>Sans zone d’ombre.</span>
              </h2>
              <p>
                Un projet particulier ? Le brief de cadrage permet de préciser
                vos documents, vos volumes et vos contraintes.
              </p>
              <a className="button outline" href="#contact">
                Préparer mon projet <ArrowUpRight size={16} />
              </a>
            </Reveal>
            <div className="faq-list">
              {c.faq.items.map(([q, a], i) => (
                <div className={`faq-item ${faq === i ? "open" : ""}`} key={q}>
                  <h3>
                    <button
                      aria-expanded={faq === i}
                      aria-controls={`faq-answer-${i}`}
                      id={`faq-question-${i}`}
                      onClick={() => setFaq(faq === i ? null : i)}
                    >
                      {q}
                      {faq === i ? <Minus size={19} /> : <Plus size={19} />}
                    </button>
                  </h3>
                  <div
                    id={`faq-answer-${i}`}
                    role="region"
                    aria-labelledby={`faq-question-${i}`}
                    hidden={faq !== i}
                  >
                    <p>{a}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="contact-section section" id="contact">
            <Reveal className="contact-copy">
              <span className="availability">
                <span />
                Cadrons votre futur pilote
              </span>
              <h2>
                Vos documents méritent
                <br />
                <span>une confiance qui dure.</span>
              </h2>
              <p>
                Décrivez les documents de votre organisation et les contrôles
                attendus. Préparez un brief pour une démonstration adaptée à vos
                besoins.
              </p>
              <div className="contact-location">
                <Globe2 size={18} /> Conakry, Guinée · Organisations publiques
                et privées
              </div>
              {settings.CONTACT_EMAIL && (
                <a
                  className="text-link"
                  href={`mailto:${settings.CONTACT_EMAIL}`}
                >
                  {settings.CONTACT_EMAIL}
                  <ArrowUpRight size={16} />
                </a>
              )}
            </Reveal>
            <div className="contact-form-card">
              <h3>Commençons par votre contexte.</h3>
              <Brief />
            </div>
          </section>
        </main>
        <footer className="site-footer">
          <div className="footer-top">
            <Logo />
            <p>
              Une couche de confiance.
              <br />
              Pour les documents qui comptent.
            </p>
            <a href="#accueil" className="back-top" aria-label="Retour en haut">
              <ArrowUpRight />
            </a>
          </div>
          <div className="footer-bottom">
            <span>
              © {new Date().getFullYear()} GARANT · Projet en développement
            </span>
            <nav aria-label="Navigation de pied de page">
              <a href="#avancement">État du projet</a>
              <a href="#faq">FAQ</a>
              <a href="#contact">Démonstration</a>
            </nav>
            <span>Conçu en Guinée</span>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}
