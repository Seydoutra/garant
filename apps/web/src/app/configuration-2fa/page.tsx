import Link from "next/link";
import { pageSession } from "@/lib/auth";
import { MfaForm } from "@/components/auth/mfa-form";
export const dynamic = "force-dynamic";
export default async function Page() {
  await pageSession();
  return (
    <main className="routing-page">
      <Link className="wordmark" href="/dashboard">
        GARANT
      </Link>
      <h1>Double authentification</h1>
      <MfaForm />
      <form action="/auth/operation" method="post">
        <input type="hidden" name="operation" value="logout" />
        <button>Se déconnecter</button>
      </form>
    </main>
  );
}
