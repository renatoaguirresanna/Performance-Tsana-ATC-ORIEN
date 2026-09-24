import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type UserRole = "pending" | "agent" | "admin";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
};

/** Returns the signed-in user's profile, or null if not signed in. */
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .single();

  return profile as Profile | null;
}

/** Redirects to /login if signed out, /pendiente if not yet approved. */
export async function requireProfile(): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.role === "pending") redirect("/pendiente");
  return profile;
}

/** Redirects anyone who isn't an admin (sub admin) away from admin-only pages. */
export async function requireAdmin(): Promise<Profile> {
  const profile = await requireProfile();
  if (profile.role !== "admin") redirect("/");
  return profile;
}
