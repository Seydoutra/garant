"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
// No heartbeat extends a session. Only real requests/user navigation do so on server.
export function IdleSession() {
  const router = useRouter();
  useEffect(() => {
    let last = Date.now();
    const activity = () => {
      last = Date.now();
    };
    const events = ["pointerdown", "keydown"] as const;
    for (const e of events)
      window.addEventListener(e, activity, { passive: true });
    const timer = window.setInterval(() => {
      if (Date.now() - last >= 30 * 60 * 1000)
        router.replace("/connexion?erreur=SESSION_EXPIRED");
    }, 10000);
    return () => {
      clearInterval(timer);
      for (const e of events) window.removeEventListener(e, activity);
    };
  }, [router]);
  return null;
}
