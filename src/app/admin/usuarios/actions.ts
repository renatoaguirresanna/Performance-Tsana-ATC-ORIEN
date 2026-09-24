"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function setRole(userId: string, role: "pending" | "agent" | "admin") {
  await requireAdmin(); // only admins/sub admins may change roles; RLS double-enforces this
  const supabase = await createClient();
  await supabase.from("profiles").update({ role }).eq("id", userId);
  revalidatePath("/admin/usuarios");
}
