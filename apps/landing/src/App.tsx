import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, MotionConfig } from "motion/react";
import {
  ArrowUpRight,
  ArrowRight,
  ShieldCheck,
  ScanLine,
  Fingerprint,
  FilePenLine,
  Clock3,
  Building2,
  LockKeyhole,
  Layers3,
  QrCode,
  Globe2,
  Ban,
  Files,
  LayoutDashboard,
  History,
  Check,
  Menu,
  X,
  ChevronDown,
  Mail,
  MessageCircle,
  GraduationCap,
  BriefcaseBusiness,
} from "lucide-react";
import { content as c, settings, demoDocuments } from "./content";
import { HeroVisual } from "./components/HeroVisual";
import { Verification } from "./components/Verification";
import { SecurityShowcase } from "./components/SecurityShowcase";
function Logo() {
  return (
    <a className="logo" href="#accueil">
      <ShieldCheck />
      <span>{c.brand}</span>
    </a>
  );
}
function Section({
  id,
  kicker,
  title,
  children,
  intro,
}: {
  id?: string;
  kicker: string;
  title: string;
  children: ReactNode;
  intro?: string;
}) {
  return (
    <section id={id} className="section">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.45 }}
      >
        <p className="eyebrow">{kicker}</p>
        <h2>{title}</h2>
        {intro && <p className="intro">{intro}</p>}
        {children}
      </motion.div>
    </section>
  );
}
function App() {
  const [menu, setMenu] = useState(false);
  const [tab, setTab] = useState(0);
  const menuButton = useRef<HTMLButtonElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => {
    if (settings.PRODUCTION_SITE_URL) {
      const link = document.createElement("link");
      link.rel = "canonical";
      link.href = settings.PRODUCTION_SITE_URL;
      document.head.appendChild(link);
      return () => link.remove();
    }
  }, []);
  useEffect(() => {
    if (!menu) return;
    function close(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenu(false);
        menuButton.current?.focus();
      }
    }
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [menu]);
  const featureIcons = [
    Fingerprint,
    QrCode,
    Globe2,
    Ban,
    Files,
    FilePenLine,
    LayoutDashboard,
    History,
  ];
  const audience = c.audiences.items[tab];
  const doc = demoDocuments[0];
  const contactLink = (kind: "wa" | "email") =>
    kind === "wa"
      ? /^\d{8,15}$/.test(settings.WHATSAPP_NUMBER)
        ? `https://wa.me/${settings.WHATSAPP_NUMBER}`
        : null
      : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.CONTACT_EMAIL)
        ? `mailto:${settings.CONTACT_EMAIL}`
        : null;
  const previewCode = new URLSearchParams(window.location.search).get("apercu");
  const previewIndex = c.securityScreens.panels.findIndex(panel => panel.code === previewCode);
  if (previewIndex >= 0) return <main className="screen-export"><SecurityShowcase initialIndex={previewIndex}/></main>;
  return (
    <MotionConfig reducedMotion="user">
      <a className="skip" href="#main">
        {c.ui.skip}
      </a>
      <div className="institutional-bar">
        <span>{c.institutional.masthead}</span>
        <span>{c.institutional.descriptor}</span>
      </div>
      <header>
        <div className="nav-wrap">
          <Logo />
          <nav aria-label={c.ui.navLabel} className="desktop-nav">
            {c.nav.map(([name, id]) => (
              <a href={"#" + id} key={id}>
                {name}
              </a>
            ))}
          </nav>
          <a className="nav-cta" href="#contact">
            {c.demoCta}
            <ArrowUpRight size={16} />
          </a>
          <button
            ref={menuButton}
            className="mobile-toggle"
            aria-label={menu ? c.ui.close : c.ui.menu}
            aria-expanded={menu}
            aria-controls="mobile-nav"
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
        {menu && (
          <nav
            id="mobile-nav"
            className="mobile-nav"
            aria-label={c.ui.mobileNavLabel}
          >
            {c.nav.map(([name, id]) => (
              <a key={id} href={"#" + id} onClick={() => setMenu(false)}>
                {name}
              </a>
            ))}
            <a href="#contact" onClick={() => setMenu(false)}>
              {c.demoCta}
            </a>
          </nav>
        )}
      </header>
      <main id="main">
        <section id="accueil" className="hero">
          <div className="perspective-grid" />
          <div className="hero-content">
            <p className="eyebrow">
              <span className="dot" />
              {c.eyebrow}
            </p>
            <h1>
              {c.hero.slice(0, c.hero.indexOf("preuve"))}
              <em>{c.hero.slice(c.hero.indexOf("preuve"))}</em>
            </h1>
            <p className="hero-description">{c.description}</p>
            <div className="actions">
              <a className="button primary" href="#contact">
                {c.demoCta}
                <ArrowUpRight size={18} />
              </a>
              <a className="button secondary" href="#demonstration">
                <ScanLine size={18} />
                {c.verifyCta}
              </a>
            </div>
            <div className="indicators">
              {c.indicators.map((item, i) => {
                const Icon = [Fingerprint, QrCode, ShieldCheck][i];
                return (
                  <span key={item}>
                    <Icon size={15} />
                    {item}
                  </span>
                );
              })}
            </div>
            <p className="hero-note">{c.ui.planned}</p>
          </div>
          <HeroVisual />
          <div className="hero-bottom">
            <span>{c.launch}</span>
            <span className="brand-signature">{c.signature}</span>
            <a href="#pourquoi" aria-label={c.nav[1][0]}>
              <ArrowRight size={18} />
            </a>
          </div>
        </section>
        <SecurityShowcase />
        <Section id="pourquoi" kicker={c.kickers[0]} title={c.problems.title}>
          <div className="cards three">
            {c.problems.items.map(([title, body], i) => {
              const Icon = [FilePenLine, Clock3, Building2][i];
              return (
                <article className="card problem" key={title}>
                  <Icon />
                  <span className="card-number">0{i + 1}</span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              );
            })}
          </div>
        </Section>
        <Section
          id="fonctionnement"
          kicker={c.kickers[1]}
          title={c.steps.title}
          intro={c.future}
        >
          <div className="steps">
            {c.steps.items.map(([title, body], i) => (
              <article key={title}>
                <span className="step-index mono">0{i + 1}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </Section>
        <Section
          id="demonstration"
          kicker={c.kickers[2]}
          title={c.verification.title}
          intro={c.verification.subtitle}
        >
          <Verification />
        </Section>
        <Section
          id="fonctionnalites"
          kicker={c.kickers[3]}
          title={c.features.title}
          intro={c.features.intro}
        >
          <div className="bento">
            {c.features.items.map(([title, body], i) => {
              const Icon = featureIcons[i];
              return (
                <article className={"card feature feature-" + i} key={title}>
                  <Icon />
                  <h3>{title}</h3>
                  <p>{body}</p>
                  {i === 0 && (
                    <div className="digital mono">
                      {c.ui.fingerprint}
                      <div className="digital-bars">
                        {Array.from({ length: 24 }, (_, j) => (
                          <i key={j} style={{ height: 18 + ((j * 13) % 56) }} />
                        ))}
                      </div>
                    </div>
                  )}
                  {i === 1 && <QrCode className="big-qr" />}
                </article>
              );
            })}
          </div>
        </Section>
        <Section id="pour-qui" kicker={c.kickers[4]} title={c.audiences.title}>
          <div role="tablist" aria-label={c.audiences.title} className="tabs">
            {c.audiences.items.map((item, i) => (
              <button
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                role="tab"
                aria-selected={tab === i}
                aria-controls={"audience-" + i}
                id={"tab-" + i}
                tabIndex={tab === i ? 0 : -1}
                key={item.name}
                onClick={() => setTab(i)}
                onKeyDown={(e) => {
                  const next =
                    e.key === "ArrowRight"
                      ? (i + 1) % 3
                      : e.key === "ArrowLeft"
                        ? (i + 2) % 3
                        : e.key === "Home"
                          ? 0
                          : e.key === "End"
                            ? 2
                            : null;
                  if (next !== null) {
                    e.preventDefault();
                    setTab(next);
                    tabs.current[next]?.focus();
                  }
                }}
              >
                {item.name}
              </button>
            ))}
          </div>
          <div
            className="audience-panel"
            role="tabpanel"
            tabIndex={0}
            id={"audience-" + tab}
            aria-labelledby={"tab-" + tab}
          >
            <div>
              <h3>{audience.heading}</h3>
              <ul>
                {audience.benefits.map((b) => (
                  <li key={b}>
                    <Check size={18} />
                    {b}
                  </li>
                ))}
              </ul>
              <p className="example">
                <span className="eyebrow">{c.ui.example}</span>
                {audience.example}
              </p>
            </div>
            <div className="audience-visual">
              {tab === 0 ? (
                <Building2 size={100} />
              ) : tab === 1 ? (
                <BriefcaseBusiness size={100} />
              ) : (
                <GraduationCap size={100} />
              )}
              <span>{audience.name}</span>
              <span className="mono">{c.future}</span>
            </div>
          </div>
        </Section>
        <Section kicker={c.kickers[5]} title={c.recruiter.title}>
          <div className="recruiter-grid">
            <div>
              <p className="intro">{c.recruiter.body}</p>
              <div className="recruiter-point">
                <Globe2 />
                <span>{c.ui.proof}</span>
              </div>
              <small>{c.recruiter.note}</small>
            </div>
            <div className="phone">
              <div className="phone-notch" />
              <div className="phone-header">
                <ShieldCheck size={18} />
                {c.brand}
              </div>
              <p className="demo-notice">{c.fictitious}</p>
              <div className="phone-status">
                <ShieldCheck size={42} />
                <h3>{c.verification.statuses[0]}</h3>
              </div>
              <dl>
                {[doc.holder, doc.type, doc.issuer, doc.date].map((v, i) => (
                  <div key={v}>
                    <dt>{c.verification.labels[i]}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Section>
        <Section
          kicker={c.kickers[6]}
          title={c.security.title}
          intro={c.security.body}
        >
          <div className="security-list">
            {c.security.items.map((item) => (
              <div key={item}>
                <LockKeyhole size={18} />
                {item}
                <Check size={14} />
              </div>
            ))}
          </div>
        </Section>
        <Section
          id="tarifs"
          kicker={c.kickers[7]}
          title={c.pricing.title}
          intro={c.pricing.body}
        >
          <div className="cards three">
            {c.pricing.items.map(([title, body, ...features], i) => (
              <article
                className={"card pricing " + (i === 1 ? "featured" : "")}
                key={title}
              >
                {i === 1 && <span className="plan-badge">{c.ui.popular}</span>}
                <Layers3 />
                <h3>{title}</h3>
                <p>{body}</p>
                <div className="price">{c.pricing.price}</div>
                <ul>
                  {features.map((f) => (
                    <li key={f}>
                      <Check size={16} />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  className={"button " + (i === 1 ? "primary" : "secondary")}
                  href="#contact"
                >
                  {c.pricing.cta}
                  <ArrowUpRight size={17} />
                </a>
              </article>
            ))}
          </div>
        </Section>
        <Section id="faq" kicker={c.kickers[8]} title={c.faq.title}>
          <div className="faq">
            {c.faq.items.map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <ChevronDown size={19} />
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </Section>
        <section id="contact" className="contact section">
          <div className="contact-glow" />
          <p className="eyebrow">{c.kickers[9]}</p>
          <ShieldCheck className="contact-icon" size={42} />
          <h2>{c.contact.title}</h2>
          <p className="intro">{c.contact.body}</p>
          <div className="actions">
            {(["wa", "email"] as const).map((kind) => {
              const href = contactLink(kind);
              const label =
                kind === "wa" ? c.contact.whatsapp : c.contact.email;
              const Icon = kind === "wa" ? MessageCircle : Mail;
              return href ? (
                <a
                  key={kind}
                  className={
                    "button " + (kind === "wa" ? "primary" : "secondary")
                  }
                  href={href}
                >
                  <Icon size={18} />
                  {label}
                </a>
              ) : (
                <button
                  key={kind}
                  className={
                    "button " + (kind === "wa" ? "primary" : "secondary")
                  }
                  disabled
                >
                  <Icon size={18} />
                  <span>
                    {label}
                    <small>{c.contact.configure}</small>
                  </span>
                </button>
              );
            })}
          </div>
          {(!contactLink("wa") || !contactLink("email")) && (
            <p className="fine">{c.contact.unconfigured}</p>
          )}
        </section>
      </main>
      <footer>
        <div className="footer-main">
          <div>
            <Logo />
            <p>{c.contact.footer}</p>
            <span>{c.contact.location}</span>
          </div>
          <nav aria-label={c.ui.footerNavLabel}>
            {c.nav.slice(1).map(([name, id]) => (
              <a href={"#" + id} key={id}>
                {name}
              </a>
            ))}
            <a href="#contact">{c.demoCta}</a>
          </nav>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {c.brand}. {c.ui.copyright}
          </span>
          <div>
            {settings.LEGAL_URL ? (
              <a href={settings.LEGAL_URL}>{c.contact.legal}</a>
            ) : (
              <span>{c.contact.legal}</span>
            )}
            {settings.PRIVACY_URL ? (
              <a href={settings.PRIVACY_URL}>{c.contact.privacy}</a>
            ) : (
              <span>{c.contact.privacy}</span>
            )}
          </div>
        </div>
      </footer>
    </MotionConfig>
  );
}
export default App;
