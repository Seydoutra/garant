import { useRef, useState } from "react";
import {
  ShieldCheck,
  FileCheck2,
  UserRound,
  MessageSquare,
  ScanLine,
  ShieldX,
  LockKeyhole,
} from "lucide-react";
import { content as c } from "../content";
const icons = [
  ShieldCheck,
  FileCheck2,
  UserRound,
  MessageSquare,
  ScanLine,
  ShieldX,
];
export function SecurityShowcase({initialIndex=0}:{initialIndex?:number}) {
  const [active, setActive] = useState(initialIndex);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const data = c.securityScreens;
  const item = data.panels[active]!;
  const Icon = icons[active]!;
  return (
    <section className="section security-showcase" id="dispositifs">
      <p className="eyebrow">{data.kicker}</p>
      <h2>{data.title}</h2>
      <p className="intro">{data.intro}</p>
      <div className="security-tabs" role="tablist" aria-label={data.title}>
        {data.panels.map((panel, index) => (
          <button
            key={panel.code}
            ref={(el) => {
              tabs.current[index] = el;
            }}
            id={`security-tab-${index}`}
            role="tab"
            aria-selected={active === index}
            aria-controls={`security-panel-${index}`}
            tabIndex={active === index ? 0 : -1}
            onClick={() => setActive(index)}
            onKeyDown={(event) => {
              const target =
                event.key === "ArrowRight"
                  ? (index + 1) % data.panels.length
                  : event.key === "ArrowLeft"
                    ? (index - 1 + data.panels.length) % data.panels.length
                    : event.key === "Home"
                      ? 0
                      : event.key === "End"
                        ? data.panels.length - 1
                        : null;
              if (target !== null) {
                event.preventDefault();
                setActive(target);
                tabs.current[target]?.focus();
              }
            }}
          >
            <span>{panel.code}</span>
            {panel.tab}
          </button>
        ))}
      </div>
      <div
        className="security-detail"
        role="tabpanel"
        id={`security-panel-${active}`}
        aria-labelledby={`security-tab-${active}`}
        tabIndex={0}
      >
        <div className="security-editorial">
          <Icon size={34} />
          <h3>{item.title}</h3>
          <p>{item.description}</p>
          <div className="security-limit">
            <LockKeyhole size={17} />
            <p>{item.foot}</p>
          </div>
        </div>
        <div
          className={`security-screen security-screen-${item.code}`}
          data-screenshot={item.code}
        >
          <div className="screen-chrome">
            <div>
              <i />
              <i />
              <i />
            </div>
            <span>{data.window}</span>
            <span className="screen-code">{item.code}</span>
          </div>
          <div className="screen-body">
            <div className="screen-identity">
              <ShieldCheck size={25} />
              <strong>{c.brand}</strong>
              <span>{data.record}</span>
            </div>
            <p className="screen-warning">{data.notice}</p>
            <h4>
              <Icon size={20} />
              {item.screenTitle}
            </h4>
            {active === 2 && (
              <div className="portrait-placeholder">
                <UserRound size={45} />
                <span>{data.holder}</span>
              </div>
            )}
            {active === 4 && (
              <div className="guilloche-preview" aria-hidden="true">
                <span>
                  {data.holder} · {data.reference} · {data.holder}
                </span>
              </div>
            )}
            <dl>
              {item.lines.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <p className="screen-footer">{c.fictitious}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
