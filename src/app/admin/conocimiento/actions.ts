"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

function parseKeywords(raw: string): string[] {
  return raw
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}

export async function saveArticle(formData: FormData) {
  const profile = await requireAdmin();
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  const payload = {
    title: String(formData.get("title") ?? "").trim(),
    question: String(formData.get("question") ?? "").trim(),
    answer: String(formData.get("answer") ?? "").trim(),
    empresa: String(formData.get("empresa") ?? "").trim() || null,
    keywords: parseKeywords(String(formData.get("keywords") ?? "")),
    status: String(formData.get("status") ?? "draft"),
    updated_by: profile.id,
  };

  if (id) {
    await supabase.from("kb_articles").update(payload).eq("id", id);
  } else {
    await supabase
      .from("kb_articles")
      .insert({ ...payload, created_by: profile.id });
  }

  revalidatePath("/admin/conocimiento");
  redirect("/admin/conocimiento");
}

export async function deleteArticle(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  await supabase.from("kb_articles").delete().eq("id", id);
  revalidatePath("/admin/conocimiento");
}
