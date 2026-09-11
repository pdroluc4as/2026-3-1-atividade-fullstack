"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/shared/components/ui/button";
import api, { ApiError } from "@/shared/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    fullName: "",
    bio: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await api.post<{
        access_token: string;
        avatarUrl?: string;
      }>("/auth/register", {
        username: form.username,
        fullName: form.fullName,
        bio: form.bio || null,
        password: form.password,
      });

      localStorage.setItem("token", response.access_token);
      localStorage.setItem("username", form.username);
      localStorage.setItem("fullName", form.fullName);
      localStorage.setItem("bio", form.bio || "");

      if (response.avatarUrl) {
        localStorage.setItem("avatarUrl", response.avatarUrl);
      }

      window.dispatchEvent(new Event("auth-change"));

      router.push("/");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Não foi possível criar a conta.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <section className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          Cadastro
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-900">
          Criar conta
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Comece a participar da comunidade como usuário anônimo.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Nome de usuário
            </label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              className="w-full placeholder-gray-400 text-black rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-black"
              type="text"
              placeholder="seu_usuario"
              required
              minLength={3}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Nome completo
            </label>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              className="w-full placeholder-gray-400 text-black rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-black"
              type="text"
              placeholder="Seu nome completo"
              required
              minLength={2}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Biografia
            </label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              className="min-h-24 w-full placeholder-gray-400 text-black rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-black"
              placeholder="Conte um pouco sobre você"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Senha
            </label>
            <input
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full placeholder-gray-400 text-black rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-black"
              type="password"
              placeholder="********"
              required
              minLength={6}
            />
          </div>

          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          ) : null}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Cadastrando..." : "Cadastrar"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          Já possui conta?{" "}
          <Link href="/login" className="font-medium text-slate-900 underline">
            Entrar
          </Link>
        </p>
      </section>
    </div>
  );
}
