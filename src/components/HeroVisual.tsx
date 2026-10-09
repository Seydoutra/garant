import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { ShieldCheck } from "lucide-react";
import { Document } from "./Document";
import { content as c } from "../content";
const Scene = lazy(() => import("./Scene"));
class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <Document /> : this.props.children;
  }
}
export function HeroVisual() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    let timer: number | undefined;
    const media = matchMedia(
      "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
    );
    const update = () => {
      setEnabled(false);
      if (media.matches) {
        try {
          const canvas = document.createElement("canvas");
          if (canvas.getContext("webgl2") || canvas.getContext("webgl"))
            timer = window.setTimeout(() => setEnabled(true), 1100);
        } catch {
          /* static fallback */
        }
      }
    };
    update();
    media.addEventListener("change", update);
    return () => {
      clearTimeout(timer);
      media.removeEventListener("change", update);
    };
  }, []);
  return (
    <div className="hero-visual">
      <div className="orbital o1" />
      <div className="orbital o2" />
      <div
        className="scene-wrap"
        aria-label={c.ui.documentTitle + " — " + c.fictitious}
      >
        {enabled ? (
          <Boundary>
            <Suspense fallback={<Document />}>
              <Scene />
            </Suspense>
          </Boundary>
        ) : (
          <Document />
        )}
      </div>
      <div className="valid-badge">
        <ShieldCheck size={20} />
        <div>
          {c.ui.badge}
          <small>{c.fictitious}</small>
        </div>
      </div>
      <div className="hash mono">
        <span className="dot" />
        {c.ui.fingerprint}
      </div>
    </div>
  );
}
