"use client";

import { useActionState } from "react";
import { uploadAtencionesCsv } from "./actions";

type State = { error: string | null; summary?: string };
const initial: State = { error: null };

async function action(_prev: State, formData: FormData): Promise<State> {
  return uploadAtencionesCsv(formData);
}

export function UploadForm() {
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="flex flex-col gap-3 max-w-md">
      <label className="text-sm text-zinc-600 dark:text-zinc-400">
        Reporte de atenciones (CSV, separado por &ldquo;;&rdquo;)
      </label>
      <input
        type="file"
        name="file"
        accept=".csv"
        required
        className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 dark:file:bg-zinc-800 file:px-3 file:py-2 file:text-sm"
      />
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-md bg-[#4285F4] px-4 py-2 text-sm font-medium text-white hover:bg-[#3367d6] disabled:opacity-60"
      >
        {pending ? "Procesando…" : "Subir y fusionar"}
      </button>
      {state.error && <p className="text-sm text-[#EA4335]">{state.error}</p>}
      {state.summary && (
        <p className="text-sm text-[#0ca30c]">{state.summary}</p>
      )}
      <p className="text-xs text-zinc-500">
        Los registros se fusionan por <code>attention_id</code>: si un rango de
        fechas se superpone con una carga anterior, los duplicados se
        sobrescriben y los datos nuevos de días sin cubrir se agregan.
      </p>
    </form>
  );
}
