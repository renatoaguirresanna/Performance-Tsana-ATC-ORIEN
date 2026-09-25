import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const { searchId, articleId } = await request.json();
  if (!searchId || !articleId) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // RLS restricts this update to the row's own owner (user_id = auth.uid()).
  await supabase
    .from("search_queries")
    .update({ clicked_article_id: articleId })
    .eq("id", searchId);

  return NextResponse.json({ ok: true });
}
