import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { logout } from "@/app/(auth)/actions";
import { Buscador } from "@/components/Buscador";

export const dynamic = "force-dynamic";

export default async function Home() {
  const profile = await requireProfile();

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-end gap-4 px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
        {profile.role === "admin" && (
          <Link href="/admin" className="hover:underline">
            Panel admin
          </Link>
        )}
        <span>{profile.full_name ?? profile.email}</span>
        <form action={logout}>
          <button type="submit" className="hover:underline">
            Cerrar sesión
          </button>
        </form>
      </header>
      <Buscador />
    </div>
  );
}
