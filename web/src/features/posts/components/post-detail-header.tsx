import { Star } from "lucide-react";

type PostItem = {
  id: number;
  authorId: number;
  title: string;
  content: string;
  createdAt: string | number | Date;
};

type PostDetailHeaderProps = {
  post: PostItem;
  authorName: string;
  averageRating: number;
  ratingsCount: number;
  commentsCount: number;
};

function formatDate(value: string | number | Date | undefined) {
  if (!value) return "Hoje";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Hoje";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function PostDetailHeader({
  post,
  authorName,
  averageRating,
  ratingsCount,
  commentsCount,
}: PostDetailHeaderProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
          Discussão
        </span>
        <span className="text-sm text-slate-500">{formatDate(post.createdAt)}</span>
      </div>

      <h1 className="mt-5 text-3xl font-bold text-slate-900 md:text-4xl">
        {post.title}
      </h1>
      <p className="mt-3 text-sm font-medium text-slate-600">Por {authorName}</p>

      <p className="mt-6 whitespace-pre-line text-base leading-7 text-slate-700">
        {post.content}
      </p>

      <div className="mt-6 flex items-center gap-3 border-y border-slate-200 py-4 text-sm text-slate-700">
        <div className="inline-flex items-center gap-1.5">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span>{averageRating ? averageRating.toFixed(1) : "0.0"} / 5</span>
        </div>
        <span>•</span>
        <span>
          {ratingsCount} avaliação{ratingsCount === 1 ? "" : "es"}
        </span>
        <span>•</span>
        <span>
          {commentsCount} comentário{commentsCount === 1 ? "" : "s"}
        </span>
      </div>
    </article>
  );
}

