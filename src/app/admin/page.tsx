import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminHomePage() {
  const supabase = await createClient();

  const [{ count: articulos }, { count: publicados }, { count: consultas }, { count: pendientes }, { count: atenciones }, { count: conversaciones }] =
    await Promise.all([
      supabase.from("kb_articles").select("*", { count: "exact", head: true }),
      supabase.from("kb_articles").select("*", { count: "exact", head: true }).eq("status", "published"),
      supabase.from("search_queries").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "pending"),
      supabase.from("atenciones").select("*", { count: "exact", head: true }),
      supabase.from("conversaciones_orientaciones").select("*", { count: "exact", head: true }),
    ]);

  return (
    <div className="max-w-4xl">
      <h2 className="mb-6 text-lg font-medium">Resumen</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <Kpi label="Artículos publicados" value={publicados} of={articulos} />
        <Kpi label="Consultas registradas" value={consultas} />
        <Kpi
          label="Usuarios pendientes"
          value={pendientes}
          alert={!!pendientes}
          href="/admin/usuarios"
        />
        <Kpi label="Atenciones (CSV)" value={atenciones} href="/admin/reportes" />
        <Kpi
          label="Conversaciones (orientaciones)"
          value={conversaciones}
          href="/admin/reportes"
        />
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  of,
  alert,
  href,
}: {
  label: string;
  value: number | null;
  of?: number | null;
  alert?: boolean;
  href?: string;
}) {
  const content = (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 h-full">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className={`text-2xl font-semibold ${alert ? "text-[#EA4335]" : ""}`}>
        {(value ?? 0).toLocaleString("es-PE")}
        {of != null && (
          <span className="text-sm font-normal text-zinc-400"> / {of}</span>
        )}
      </p>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}
