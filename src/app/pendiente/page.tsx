import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { logout } from "@/app/(auth)/actions";
import { Logo } from "@/components/Logo";

export const dynamic = "force-dynamic";

export default async function PendientePage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "pending") redirect("/");

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
      <div className="mb-8">
        <Logo size="sm" />
      </div>
      <div className="max-w-md rounded-xl border border-zinc-200 dark:border-zinc-800 p-8">
        <h2 className="mb-2 text-xl font-medium">Cuenta pendiente de aprobación</h2>
        <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
          Hola {profile.full_name ?? profile.email}. Tu cuenta ({profile.email}) fue
          creada correctamente, pero necesita que un administrador te asigne un rol
          (ATC o sub admin) antes de que puedas usar el buscador.
        </p>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-md border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  );
}
