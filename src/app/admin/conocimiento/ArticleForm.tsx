import { saveArticle } from "./actions";

type Article = {
  id?: string;
  title?: string;
  question?: string;
  answer?: string;
  empresa?: string | null;
  keywords?: string[];
  status?: string;
};

export function ArticleForm({ article }: { article?: Article }) {
  return (
    <form action={saveArticle} className="max-w-2xl space-y-4">
      {article?.id && <input type="hidden" name="id" value={article.id} />}

      <Field label="Título interno">
        <input
          name="title"
          required
          defaultValue={article?.title}
          placeholder='Ej: "BCP - cobertura de nutrición"'
          className="input"
        />
      </Field>

      <Field label="Pregunta (como la escribiría ATC)">
        <input
          name="question"
          required
          defaultValue={article?.question}
          placeholder="¿BCP cuenta con orientación de nutrición?"
          className="input"
        />
      </Field>

      <Field label="Respuesta">
        <textarea
          name="answer"
          required
          rows={6}
          defaultValue={article?.answer}
          className="input"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Empresa / convenio">
          <input
            name="empresa"
            defaultValue={article?.empresa ?? ""}
            placeholder="BCP, Yape, Pacífico..."
            className="input"
          />
        </Field>
        <Field label="Estado">
          <select
            name="status"
            defaultValue={article?.status ?? "draft"}
            className="input"
          >
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
            <option value="archived">Archivado</option>
          </select>
        </Field>
      </div>

      <Field label="Palabras clave (separadas por coma)">
        <input
          name="keywords"
          defaultValue={article?.keywords?.join(", ")}
          placeholder="nutricion, bcp, cobertura"
          className="input"
        />
      </Field>

      <button
        type="submit"
        className="rounded-md bg-[#4285F4] px-5 py-2 font-medium text-white hover:bg-[#3367d6]"
      >
        Guardar
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
        {label}
      </span>
      {children}
    </label>
  );
}
