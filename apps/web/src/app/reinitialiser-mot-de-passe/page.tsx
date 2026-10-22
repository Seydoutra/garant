import { AuthForm } from "@/components/auth/auth-form";
export const dynamic = "force-dynamic";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string; message?: string }>;
}) {
  const params = await searchParams;
  return (
    <AuthForm
      mode="update-password"
      error={params.erreur}
      message={params.message}
    />
  );
}
