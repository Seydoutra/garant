import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ShieldCheck,
  ShieldX,
  Search,
  ArrowRight,
  LoaderCircle,
} from "lucide-react";
import { content as c, type DemoDocument } from "../content";
import { verifyDemo } from "../lib/verification";
export function Verification() {
  const [id, setId] = useState(
    new URLSearchParams(location.search).get("demo") || "",
  );
  const [phase, setPhase] = useState<"idle" | "loading" | "done">("idle");
  const [result, setResult] = useState<DemoDocument | null>(null);
  const timer = useRef<number>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  function run(value: string) {
    clearTimeout(timer.current);
    setId(value);
    setResult(null);
    setPhase("loading");
    timer.current = window.setTimeout(() => {
      setResult(verifyDemo(value));
      setPhase("done");
    }, 1500);
  }
  function submit(e: FormEvent) {
    e.preventDefault();
    if (id.trim()) run(id);
  }
  const v = c.verification;
  return (
    <div className="verification-grid">
      <div className="verify-control">
        <p className="demo-notice">{c.demoNotice}</p>
        <form onSubmit={submit}>
          <label htmlFor="document-id">{v.label}</label>
          <div className="input-row">
            <input
              id="document-id"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder={v.examples[0]}
              required
              maxLength={80}
              autoComplete="off"
              spellCheck={false}
            />
            <button className="button primary" disabled={phase === "loading"}>
              {phase === "loading" ? (
                <LoaderCircle className="spin" size={18} />
              ) : (
                <Search size={18} />
              )}{" "}
              {v.button}
            </button>
          </div>
        </form>
        <div className="examples">
          {v.examples.map((example, i) => (
            <button
              key={example}
              disabled={phase === "loading"}
              onClick={() => run(example)}
            >
              <span className="mono">{example}</span>
              <small>
                {v.statuses[i]} <ArrowRight size={12} />
              </small>
            </button>
          ))}
        </div>
        <p className="fine">{c.fictitious}</p>
      </div>
      <div
        className={"verify-result " + (phase === "loading" ? "scanning" : "")}
        aria-live="polite"
        aria-atomic="true"
        aria-busy={phase === "loading"}
      >
        {phase === "idle" ? (
          <div className="result-empty">
            <Search size={40} />
            <p>{v.empty}</p>
          </div>
        ) : phase === "loading" ? (
          <div className="result-empty">
            <LoaderCircle className="spin" size={36} />
            <p role="status">{v.loading}</p>
          </div>
        ) : !result ? (
          <div className="result-empty">
            <Search size={36} />
            <h3>{v.missing}</h3>
            <p>{v.missingBody}</p>
          </div>
        ) : (
          <>
            <div className={"status " + result.status}>
              {result.status === "valid" ? <ShieldCheck /> : <ShieldX />}
              <span>
                {result.status === "valid" ? v.statuses[0] : v.statuses[1]}
              </span>
              <small>{c.fictitious}</small>
            </div>
            <dl>
              {[
                result.holder,
                result.type,
                result.issuer,
                result.date,
                result.revokedAt,
                result.fingerprint,
              ].map(
                (value, i) =>
                  value && (
                    <div key={v.labels[i]}>
                      <dt>{v.labels[i]}</dt>
                      <dd className={i === 5 ? "mono" : ""}>{value}</dd>
                    </div>
                  ),
              )}
            </dl>
          </>
        )}
      </div>
    </div>
  );
}
