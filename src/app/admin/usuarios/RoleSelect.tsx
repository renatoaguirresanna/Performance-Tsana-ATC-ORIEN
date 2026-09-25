"use client";

import { useTransition } from "react";
import { setRole } from "./actions";

const ROLE_LABEL: Record<string, string> = {
  pending: "Pendiente",
  agent: "ATC (buscador)",
  admin: "Admin / sub admin",
};

export function RoleSelect({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={currentRole}
      disabled={pending}
      onChange={(e) =>
        startTransition(() =>
          setRole(userId, e.target.value as "pending" | "agent" | "admin"),
        )
      }
      className="rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1 text-sm"
    >
      {Object.entries(ROLE_LABEL).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
