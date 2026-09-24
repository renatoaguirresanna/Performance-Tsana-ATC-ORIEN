import { CATEGORICAL } from "@/lib/chart-colors";

export function BarList({
  data,
  limit = 8,
  colorAt,
}: {
  data: { key: string; value: number }[];
  limit?: number;
  colorAt?: (i: number) => string;
}) {
  const rows = data.slice(0, limit);
  const max = Math.max(...rows.map((d) => d.value), 1);
  const pickColor = colorAt ?? ((i: number) => CATEGORICAL[i % CATEGORICAL.length]);

  if (rows.length === 0) {
    return <p className="text-sm text-zinc-500">Sin datos todavía.</p>;
  }

  return (
    <div className="space-y-2.5">
      {rows.map((d, i) => (
        <div key={d.key} className="flex items-center gap-3 text-sm">
          <span className="w-36 shrink-0 truncate text-zinc-600 dark:text-zinc-400">
            {d.key}
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-full rounded-full"
              style={{ width: `${(d.value / max) * 100}%`, background: pickColor(i) }}
            />
          </div>
          <span className="w-14 shrink-0 text-right tabular-nums text-zinc-500">
            {d.value.toLocaleString("es-PE")}
          </span>
        </div>
      ))}
    </div>
  );
}
