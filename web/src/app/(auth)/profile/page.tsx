"use client";

import { Check, LogOut, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/shared/components/ui/button";
import api, { ApiError } from "@/shared/lib/api";

type UserProfile = {
  id: number;
  username: string;
  fullName: string;
  bio?: string | null;
  avatarUrl: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState({
    username: "",
    fullName: "",
    bio: "Sem biografia definida.",
    avatarUrl: "",
  });
  const [form, setForm] = useState({
    username: "",
    fullName: "",
    bio: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  function handleLogout() {
    if (typeof window === "undefined") return;

    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("fullName");
    localStorage.removeItem("bio");
    localStorage.removeItem("avatarUrl");

    router.replace("/login");
  }

  useEffect(() => {
    async function loadProfile() {
      if (typeof window === "undefined") return;

      const token = window.localStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const payload = JSON.parse(
          atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
        ) as { sub?: number; id?: number };

        const userId = Number(payload.sub ?? payload.id);

        if (!userId) {
          throw new Error("Usuário não identificado");
        }

        const profile = await api.get<UserProfile>(`/users/${userId}`);

        const nextUser = {
          username: profile.username,
          fullName: profile.fullName,
          bio: profile.bio || "Sem biografia definida.",
          avatarUrl: profile.avatarUrl || "",
        };

        setUser(nextUser);
        setForm({
          username: profile.username,
          fullName: profile.fullName,
          bio: profile.bio || "",
        });

        window.localStorage.setItem("username", profile.username);
        window.localStorage.setItem("fullName", profile.fullName);
        window.localStorage.setItem("bio", profile.bio || "");
        window.localStorage.setItem("avatarUrl", profile.avatarUrl || "");
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : "Não foi possível carregar o perfil.";
        setError(message);

        const username = window.localStorage.getItem("username") ?? "Usuário";
        const fullName = window.localStorage.getItem("fullName") ?? username;
        const bio =
          window.localStorage.getItem("bio") ?? "Sem biografia definida.";
        const avatarUrl = window.localStorage.getItem("avatarUrl") ?? "";

        setUser({ username, fullName, bio, avatarUrl });
      }
    }

    void loadProfile();
  }, [router]);

  async function handleSaveProfile() {
    if (typeof window === "undefined") return;

    const token = window.localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setError("");
      setSuccess("");
      setIsSaving(true);

      const payload = JSON.parse(
        atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
      ) as { sub?: number; id?: number };

      const userId = Number(payload.sub ?? payload.id);

      const updatedProfile = await api.patch<UserProfile>(`/users/${userId}`, {
        fullName: form.fullName,
        username: form.username,
        bio: form.bio || null,
      });

      const nextUser = {
        username: updatedProfile.username,
        fullName: updatedProfile.fullName,
        bio: updatedProfile.bio || "Sem biografia definida.",
        avatarUrl: updatedProfile.avatarUrl || user.avatarUrl,
      };

      setUser(nextUser);
      setForm({
        username: updatedProfile.username,
        fullName: updatedProfile.fullName,
        bio: updatedProfile.bio || "",
      });
      setSuccess("Perfil atualizado com sucesso.");
      setIsEditing(false);

      window.localStorage.setItem("username", updatedProfile.username);
      window.localStorage.setItem("fullName", updatedProfile.fullName);
      window.localStorage.setItem("bio", updatedProfile.bio || "");
      window.localStorage.setItem(
        "avatarUrl",
        updatedProfile.avatarUrl || user.avatarUrl,
      );
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Não foi possível salvar alterações.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8">
        <div className="mb-4 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsEditing((current) => !current)}
            className="inline-flex items-center gap-2"
          >
            <Pencil className="h-4 w-4" />
            {isEditing ? "Cancelar" : "Editar"}
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={handleLogout}
            className="inline-flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>

        {error ? (
          <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        ) : null}

        {success ? (
          <p className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-600">
            {success}
          </p>
        ) : null}

        <div className="flex flex-col items-center gap-5 md:flex-row md:items-center">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt="Avatar do usuário"
              className="h-24 w-24 rounded-full border-4 border-slate-200 object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-200 text-2xl font-bold text-slate-700">
              {user.fullName?.charAt(0)?.toUpperCase() || "U"}
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

        {isEditing ? (
          <div className="mt-8 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Nome completo
              </label>
              <input
                value={form.fullName}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    fullName: event.target.value,
                  }))
                }
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Nome de usuário
              </label>
              <input
                value={form.username}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    username: event.target.value,
                  }))
                }
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Biografia
              </label>
              <textarea
                value={form.bio}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    bio: event.target.value,
                  }))
                }
                rows={4}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-500"
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="inline-flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                {isSaving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        ) : (
          <>
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
              <p className="mt-2 text-base text-slate-700">{user.bio}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
