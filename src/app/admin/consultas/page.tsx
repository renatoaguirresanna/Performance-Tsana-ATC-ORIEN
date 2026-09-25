import { createClient } from "@/lib/supabase/server";

type Stat = {
  normalized_query: string;
  sample_query: string;
  total_count: number;
  zero_result_count: number;
  last_asked_at: string;
};

export default async function ConsultasPage() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("admin_search_query_stats");
  const stats = (data ?? []) as Stat[];

  const totalPreguntas = stats.reduce((sum, s) => sum + Number(s.total_count), 0);
  const preguntasUnicas = stats.length;
  const sinResultados = stats.filter((s) => s.zero_result_count > 0);

  const masConsultadas = [...stats].sort((a, b) => b.total_count - a.total_count).slice(0, 20);
  const menosConsultadas = [...stats]
    .filter((s) => s.total_count > 0)
    .sort((a, b) => a.total_count - b.total_count)
    .slice(0, 20);

  return (
    <div className="max-w-4xl space-y-10">
      <section className="grid grid-cols-3 gap-4">
        <Kpi label="Preguntas registradas" value={totalPreguntas} />
        <Kpi label="Preguntas únicas" value={preguntasUnicas} />
        <Kpi label="Sin resultado (gaps)" value={sinResultados.length} highlight />
      </section>

      <section>
        <h2 className="mb-1 text-lg font-medium">Sin resultados — priorizar para el KB</h2>
        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
          Estas consultas no encontraron nada en la base de conocimiento. Son las
          primeras candidatas para nuevos artículos o keywords.
        </p>
        <RankingTable
          rows={sinResultados.sort((a, b) => b.total_count - a.total_count)}
        />
      </section>

      <section className="grid gap-10 md:grid-cols-2">
        <div>
          <h2 className="mb-4 text-lg font-medium">Más consultadas</h2>
          <RankingTable rows={masConsultadas} />
        </div>
        <div>
          <h2 className="mb-4 text-lg font-medium">Menos consultadas</h2>
          <RankingTable rows={menosConsultadas} />
        </div>
      </section>
    </div>
  );
}

function Kpi({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className={`text-2xl font-semibold ${highlight ? "text-[#EA4335]" : ""}`}>
        {value.toLocaleString("es-PE")}
      </p>
    </div>
  );
}

function RankingTable({ rows }: { rows: Stat[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-zinc-500">Sin datos todavía.</p>;
  }
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-zinc-500">
          <th className="pb-2 font-normal">Consulta</th>
          <th className="pb-2 font-normal text-right">Veces</th>
          <th className="pb-2 font-normal text-right">Sin resultado</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.normalized_query} className="border-b border-zinc-100 dark:border-zinc-900">
            <td className="py-2 pr-4">{r.sample_query}</td>
            <td className="py-2 text-right">{r.total_count}</td>
            <td className="py-2 text-right">
              {r.zero_result_count > 0 ? (
                <span className="text-[#EA4335]">{r.zero_result_count}</span>
              ) : (
                0
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
