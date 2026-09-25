"use server";

import Papa from "papaparse";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

// The source export repeats the "pruebas_auxiliares" header for what is
// actually the detail column, so we parse by fixed column position instead
// of by header name (papaparse would otherwise silently drop the first one).
const ATENCIONES_COLUMNS = [
  "attention_id", "user_id", "patient_id", "profile_id", "paciente",
  "tipo_doc_paciente", "documento_paciente", "telefono_paciente", "email",
  "created_at", "fecha_atencion", "periodo_atencion", "diasem_atencion",
  "medico", "cmp", "especialidad", "canal", "inicio_atencion",
  "medico_acepta", "fin_llamada", "tiempo_espera", "duracion_atencion",
  "fecha_nacimiento", "edad", "gender", "empresas_actuales",
  "grupos_actuales", "estado_atencion", "codigo_diagnostico", "diagnostico",
  "motivo_cancelacion", "descanso_medico", "descanso_medico_detalle",
  "pruebas_auxiliares", "pruebas_auxiliares_detalle", "interconsulta",
  "interconsulta_detalle", "tiene_medicamento", "medicamentos",
] as const;

function toSeconds(hms: string | undefined): number | null {
  if (!hms) return null;
  const parts = hms.split(":").map(Number);
  if (parts.some(Number.isNaN)) return null;
  const [h, m, s] = parts;
  return h * 3600 + m * 60 + s;
}

function toBool(v: string | undefined): boolean | null {
  if (v === "0") return false;
  if (v === "1") return true;
  return null;
}

function toNullableText(v: string | undefined): string | null {
  const t = (v ?? "").trim();
  return t === "" ? null : t;
}

export async function uploadAtencionesCsv(formData: FormData) {
  const profile = await requireAdmin();
  const supabase = await createClient();

  const file = formData.get("file") as File | null;
  if (!file) return { error: "Selecciona un archivo CSV." };

  const text = await file.text();
  // Array mode (not header:true) because the source repeats the
  // "pruebas_auxiliares" header for what is actually the detail column;
  // Papa handles quoted newlines/commas correctly, unlike a naive line split.
  const parsed = Papa.parse<string[]>(text, {
    delimiter: ";",
    skipEmptyLines: true,
  });
  if (parsed.errors.some((e) => e.type !== "FieldMismatch")) {
    return { error: "No se pudo leer el CSV: " + parsed.errors[0]?.message };
  }
  const [, ...dataLines] = parsed.data; // drop header row, we use a fixed column order

  const rows = dataLines.map((cells) => {
    const rec: Record<string, string | undefined> = {};
    ATENCIONES_COLUMNS.forEach((col, i) => {
      rec[col] = cells[i];
    });
    return rec;
  });

  const mapped = rows
    .filter((r) => r.attention_id)
    .map((r) => ({
      attention_id: Number(r.attention_id),
      user_id: r.user_id ? Number(r.user_id) : null,
      patient_id: r.patient_id ? Number(r.patient_id) : null,
      profile_id: r.profile_id ? Number(r.profile_id) : null,
      paciente: toNullableText(r.paciente),
      tipo_doc_paciente: toNullableText(r.tipo_doc_paciente),
      documento_paciente: toNullableText(r.documento_paciente),
      telefono_paciente: toNullableText(r.telefono_paciente),
      email: toNullableText(r.email),
      created_at: toNullableText(r.created_at),
      fecha_atencion: toNullableText(r.fecha_atencion),
      periodo_atencion: toNullableText(r.periodo_atencion),
      diasem_atencion: toNullableText(r.diasem_atencion),
      medico: toNullableText(r.medico),
      cmp: toNullableText(r.cmp),
      especialidad: toNullableText(r.especialidad),
      canal: toNullableText(r.canal),
      inicio_atencion: toNullableText(r.inicio_atencion),
      medico_acepta: toNullableText(r.medico_acepta),
      fin_llamada: toNullableText(r.fin_llamada),
      tiempo_espera_s: toSeconds(r.tiempo_espera ?? undefined),
      duracion_atencion_s: toSeconds(r.duracion_atencion ?? undefined),
      fecha_nacimiento: toNullableText(r.fecha_nacimiento),
      edad: r.edad ? Number(r.edad) : null,
      gender: toNullableText(r.gender),
      empresas_actuales: toNullableText(r.empresas_actuales),
      grupos_actuales: toNullableText(r.grupos_actuales),
      estado_atencion: toNullableText(r.estado_atencion),
      codigo_diagnostico: toNullableText(r.codigo_diagnostico),
      diagnostico: toNullableText(r.diagnostico),
      motivo_cancelacion: toNullableText(r.motivo_cancelacion),
      descanso_medico: toBool(r.descanso_medico),
      descanso_medico_detalle: toNullableText(r.descanso_medico_detalle),
      pruebas_auxiliares: toBool(r.pruebas_auxiliares),
      pruebas_auxiliares_detalle: toNullableText(r.pruebas_auxiliares_detalle),
      interconsulta: toBool(r.interconsulta),
      interconsulta_detalle: toNullableText(r.interconsulta_detalle),
      tiene_medicamento: toBool(r.tiene_medicamento),
      medicamentos: toNullableText(r.medicamentos),
    }));

  if (mapped.length === 0) return { error: "El archivo no tiene filas válidas." };

  // The source export can repeat the same attention_id more than once
  // (seen in production exports); Postgres refuses to touch the same
  // conflict-key row twice within one upsert command, so de-dupe first
  // (keep the last occurrence, presumed most complete/recent).
  const dedupedMap = new Map<number, (typeof mapped)[number]>();
  for (const row of mapped) dedupedMap.set(row.attention_id, row);
  const deduped = [...dedupedMap.values()];

  const fechas = deduped.map((m) => m.fecha_atencion).filter(Boolean) as string[];
  const dateFrom = fechas.reduce((a, b) => (a < b ? a : b));
  const dateTo = fechas.reduce((a, b) => (a > b ? a : b));

  const { count: countBefore } = await supabase
    .from("atenciones")
    .select("*", { count: "exact", head: true });

  const { data: upload, error: uploadError } = await supabase
    .from("report_uploads")
    .insert({
      source_type: "atenciones_csv",
      filename: file.name,
      uploaded_by: profile.id,
      date_from: dateFrom,
      date_to: dateTo,
      row_count: deduped.length,
    })
    .select("id")
    .single();
  if (uploadError || !upload) {
    return { error: "No se pudo registrar la carga: " + uploadError?.message };
  }

  const BATCH = 500;
  for (let i = 0; i < deduped.length; i += BATCH) {
    const batch = deduped.slice(i, i + BATCH);
    const { error } = await supabase.from("atenciones").upsert(
      batch.map((b) => ({ ...b, source_upload_id: upload.id })),
      { onConflict: "attention_id" },
    );
    if (error) return { error: error.message };
  }

  const { count: countAfter } = await supabase
    .from("atenciones")
    .select("*", { count: "exact", head: true });

  const insertedCount = (countAfter ?? 0) - (countBefore ?? 0);
  const updatedCount = deduped.length - insertedCount;

  await supabase
    .from("report_uploads")
    .update({ inserted_count: insertedCount, updated_count: updatedCount })
    .eq("id", upload.id);

  revalidatePath("/admin/reportes");
  return {
    error: null,
    summary: `Procesadas ${deduped.length} filas (${dateFrom} a ${dateTo}): ${insertedCount} nuevas, ${updatedCount} actualizadas (duplicados por fecha superpuesta fusionados automáticamente).`,
  };
}
