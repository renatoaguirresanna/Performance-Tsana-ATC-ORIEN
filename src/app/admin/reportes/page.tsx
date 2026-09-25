import { createClient } from "@/lib/supabase/server";
import { UploadForm } from "./UploadForm";
import { BarList } from "@/components/BarList";
import { TimeSeries } from "@/components/TimeSeries";
import { sentimentColor } from "@/lib/chart-colors";

type KV = { key: string; value: number };
type AtencionesStats = {
  total: number;
  atendidas: number;
  canceladas: number;
  tiempo_espera_mediana_s: number | null;
  duracion_mediana_s: number | null;
  por_estado: KV[];
  por_canal: KV[];
  por_especialidad: KV[];
  por_dia: KV[];
  fecha_min: string | null;
  fecha_max: string | null;
};
type OrientacionesStats = {
  total: number;
  duracion_mediana_min: number | null;
  tiempo_muerto_mediana_min: number | null;
  por_resultado: KV[];
  por_sentimiento: KV[];
  por_dia: KV[];
  fecha_min: string | null;
  fecha_max: string | null;
};
type OrientacionesFunnel = {
  total_ingresos: number | null;
  tiempo_mediana_traspaso_atc_medico_min: number | null;
  cantidad_ingresos_om: number | null;
  tiempo_mediana_interaccion_e2e_min: number | null;
  tiempo_mediana_orientacion_min: number | null;
  cantidad_no_ingresan_teleconsulta: number | null;
  cantidad_cierre: number | null;
  cantidad_abandono: number | null;
  primer_contacto: {
    p33_min: number | null;
    p66_min: number | null;
    rapida: number;
    media: number;
    larga: number;
    sin_contacto: number;
  } | null;
};

