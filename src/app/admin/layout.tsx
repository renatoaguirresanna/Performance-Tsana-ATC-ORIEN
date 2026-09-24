import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logout } from "@/app/(auth)/actions";

// Auth-gated, per-user data — never let this subtree (or its Server Actions)
// be served from Next's route cache.
export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/usuarios", label: "Usuarios" },
  { href: "/admin/consultas", label: "Consultas" },
  { href: "/admin/conocimiento", label: "Base de conocimiento" },
  { href: "/admin/reportes", label: "Reportes" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireAdmin();

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-medium">
            Buscador de Tsana
          </Link>
          <nav className="flex gap-4 text-sm">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
          <span>{profile.full_name ?? profile.email}</span>
          <form action={logout}>
            <button type="submit" className="hover:underline">
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
