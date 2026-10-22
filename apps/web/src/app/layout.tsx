import type { Metadata } from "next";
import "./globals.css";
import { EmailLinkSession } from "@/components/auth/email-link-session";
export const metadata: Metadata = {
  title: "GARANT — Espace organisations",
  description: "Application GARANT de préparation et suivi documentaire.",
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <EmailLinkSession />
        {children}
      </body>
    </html>
  );
}