function fmtMinSec(seconds: number | null): string {
  if (seconds == null) return "Sin datos";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function fmtMin(min: number | null): string {
  return min == null ? "Sin datos" : `${min} min`;
}

function fmtNum(n: number | null): string {
  return n == null ? "Sin datos" : n.toLocaleString("es-PE");
}

function fmtPct(n: number | null, total: number | null): string {
  if (n == null || total == null || total === 0) return "Sin datos";
  return `${((n / total) * 100).toFixed(1)}%`;
}

export default async function ReportesPage() {
  const supabase = await createClient();

  const [{ data: aData }, { data: oData }, { data: fData }, { data: uploads }] =
    await Promise.all([
      supabase.rpc("atenciones_dashboard"),
      supabase.rpc("orientaciones_dashboard"),
      supabase.rpc("orientaciones_funnel"),
      supabase
        .from("report_uploads")
        .select(
          "id, source_type, filename, date_from, date_to, row_count, inserted_count, updated_count, created_at",
        )
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

  const a = aData as AtencionesStats;
  const o = oData as OrientacionesStats;
  const f = fData as OrientacionesFunnel;

  return (
    <div className="max-w-5xl space-y-12">
      <section>
        <h2 className="mb-1 text-lg font-medium">Cargar reporte de atenciones</h2>
        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
          El JSON de conversaciones (Heynow scraping) se ingiere aparte por ser
          muy pesado — ver instrucciones en <code>scripts/README.md</code>.
        </p>
        <UploadForm />

        {uploads && uploads.length > 0 && (
          <table className="mt-6 w-full text-sm">
            <thead>
              <tr className="text-left text-zinc-500">
                <th className="pb-2 font-normal">Archivo</th>
                <th className="pb-2 font-normal">Cobertura</th>
                <th className="pb-2 font-normal text-right">Filas</th>
                <th className="pb-2 font-normal text-right">Nuevas</th>
                <th className="pb-2 font-normal text-right">Actualizadas</th>
              </tr>
            </thead>
            <tbody>
              {uploads.map((u) => (
                <tr key={u.id} className="border-b border-zinc-100 dark:border-zinc-900">
                  <td className="py-2 pr-4">{u.filename}</td>
                  <td className="py-2 pr-4 text-zinc-500">
                    {u.date_from} → {u.date_to}
                  </td>
                  <td className="py-2 text-right">{u.row_count}</td>
                  <td className="py-2 text-right text-[#0ca30c]">{u.inserted_count}</td>
                  <td className="py-2 text-right text-zinc-500">{u.updated_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {f && f.total_ingresos != null && f.total_ingresos > 0 && (
        <section>
          <h2 className="mb-1 text-lg font-medium">
            Resumen ejecutivo — Funnel de Orientaciones
          </h2>
          <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
            Todos los tiempos son <b>medianas</b> (no promedios): una sola
            conversación de 24h puede desplazar un promedio y dejar de
            representar al caso típico.
          </p>

          <ol className="space-y-4">
            <FunnelStep
              n={1}
              title="Primera respuesta"
              metric={`${fmtNum(f.total_ingresos)} ingresos totales`}
              detail="Conversaciones que escribieron al bot (base de todo el funnel)."
            />
            <FunnelStep
              n={2}
              title="Traspaso ATC → Médico"
              metric={`Mediana ${fmtMin(f.tiempo_mediana_traspaso_atc_medico_min)} · ${fmtNum(f.cantidad_ingresos_om)} orientaciones tomadas (${fmtPct(f.cantidad_ingresos_om, f.total_ingresos)})`}
              detail="Tiempo desde que escribe el paciente hasta que el médico responde (campo E6_ingreso_om = entró a Orientaciones Médicas)."
            />
            <FunnelStep
              n={3}
              title="Interacción del paciente end-to-end"
              metric={`Mediana ${fmtMin(f.tiempo_mediana_interaccion_e2e_min)}`}
              detail="Duración total de la conversación, de punta a punta, para todos los ingresos."
            />
            <FunnelStep
              n={4}
              title="Orientación médica"
              metric={`Mediana ${fmtMin(f.tiempo_mediana_orientacion_min)} de consulta`}
              detail={
                <>
                  <span className="block">
                    Ingresos a orientación: {fmtNum(f.cantidad_ingresos_om)} (
                    {fmtPct(f.cantidad_ingresos_om, f.total_ingresos)} del total)
                  </span>
                  <span className="block">
                    No ingresan a la teleconsulta: {fmtNum(f.cantidad_no_ingresan_teleconsulta)} (
                    {fmtPct(f.cantidad_no_ingresan_teleconsulta, f.total_ingresos)} del total) —
                    clasificadas como &ldquo;abandono en cola médica&rdquo;
                  </span>
                </>
              }
            />
          </ol>

          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <div>
              <p className="mb-1 text-sm font-medium">
                Tiempo de primer contacto (ATC)
              </p>
              <p className="mb-3 text-xs text-zinc-500">
                {f.primer_contacto
                  ? `Rápida ≤ ${f.primer_contacto.p33_min} min · Media hasta ${f.primer_contacto.p66_min} min · Larga por encima`
                  : "Sin datos"}
              </p>
              {f.primer_contacto ? (
                <BarList
                  data={[
                    { key: "Rápida", value: f.primer_contacto.rapida },
                    { key: "Media", value: f.primer_contacto.media },
                    { key: "Larga", value: f.primer_contacto.larga },
                    { key: "Sin contacto de ATC", value: f.primer_contacto.sin_contacto },
                  ]}
                  colorAt={(i) => ["#0ca30c", "#eda100", "#d03b3b", "#898781"][i]}
                />
              ) : (
                <p className="text-sm text-zinc-500">Sin datos</p>
              )}
            </div>
            <div>
              <p className="mb-1 text-sm font-medium">Cierre vs. abandono</p>
              <p className="mb-3 text-xs text-zinc-500">
                Abandono = resultado clasificado como &ldquo;abandono en
                cola&rdquo; o &ldquo;cliente no continúa tras saludo&rdquo;.
              </p>
              <BarList
                data={[
                  {
                    key: `Cierre (${fmtPct(f.cantidad_cierre, f.total_ingresos)})`,
                    value: f.cantidad_cierre ?? 0,
                  },
                  {
                    key: `Abandono (${fmtPct(f.cantidad_abandono, f.total_ingresos)})`,
                    value: f.cantidad_abandono ?? 0,
                  },
                ]}
                colorAt={(i) => ["#0ca30c", "#d03b3b"][i]}
              />
            </div>
          </div>
        </section>
      )}

      {a && a.total > 0 && (
        <section>
          <h2 className="mb-1 text-lg font-medium">Atenciones</h2>
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
            Cobertura: {a.fecha_min} → {a.fecha_max} · {a.total.toLocaleString("es-PE")} atenciones
          </p>
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <Kpi label="Atendidas" value={a.atendidas} />
            <Kpi label="Canceladas" value={a.canceladas} />
            <Kpi label="Espera (mediana)" value={fmtMinSec(a.tiempo_espera_mediana_s)} />
            <Kpi label="Duración registrada (mediana)" value={fmtMinSec(a.duracion_mediana_s)} />
          </div>
          <p className="-mt-4 mb-6 text-xs text-zinc-500">
            &ldquo;Duración registrada&rdquo; mide desde la creación del
            registro hasta su cierre, no necesariamente el tiempo real de
            interacción con el paciente — para ese dato usa la mediana de
            interacción end-to-end en el funnel de Orientaciones arriba.
          </p>
          <div className="mb-6 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
            <p className="mb-2 text-sm font-medium">Atenciones por día</p>
            <TimeSeries data={a.por_dia} />
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <p className="mb-3 text-sm font-medium">Por estado</p>
              <BarList data={a.por_estado} />
            </div>
            <div>
              <p className="mb-3 text-sm font-medium">Por canal</p>
              <BarList data={a.por_canal} />
            </div>
            <div>
              <p className="mb-3 text-sm font-medium">Por especialidad</p>
              <BarList data={a.por_especialidad} />
            </div>
          </div>
        </section>
      )}

      {o && o.total > 0 && (
        <section>
          <h2 className="mb-1 text-lg font-medium">Conversaciones — Orientaciones</h2>
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
            Cobertura: {o.fecha_min} → {o.fecha_max} · {o.total.toLocaleString("es-PE")} conversaciones
          </p>
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <Kpi label="Duración (mediana)" value={fmtMin(o.duracion_mediana_min)} />
            <Kpi label="Tiempo muerto (mediana)" value={fmtMin(o.tiempo_muerto_mediana_min)} />
          </div>
          <div className="mb-6 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
            <p className="mb-2 text-sm font-medium">Conversaciones por día</p>
            <TimeSeries data={o.por_dia} />
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-medium">Por resultado (funnel)</p>
              <BarList data={o.por_resultado} limit={16} />
            </div>
            <div>
              <p className="mb-3 text-sm font-medium">Por sentimiento</p>
              <BarList
                data={o.por_sentimiento}
                colorAt={(i) => sentimentColor(o.por_sentimiento[i]?.key ?? "")}
              />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function FunnelStep({
  n,
  title,
  metric,
  detail,
}: {
  n: number;
  title: string;
  metric: string;
  detail: React.ReactNode;
}) {
  return (
    <li className="flex gap-4 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#4285F4]/10 text-sm font-semibold text-[#4285F4]">
        {n}
      </span>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-lg">{metric}</p>
        <p className="mt-1 text-sm text-zinc-500">{detail}</p>
      </div>
    </li>
  );
}

function Kpi({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="text-2xl font-semibold">
        {typeof value === "number" ? value.toLocaleString("es-PE") : value}
      </p>
    </div>
  );
}
