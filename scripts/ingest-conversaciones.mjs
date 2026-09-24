#!/usr/bin/env node
/**
 * Ingests a Heynow "conversaciones" scrape JSON (TSANA OFICIAL / Orientaciones)
 * into the conversaciones_orientaciones table.
 *
 * Each session is upserted by its natural key (session.id -> session_key), so
 * re-running this with a newer scrape that overlaps a previous one is safe:
 * overlapping sessions get overwritten with the newer copy, and sessions from
 * days the previous scrape didn't cover are simply added. No manual date-range
 * bookkeeping needed - the primary key does the merging.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_ANON_KEY=... \
 *   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=... \
 *   node scripts/ingest-conversaciones.mjs path/to/tsana_conversaciones.json
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const [, , filePath] = process.argv;
if (!filePath) {
  console.error("Uso: node scripts/ingest-conversaciones.mjs <archivo.json>");
  process.exit(1);
}

const { SUPABASE_URL, SUPABASE_ANON_KEY, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error(
    "Faltan variables de entorno: SUPABASE_URL, SUPABASE_ANON_KEY, ADMIN_EMAIL, ADMIN_PASSWORD",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const { error: signInError } = await supabase.auth.signInWithPassword({
  email: ADMIN_EMAIL,
  password: ADMIN_PASSWORD,
});
if (signInError) {
  console.error("No se pudo iniciar sesión:", signInError.message);
  process.exit(1);
}

console.log("Leyendo", filePath, "…");
const raw = JSON.parse(readFileSync(filePath, "utf-8"));
const sessions = raw.sessions ?? [];
console.log(
  `Universo: ${raw.universo ?? "?"} | Rango declarado: ${raw.rango?.desde ?? "?"} a ${raw.rango?.hasta ?? "?"} | Sesiones: ${sessions.length}`,
);

function mapSession(s) {
  const c = s.clasificacion ?? {};
  const m = s.metricas ?? {};
  return {
    session_key: s.id,
    session: s.session ?? null,
    telefono: s.telefono ?? null,
    contacto: s.contacto ?? null,
    inicio: s.inicio ?? null,
    fin: s.fin ?? null,
    habilidades: s.habilidades ?? [],
    gestores_atc: s.gestores_atc ?? [],
    medicos_om: s.medicos_om ?? [],
    resultado: c.resultado ?? null,
    etapa_max: c.etapa_max ?? null,
    etapas: c.etapas ?? null,
    sentimiento: c.sentimiento ?? null,
    score_sentimiento: c.score_sentimiento ?? null,
    senales: c.senales ?? null,
    duracion_min: m.duracion_min ?? null,
    tiempo_muerto_min: m.tiempo_muerto_min ?? null,
    pct_tiempo_muerto: m.pct_tiempo_muerto ?? null,
    primera_respuesta_atc_min: m.primera_respuesta_atc_min ?? null,
    primera_respuesta_medico_min: m.primera_respuesta_medico_min ?? null,
    espera_max_min: m.espera_max_min ?? null,
    n_mensajes: m.n_mensajes ?? null,
    n_cliente: m.n_cliente ?? null,
    n_salida: m.n_salida ?? null,
    n_respuestas_humanas: m.n_respuestas_humanas ?? null,
    frases_de_espera: m.frases_de_espera ?? null,
    cerrada_por_bot: m.cerrada_por_bot ?? null,
    mensajes: s.mensajes ?? null,
  };
}

const dedupedMap = new Map();
for (const s of sessions) dedupedMap.set(s.id, mapSession(s));
const rows = [...dedupedMap.values()];
console.log(`Filas únicas por session_key: ${rows.length}`);

const dateFrom = raw.rango?.desde ?? null;
const dateTo = raw.rango?.hasta ?? null;

const { count: countBefore } = await supabase
  .from("conversaciones_orientaciones")
  .select("*", { count: "exact", head: true });

const { data: upload, error: uploadError } = await supabase
  .from("report_uploads")
  .insert({
    source_type: "conversaciones_json",
    filename: filePath.split("/").pop(),
    date_from: dateFrom,
    date_to: dateTo,
    row_count: rows.length,
  })
  .select("id")
  .single();
if (uploadError || !upload) {
  console.error("No se pudo registrar la carga:", uploadError?.message);
  process.exit(1);
}

const BATCH = 500;
for (let i = 0; i < rows.length; i += BATCH) {
  const batch = rows.slice(i, i + BATCH).map((r) => ({ ...r, source_upload_id: upload.id }));
  const { error } = await supabase
    .from("conversaciones_orientaciones")
    .upsert(batch, { onConflict: "session_key" });
  if (error) {
    console.error(`Error en el batch ${i}:`, error.message);
    process.exit(1);
  }
  process.stdout.write(`\rProcesadas ${Math.min(i + BATCH, rows.length)} / ${rows.length}`);
}
console.log();

const { count: countAfter } = await supabase
  .from("conversaciones_orientaciones")
  .select("*", { count: "exact", head: true });

const insertedCount = (countAfter ?? 0) - (countBefore ?? 0);
const updatedCount = rows.length - insertedCount;

await supabase
  .from("report_uploads")
  .update({ inserted_count: insertedCount, updated_count: updatedCount })
  .eq("id", upload.id);

console.log(
  `Listo: ${rows.length} sesiones (${dateFrom} a ${dateTo}) — ${insertedCount} nuevas, ${updatedCount} actualizadas.`,
);
