import { createClient } from "@/lib/supabase/server";
import { RoleSelect } from "./RoleSelect";

export default async function UsuariosPage() {
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .order("created_at", { ascending: false });

  const pending = (profiles ?? []).filter((p) => p.role === "pending");
  const approved = (profiles ?? []).filter((p) => p.role !== "pending");

  return (
    <div className="max-w-3xl space-y-10">
      <section>
        <h2 className="mb-1 text-lg font-medium">
          Solicitudes pendientes ({pending.length})
        </h2>
        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
          Asigna &ldquo;ATC (buscador)&rdquo; para acceso solo al buscador, o &ldquo;Admin /
          sub admin&rdquo; para acceso completo (buscador, dashboard, consultas).
        </p>
        {pending.length === 0 ? (
          <p className="text-sm text-zinc-500">No hay solicitudes pendientes.</p>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {pending.map((p) => (
                <tr key={p.id} className="border-b border-zinc-100 dark:border-zinc-900">
                  <td className="py-2 pr-4">{p.full_name ?? "—"}</td>
                  <td className="py-2 pr-4 text-zinc-500">{p.email}</td>
                  <td className="py-2">
                    <RoleSelect userId={p.id} currentRole={p.role} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-medium">Usuarios activos ({approved.length})</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-zinc-500">
              <th className="pb-2 font-normal">Nombre</th>
              <th className="pb-2 font-normal">Correo</th>
              <th className="pb-2 font-normal">Rol</th>
            </tr>
          </thead>
          <tbody>
            {approved.map((p) => (
              <tr key={p.id} className="border-b border-zinc-100 dark:border-zinc-900">
                <td className="py-2 pr-4">{p.full_name ?? "—"}</td>
                <td className="py-2 pr-4 text-zinc-500">{p.email}</td>
                <td className="py-2">
                  <RoleSelect userId={p.id} currentRole={p.role} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
