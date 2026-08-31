"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/shared/components/ui/button";
import api, { ApiError } from "@/shared/lib/api";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await api.post<{
        access_token: string;
        avatarUrl?: string;
      }>("/auth/login", {
        username,
        password,
      });

      localStorage.setItem("token", response.access_token);
      localStorage.setItem("username", username);

      if (response.avatarUrl) {
        localStorage.setItem("avatarUrl", response.avatarUrl);
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Não foi possível entrar.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Nome de usuário
        </label>
        <input
          className="w-full rounded-md border placeholder-gray-400 text-black border-slate-300 px-3 py-2 outline-none transition focus:border-black"
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="seu_usuario"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Senha
        </label>
        <input
          className="w-full rounded-md border placeholder-gray-400 text-black border-slate-300 px-3 py-2 outline-none transition focus:border-black"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="********"
          required
        />
      </div>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
