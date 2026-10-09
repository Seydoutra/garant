import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { ShieldCheck } from "lucide-react";
import { content as c } from "../content";
export function Document() {
  const [qr, setQr] = useState("");
  useEffect(() => {
    const url = new URL(window.location.href);
    url.hash = "demonstration";
    url.searchParams.set("demo", c.ui.documentId);
    QRCode.toDataURL(url.href, {
      margin: 1,
      width: 96,
      color: { dark: "#0B1220", light: "#F7FAFC" },
    })
      .then(setQr)
      .catch(() => {});
  }, []);
  return (
    <div className="certificate">
      <div className="cert-top">
        <span className="cert-brand">
          <ShieldCheck size={18} /> {c.brand}
        </span>
        <span className="mono">{c.ui.documentId}</span>
      </div>
      <div className="cert-rule" />
      <p className="cert-org">{c.ui.documentOrg}</p>
      <h3>{c.ui.documentTitle}</h3>
      <div className="cert-lines">
        <i />
        <i />
        <i />
      </div>
      <p className="cert-name">{c.ui.documentName}</p>
      <p className="cert-copy">{c.ui.documentBody}</p>
      <div className="cert-bottom">
        <div>
          <span className="seal">
            <ShieldCheck size={28} />
          </span>
          <small>
            {c.ui.date}
            <br />
            {c.fictitious}
          </small>
        </div>
        {qr && (
          <a href="#demonstration" aria-label={c.ui.qr}>
            <img src={qr} alt={c.ui.qr} width="76" height="76" />
          </a>
        )}
      </div>
      <div className="scanline" />
    </div>
  );
}
