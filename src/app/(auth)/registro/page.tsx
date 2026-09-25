"use client";

import { useActionState } from "react";
import Link from "next/link";
import { register, type AuthFormState } from "../actions";
import { Logo } from "@/components/Logo";

const initialState: AuthFormState = { error: null };

export default function RegistroPage() {
  const [state, formAction, pending] = useActionState(register, initialState);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4">
      <div className="mb-8">
        <Logo size="sm" />
      </div>
      <form
        action={formAction}
        className="w-full max-w-sm rounded-xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm"
      >
        <h2 className="mb-2 text-xl font-medium text-center">Crear cuenta</h2>
        <p className="mb-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Un administrador debe aprobar tu cuenta antes de que puedas entrar.
        </p>

        {state.error && (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {state.error}
          </p>
        )}

        <label className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
          Nombre completo
        </label>
        <input
          name="full_name"
          type="text"
          required
          className="mb-4 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 outline-none focus:border-[#4285F4]"
        />

        <label className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
          Correo
        </label>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mb-4 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 outline-none focus:border-[#4285F4]"
        />

        <label className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
          Contraseña
        </label>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="mb-6 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 outline-none focus:border-[#4285F4]"
        />

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-[#4285F4] px-4 py-2 font-medium text-white hover:bg-[#3367d6] disabled:opacity-60"
        >
          {pending ? "Creando cuenta..." : "Solicitar acceso"}
        </button>

        <p className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-[#4285F4] hover:underline">
            Inicia sesión
          </Link>
        </p>
      </form>
    </div>
  );
}
