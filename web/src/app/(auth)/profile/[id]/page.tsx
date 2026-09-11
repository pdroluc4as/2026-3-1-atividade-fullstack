"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import api, { ApiError } from "@/shared/lib/api";

type UserProfile = {
  id: number;
  username: string;
  fullName: string;
  bio?: string | null;
  avatarUrl?: string | null;
};

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = Number(params?.id ?? 0);

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      if (typeof window === "undefined") return;

      const token = window.localStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }

      if (!userId) {
        setError("Usuário não encontrado.");
        setLoading(false);
        return;
      }

      try {
        const profile = await api.get<UserProfile>(`/users/${userId}`);
        setUser(profile);
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : "Não foi possível carregar o perfil.";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, [userId, router]);

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 text-center text-slate-600 shadow-sm ring-1 ring-slate-200">
          Carregando perfil...
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6 md:p-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error || "Perfil não encontrado."}
        </div>
      </div>
    );
  }

  const initial = (user.fullName || user.username || "U").charAt(0).toUpperCase();

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8">
        <div className="mb-4 flex items-center justify-start">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-200"
          >
            ← Voltar
          </button>
        </div>

        <div className="flex flex-col items-center gap-5 md:flex-row md:items-center">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={`Avatar de ${user.fullName || user.username}`}
              className="h-24 w-24 rounded-full border-4 border-slate-200 object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-200 text-2xl font-bold text-slate-700">
              {initial}
            </div>
          )}

          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
              Perfil
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">
              {user.fullName || user.username}
            </h1>
            <p className="mt-1 text-sm text-slate-600">@{user.username}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Nome completo</p>
            <p className="mt-2 text-lg font-medium text-slate-900">
              {user.fullName || "Não informado"}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Usuário</p>
            <p className="mt-2 text-lg font-medium text-slate-900">
              @{user.username || "Não informado"}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Bio</p>
          <p className="mt-2 text-base text-slate-700">
            {user.bio || "Sem biografia definida."}
          </p>
        </div>
      </div>
    </div>
  );
}

