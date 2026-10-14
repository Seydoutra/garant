import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "GARANT — Espace établissements",
  description: "Socle local de l’espace établissements GARANT, non connecté.",
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
