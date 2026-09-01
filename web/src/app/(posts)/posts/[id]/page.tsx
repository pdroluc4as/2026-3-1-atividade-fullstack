"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Star } from "lucide-react";

import api, { ApiError } from "@/shared/lib/api";

type PostItem = {
  id: number;
  authorId: number;
  title: string;
  content: string;
  createdAt: string | number | Date;
};

type CommentItem = {
  id?: number;
  postId?: number;
  authorId?: number;
  content?: string;
  createdAt?: string | number | Date;
};

type RatingItem = {
  id?: number;
  postId?: number;
  userId?: number;
  rating?: number;
  createdAt?: string | number | Date;
};

type UserItem = {
  id: number;
  username?: string;
  fullName?: string;
};

function formatDate(value: string | number | Date | undefined) {
  if (!value) {
    return "Hoje";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Hoje";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = Number(params?.id ?? 0);

  const [post, setPost] = useState<PostItem | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [ratings, setRatings] = useState<RatingItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [comment, setComment] = useState("");
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadPostDetails() {
      if (!postId) {
        router.replace("/login");
        return;
      }

      try {
        const [postData, commentsData, ratingsData, usersData] =
          await Promise.all([
            api.get<PostItem>(`/posts/${postId}`),
            api.get<CommentItem[]>(`/comments?postId=${postId}`),
            api.get<RatingItem[]>(`/ratings/post/${postId}`),
            api.get<UserItem[]>("/users"),
          ]);

        setPost(postData);
        setComments(commentsData);
        setRatings(ratingsData);
        setUsers(usersData);
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : "Não foi possível carregar este post.";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    void loadPostDetails();
  }, [postId, router]);

  const averageRating = useMemo(() => {
    if (!ratings.length) {
      return 0;
    }

    const total = ratings.reduce(
      (sum, item) => sum + Number(item.rating ?? 0),
      0,
    );
    return total / ratings.length;
  }, [ratings]);

  async function handleCommentSubmit() {
    const trimmedComment = comment.trim();
    if (!trimmedComment) {
      setError("Escreva um comentário antes de enviar.");
      return;
    }

    if (!localStorage.getItem("token")) {
      setError("Você precisa estar autenticado para comentar.");
      return;
    }

    setSubmittingComment(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/comments", {
        postId,
        content: trimmedComment,
      });

      const nextComments = await api.get<CommentItem[]>(
        `/comments?postId=${postId}`,
      );
      setComments(nextComments);
      setComment("");
      setSuccess("Comentário enviado com sucesso.");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Não foi possível enviar o comentário.";
      setError(message);
    } finally {
      setSubmittingComment(false);
    }
  }

  async function handleRatingSubmit() {
    if (!selectedRating) {
      setError("Selecione uma avaliação de 1 a 5.");
      return;
    }

    if (!localStorage.getItem("token")) {
      setError("Você precisa estar autenticado para avaliar.");
      return;
    }

    setSubmittingRating(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/ratings", {
        postId,
        rating: Number(selectedRating),
      });

      const nextRatings = await api.get<RatingItem[]>(
        `/ratings/post/${postId}`,
      );
      setRatings(nextRatings);
      setSuccess("Avaliação enviada com sucesso.");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Não foi possível enviar a avaliação.";
      setError(message);
    } finally {
      setSubmittingRating(false);
    }
  }

  if (loading) {
    return (
      <main className="p-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
          Carregando publicação...
        </div>
      </main>
    );
  }

  if (error && !post) {
    return (
      <main className="p-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error}
        </div>
      </main>
    );
  }

  const author = users.find(
    (user) => Number(user.id) === Number(post?.authorId),
  );
  const authorName = author?.username || author?.fullName || "Usuário";

  return (
    <main className="p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
        >
          Voltar
        </button>

        {post ? (
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
                Discussão
              </span>
              <span className="text-sm text-slate-500">
                {formatDate(post.createdAt)}
              </span>
            </div>

            <h1 className="mt-5 text-3xl font-bold text-slate-900 md:text-4xl">
              {post.title}
            </h1>
            <p className="mt-3 text-sm font-medium text-slate-600">
              Por {authorName}
            </p>

            <p className="mt-6 whitespace-pre-line text-base leading-7 text-slate-700">
              {post.content}
            </p>

            <div className="mt-6 flex items-center gap-3 border-y border-slate-200 py-4 text-sm text-slate-700">
              <div className="inline-flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span>
                  {averageRating ? averageRating.toFixed(1) : "0.0"} / 5
                </span>
              </div>
              <span>•</span>
              <span>
                {ratings.length} avaliação{ratings.length === 1 ? "" : "es"}
              </span>
              <span>•</span>
              <span>
                {comments.length} comentário{comments.length === 1 ? "" : "s"}
              </span>
            </div>
          </article>
        ) : null}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Avaliar publicação
          </h2>

          <div className="mt-4 flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((value) => {
              const isFilled = value <= (hoverRating || selectedRating);

              return (
                <button
                  key={value}
                  type="button"
                  onMouseEnter={() => setHoverRating(value)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setSelectedRating(value)}
                  className={`rounded-full border p-2 transition ${
                    isFilled
                      ? "border-amber-400 bg-amber-50 text-amber-500"
                      : "border-slate-200 bg-white text-slate-400 hover:border-slate-300"
                  }`}
                  aria-label={`Avaliar com ${value} estrela${value > 1 ? "s" : ""}`}
                >
                  <Star
                    className={`h-5 w-5 ${isFilled ? "fill-current" : "fill-transparent"}`}
                  />
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleRatingSubmit}
            disabled={submittingRating || !selectedRating}
            className="mt-4 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/60"
          >
            {submittingRating ? "Enviando..." : "Enviar avaliação"}
          </button>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Comentários</h2>

          <div className="mt-4 space-y-3">
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={4}
              placeholder="Escreva seu comentário..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none"
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleCommentSubmit}
                disabled={submittingComment || !comment.trim()}
                className="rounded-full bg-secondary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-secondary/90 disabled:cursor-not-allowed disabled:bg-secondary/60"
              >
                {submittingComment ? "Enviando..." : "Comentar"}
              </button>
            </div>
          </div>

          {(error || success) && (
            <div
              className={`mt-4 rounded-xl border px-3 py-2 text-sm ${error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}
            >
              {error || success}
            </div>
          )}

          <div className="mt-6 space-y-4">
            {comments.length === 0 ? (
              <p className="text-sm text-slate-500">
                Ainda não há comentários neste post.
              </p>
            ) : (
              comments.map((item) => {
                const commentAuthor = users.find(
                  (user) => Number(user.id) === Number(item.authorId),
                );
                const commentAuthorName =
                  commentAuthor?.username ||
                  commentAuthor?.fullName ||
                  "Usuário";

                return (
                  <div
                    key={item.id ?? `${item.authorId}-${item.createdAt}`}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-700">
                        {commentAuthorName}
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {item.content}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
