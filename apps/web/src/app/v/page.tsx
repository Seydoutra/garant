import Link from "next/link";
export const runtime = "nodejs";
export default function VerifierLink() {
  return (
    <main className="routing-page">
      <Link href="/">GARANT</Link>
      <h1>Vérification publique</h1>
      <p>
        Le shell public autonome s’exécute sur le port 3001, à l’adresse{" "}
        <code>http://127.0.0.1:3001/v</code>.
      </p>
      <p>
        Aucun document n’est vérifié depuis cet écran. L’application PWA et son
        cache hors ligne seront implémentés dans leurs tâches dédiées.
      </p>
      <a href="http://127.0.0.1:3001/v">
        Ouvrir le shell local de vérification →
      </a>
    </main>
  );
}
