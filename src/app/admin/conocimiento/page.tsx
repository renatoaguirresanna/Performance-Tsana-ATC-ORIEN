import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteArticle } from "./actions";

export default async function ConocimientoPage() {
  const supabase = await createClient();
  const { data: articles } = await supabase
    .from("kb_articles")
    .select("id, question, empresa, status, updated_at")
    .order("updated_at", { ascending: false });

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-medium">
          Base de conocimiento ({articles?.length ?? 0})
        </h2>
        <Link
          href="/admin/conocimiento/nuevo"
          className="rounded-md bg-[#4285F4] px-4 py-2 text-sm font-medium text-white hover:bg-[#3367d6]"
        >
          + Nuevo artículo
        </Link>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-zinc-500">
            <th className="pb-2 font-normal">Pregunta</th>
            <th className="pb-2 font-normal">Empresa</th>
            <th className="pb-2 font-normal">Estado</th>
            <th className="pb-2 font-normal" />
          </tr>
        </thead>
        <tbody>
          {(articles ?? []).map((a) => (
            <tr key={a.id} className="border-b border-zinc-100 dark:border-zinc-900">
              <td className="py-2 pr-4">
                <Link href={`/admin/conocimiento/${a.id}`} className="hover:underline">
                  {a.question}
                </Link>
              </td>
              <td className="py-2 pr-4 text-zinc-500">{a.empresa ?? "—"}</td>
              <td className="py-2 pr-4">
                <StatusBadge status={a.status} />
              </td>
              <td className="py-2 text-right">
                <form action={deleteArticle}>
                  <input type="hidden" name="id" value={a.id} />
                  <button
                    type="submit"
                    className="text-xs text-zinc-500 hover:text-[#EA4335]"
                  >
                    Eliminar
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {(articles ?? []).length === 0 && (
        <p className="mt-4 text-sm text-zinc-500">
          Todavía no hay artículos. Crea el primero o impórtalos desde Drive.
        </p>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    published: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
    draft: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    archived: "bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600",
  };
  const label: Record<string, string> = {
    published: "Publicado",
    draft: "Borrador",
    archived: "Archivado",
  };
  return (
    <span className={`rounded px-2 py-0.5 text-xs font-medium ${map[status]}`}>
      {label[status] ?? status}
    </span>
  );
}
