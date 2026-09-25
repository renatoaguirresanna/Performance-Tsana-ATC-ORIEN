import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArticleForm } from "../ArticleForm";

export default async function EditarArticuloPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: article } = await supabase
    .from("kb_articles")
    .select("id, title, question, answer, empresa, keywords, status")
    .eq("id", id)
    .single();

  if (!article) notFound();

  return (
    <div>
      <h2 className="mb-6 text-lg font-medium">Editar artículo</h2>
      <ArticleForm article={article} />
    </div>
  );
}
