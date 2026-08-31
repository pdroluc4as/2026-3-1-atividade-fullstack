"use client";

import { SendHorizonal, UserRound } from "lucide-react";
import { useEffect, useState } from "react";

import api, { ApiError } from "@/shared/lib/api";

export function CreatePostBox() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedAvatar = window.localStorage.getItem("avatarUrl");
    if (storedAvatar) {
      setAvatarUrl(storedAvatar);
    }
  }, []);

  async function handleSubmit() {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle) {
      setError("Dê um título para a publicação.");
      return;
    }

    if (!trimmedContent) {
      setError("Escreva algo antes de publicar.");
      return;
    }

    if (!localStorage.getItem("token")) {
      setError("Você precisa estar autenticado para publicar.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await api.post("/posts", {
        title: trimmedTitle,
        content: trimmedContent,
      });

      setTitle("");
      setContent("");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Não foi possível publicar.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-6xl rounded-[1.75rem] border border-primary/70 bg-[#f5f2e8] p-5 shadow-sm md:p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#a7b6c7] text-white shadow-inner">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Foto do usuário"
              className="h-full w-full object-cover"
            />
          ) : (
            <UserRound className="h-8 w-8" />
          )}
        </div>

        <div className="flex-1 space-y-3">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Título da publicação"
            className="w-full border-none bg-transparent pl-2 text-[1.1rem] font-semibold text-slate-800 placeholder:text-slate-500 focus:outline-none md:text-[1.5rem]"
          />

          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Compartilhe suas ideias acadêmicas..."
            rows={3}
            className="w-full resize-none border-none bg-transparent pl-2 text-[1.1rem] text-slate-700 placeholder:text-slate-500 focus:outline-none md:text-[1.7rem]"
          />
        </div>
      </div>

      {error ? (
        <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <div className="mt-4 h-px w-full bg-slate-300" />

      <div className="mt-4 flex items-center justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !title.trim() || !content.trim()}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/60 md:px-8 md:text-xl"
        >
          <SendHorizonal className="h-5 w-5" />
          {isSubmitting ? "Publicando..." : "Post"}
        </button>
      </div>
    </section>
  );
}
