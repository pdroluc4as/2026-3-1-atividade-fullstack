"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { MessageSquareText, Star } from "lucide-react";

type PostComment = {
  id?: number;
  content?: string;
  authorId?: number;
  createdAt?: string | number | Date;
};

type PostRating = {
  id?: number;
  rating?: number;
  userId?: number;
  createdAt?: string | number | Date;
};

type PostCardProps = {
  id?: number;
  title?: string;
  description?: string;
  content?: string;
  author?: string;
  date?: string;
  category?: string;
  href?: string;
  comments?: PostComment[];
  ratings?: PostRating[];
  averageRating?: number | string;
};

export function PostCard({
  id,
  title,
  description,
  content,
  author = "Equipe",
  date = "Hoje",
  category = "Geral",
  href,
  comments = [],
  ratings = [],
  averageRating,
}: PostCardProps) {
  const router = useRouter();
  const postContent = content ?? description ?? "Sem conteúdo disponível.";
  const detailHref = href ?? (id ? `/posts/${id}` : "/posts");
  const totalRatings = ratings.length;
  const totalComments = comments.length;
  const computedAverage =
    typeof averageRating === "number"
      ? averageRating
      : typeof averageRating === "string"
        ? Number(averageRating)
        : totalRatings
          ? ratings.reduce((sum, item) => sum + Number(item.rating ?? 0), 0) /
            totalRatings
          : 0;

  function handleNavigation(event: React.MouseEvent<HTMLAnchorElement>) {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      event.preventDefault(); // Cancela a ida para detailHref
      router.push("/login"); // Leva o usuário para a página de login
    }
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between gap-4">
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
          {category}
        </span>
        <span className="text-xs text-slate-500">{date}</span>
      </div>

      <h2 className="mt-4 text-xl font-semibold text-slate-900">
        {title ?? "Post da comunidade"}
      </h2>

      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">
        {postContent}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-y border-slate-200 py-3 text-sm text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          {Number.isFinite(computedAverage)
            ? `${computedAverage.toFixed(1)} / 5`
            : "0.0 / 5"}
          <span className="text-slate-500">({totalRatings})</span>
        </span>

        <span className="inline-flex items-center gap-1.5">
          <MessageSquareText className="h-4 w-4 text-slate-500" />
          {totalComments} comentário{totalComments === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-700">Por {author}</span>

        <Link
          href={detailHref}
          onClick={handleNavigation}
          className="rounded-md bg-secondary px-3 py-2 text-sm font-medium text-white transition hover:bg-secondary/90"
        >
          Ver detalhes
        </Link>
      </div>
    </article>
  );
}
