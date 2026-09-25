import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeQuery } from "@/lib/normalize";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) {
    return NextResponse.json({ searchId: null, results: [] });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { data: results, error } = await supabase.rpc("search_kb", {
    search_query: q,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: logRow } = await supabase
    .from("search_queries")
    .insert({
      user_id: user.id,
      query_text: q,
      normalized_query: normalizeQuery(q),
      results_count: results?.length ?? 0,
    })
    .select("id")
    .single();

  return NextResponse.json({
    searchId: logRow?.id ?? null,
    results: results ?? [],
  });
}
